import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  ShoppingBag,
  Truck,
  PackageCheck,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Filter,
  Building2,
  MapPin,
  Calendar,
  IndianRupee,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { SearchBar } from '../../components/common/SearchBar';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { formatINR } from '../../data/inventoryBillingData';

export const SupplierOrdersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialFilter = searchParams.get('filter') || 'all';

  const {
    purchaseOrders,
    updatePOStatus,
    currentUser,
    restaurants,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [selectedPO, setSelectedPO] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Dispatch Modal State
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [dispatchTargetPO, setDispatchTargetPO] = useState(null);
  const [dispatchForm, setDispatchForm] = useState({
    invoiceNumber: '',
    deliveryChallan: '',
    dispatchDate: new Date().toISOString().split('T')[0],
    vehicleInfo: 'Refrigerated Van MH-12-BG-4421',
  });

  const handleOpenDispatch = (po) => {
    setDispatchTargetPO(po);
    setDispatchForm({
      invoiceNumber: `SINV-2026-${po.poNumber.replace(/[^0-9]/g, '') || Math.floor(100 + Math.random() * 900)}`,
      deliveryChallan: `DC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      dispatchDate: new Date().toISOString().split('T')[0],
      vehicleInfo: 'Refrigerated Delivery Van MH-12-BG-4421',
    });
    setDispatchModalOpen(true);
  };

  const handleConfirmDispatch = (e) => {
    e.preventDefault();
    if (!dispatchTargetPO) return;

    updatePOStatus(
      dispatchTargetPO.id,
      'dispatched',
      `Goods dispatched with Invoice #${dispatchForm.invoiceNumber} and Challan #${dispatchForm.deliveryChallan}`,
      {
        invoiceNumber: dispatchForm.invoiceNumber,
        deliveryChallan: dispatchForm.deliveryChallan,
        dispatchDate: dispatchForm.dispatchDate,
        vehicleInfo: dispatchForm.vehicleInfo,
      }
    );
    setDispatchModalOpen(false);
    setDispatchTargetPO(null);
  };

  // Filter only orders assigned to this supplier!
  const myOrders = purchaseOrders.filter(
    (po) =>
      ((currentUser?.supplierId && po.supplierId === currentUser.supplierId) ||
       (currentUser?.supplierName && po.supplierName === currentUser.supplierName))
  );

  const filteredOrders = myOrders.filter((po) => {
    const matchesSearch =
      po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.restaurantName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || po.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      header: 'PO Number & Date',
      accessor: 'poNumber',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.poNumber}</div>
          <div className="text-xs text-slate-400">
            {new Date(row.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      ),
    },
    {
      header: 'Ordering Restaurant',
      accessor: 'restaurantName',
      sortable: true,
      render: (row) => {
        const rest = restaurants.find(r => r.id === row.restaurantId);
        return (
          <div className="text-xs">
            <div className="font-bold text-slate-800">{row.restaurantName}</div>
            <div className="text-slate-500 truncate max-w-[170px]">{rest?.address || 'Restaurant Dock'}</div>
          </div>
        );
      },
    },
    {
      header: 'Items Manifest',
      accessor: 'items',
      render: (row) => (
        <div className="text-xs">
          <span className="font-bold text-slate-800">{row.items.length} items</span>
          <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
            {row.items.map(it => `${it.quantity} ${it.unit} ${it.name}`).join(', ')}
          </div>
        </div>
      ),
    },
    {
      header: 'Order Value',
      accessor: 'totalAmount',
      sortable: true,
      render: (row) => (
        <div className="text-xs">
          <div className="font-extrabold text-slate-900">{formatINR(row.totalAmount)}</div>
          <div className="text-[10px] text-slate-400">Net 30</div>
        </div>
      ),
    },
    {
      header: 'Fulfilment Status',
      accessor: 'status',
      sortable: true,
      render: (row) => <Badge status={row.status} />,
    },
    {
      header: 'Supplier Actions (Workflow C)',
      accessor: 'id',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="xs"
            icon={Eye}
            onClick={() => {
              setSelectedPO(row);
              setDetailsModalOpen(true);
            }}
          >
            Manifest
          </Button>

          {row.status === 'pending' && (
            <>
              <Button
                variant="success"
                size="xs"
                onClick={() => updatePOStatus(row.id, 'accepted')}
              >
                Accept
              </Button>
              <Button
                variant="outline"
                size="xs"
                className="text-rose-600 border-rose-200"
                onClick={() => updatePOStatus(row.id, 'rejected', 'Stock unavailable at depot')}
              >
                Reject
              </Button>
            </>
          )}

          {row.status === 'accepted' && (
            <Button
              variant="brand"
              size="xs"
              icon={Truck}
              onClick={() => handleOpenDispatch(row)}
            >
              Dispatch Goods
            </Button>
          )}

          {row.status === 'dispatched' && (
            <Button
              variant="success"
              size="xs"
              icon={PackageCheck}
              onClick={() => updatePOStatus(row.id, 'delivered')}
            >
              Mark Delivered
            </Button>
          )}

          {row.status === 'delivered' && (
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Delivered
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assigned Purchase Orders"
        subtitle={`Live orders assigned to ${currentUser.supplierName || 'Metro Food Distributors'}`}
        breadcrumbs={[
          { label: 'Supplier', href: '#/supplier' },
          { label: 'Assigned Orders' },
        ]}
      />

      {/* Supplier Order Processing Notice */}
      <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <strong className="block font-semibold">Wholesale Fulfillment Instructions:</strong>
          Review incoming orders from restaurant clients. Click <strong>"Accept Order"</strong>, prepare the delivery challan, and update status to <strong>"Mark Dispatched"</strong> and <strong>"Mark Delivered"</strong> upon drop-off.
        </div>
      </div>

      {/* Search and Status Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by PO number or restaurant..."
          className="w-full sm:w-80"
        />

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'pending', 'accepted', 'dispatched', 'delivered', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition-all select-none ${
                statusFilter === f
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredOrders}
        pageSize={8}
        emptyTitle="No assigned purchase orders"
        emptyDescription="Orders created by restaurant partners for this supplier appear here."
      />

      {/* Order Details & Fulfilment Modal */}
      {selectedPO && (
        <Modal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          title={`Order Manifest: ${selectedPO.poNumber}`}
          subtitle={`Client: ${selectedPO.restaurantName} • Expected Delivery: ${selectedPO.expectedDelivery}`}
          maxWidth="max-w-2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-500 font-medium">
                Total Billable: <strong className="text-slate-900">${selectedPO.totalAmount.toFixed(2)}</strong>
              </span>

              <div className="flex items-center gap-2">
                {selectedPO.status === 'pending' && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => {
                      updatePOStatus(selectedPO.id, 'accepted');
                      setDetailsModalOpen(false);
                    }}
                  >
                    Accept Order
                  </Button>
                )}

                {selectedPO.status === 'accepted' && (
                  <Button
                    variant="brand"
                    size="sm"
                    icon={Truck}
                    onClick={() => {
                      updatePOStatus(selectedPO.id, 'dispatched');
                      setDetailsModalOpen(false);
                    }}
                  >
                    Mark Dispatched
                  </Button>
                )}

                {selectedPO.status === 'dispatched' && (
                  <Button
                    variant="success"
                    size="sm"
                    icon={PackageCheck}
                    onClick={() => {
                      updatePOStatus(selectedPO.id, 'delivered');
                      setDetailsModalOpen(false);
                    }}
                  >
                    Mark Delivered
                  </Button>
                )}

                <Button variant="secondary" size="sm" onClick={() => setDetailsModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Restaurant delivery instructions */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <span className="font-semibold text-slate-800 block">Delivery Address & Instructions:</span>
              <p className="text-slate-600 mt-1">
                {restaurants.find(r => r.id === selectedPO.restaurantId)?.address || 'Main Kitchen Receiving Bay'}
              </p>
              <p className="text-slate-500 mt-0.5 italic">
                Note: "{selectedPO.notes || 'Handle refrigerated items with care'}"
              </p>
            </div>

            {/* Line items manifest */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Item Requested</th>
                    <th className="p-3 text-center">Required Qty</th>
                    <th className="p-3 text-right">Agreed Rate</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedPO.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-semibold text-slate-800">{it.name}</td>
                      <td className="p-3 text-center font-bold">{it.quantity} {it.unit}</td>
                      <td className="p-3 text-right text-slate-600">{formatINR(it.unitCost)}</td>
                      <td className="p-3 text-right font-bold text-slate-900">{formatINR(it.totalCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Timeline */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Order Fulfillment History
              </span>
              <div className="space-y-2 border-l-2 border-slate-200 pl-3 ml-1 text-xs">
                {selectedPO.timeline?.map((step, sIdx) => (
                  <div key={sIdx} className="relative">
                    <span className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-700"></span>
                    <div className="font-semibold text-slate-800">{step.note}</div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(step.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Dispatch Order with Sales Invoice & Challan */}
      {dispatchModalOpen && dispatchTargetPO && (
        <Modal
          isOpen={dispatchModalOpen}
          onClose={() => setDispatchModalOpen(false)}
          title={`Dispatch Order ${dispatchTargetPO.poNumber}`}
          subtitle={`Generate dispatch manifest and sales invoice for ${dispatchTargetPO.restaurantName}`}
          size="md"
        >
          <form onSubmit={handleConfirmDispatch} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Destination:</span>
                <span className="font-bold text-slate-800">{dispatchTargetPO.restaurantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Items:</span>
                <span className="font-semibold text-slate-800">{dispatchTargetPO.items.length} items</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Order Value:</span>
                <span className="font-bold text-slate-900">${dispatchTargetPO.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <FormInput
              label="Supplier Sales Invoice Number *"
              type="text"
              value={dispatchForm.invoiceNumber}
              onChange={(e) => setDispatchForm({ ...dispatchForm, invoiceNumber: e.target.value })}
              required
            />

            <FormInput
              label="Delivery Challan / Transit Note Number *"
              type="text"
              value={dispatchForm.deliveryChallan}
              onChange={(e) => setDispatchForm({ ...dispatchForm, deliveryChallan: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <FormInput
                label="Dispatch Date *"
                type="date"
                value={dispatchForm.dispatchDate}
                onChange={(e) => setDispatchForm({ ...dispatchForm, dispatchDate: e.target.value })}
                required
              />

              <FormInput
                label="Transport / Vehicle Info *"
                type="text"
                value={dispatchForm.vehicleInfo}
                onChange={(e) => setDispatchForm({ ...dispatchForm, vehicleInfo: e.target.value })}
                required
              />
            </div>

            <p className="text-[11px] text-slate-500">
              The restaurant inventory dock will receive this shipment along with the Invoice and Challan references for GRN verification.
            </p>

            <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDispatchModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="brand"
                size="sm"
                icon={Truck}
              >
                Confirm Dispatch
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

