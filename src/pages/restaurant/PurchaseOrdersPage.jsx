import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  ShoppingBag,
  Store,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  AlertTriangle,
  Eye,
  ArrowRight,
  ShieldCheck,
  Layers,
  Calendar,
  IndianRupee,
  UserCheck,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { SearchBar } from '../../components/common/SearchBar';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { formatINR } from '../../data/inventoryBillingData';

export const PurchaseOrdersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialAction = searchParams.get('action');
  const initialSupplierId = searchParams.get('supplierId');

  const {
    restaurantOrders,
    restaurantSuppliers,
    restaurantIngredients,
    createPurchaseOrder,
    approvePurchaseOrder,
    verifyAndReceiveStock,
    receivePOAndStock,
    currentUser,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(initialAction === 'create');
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);

  // Verification Form State
  const [verificationForm, setVerificationForm] = useState({
    batchNumber: 'BCH-REC-' + Math.floor(100 + Math.random() * 900),
    expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'Verified packaging intact, cold chain maintained, quantities confirmed.',
  });

  // Create PO Form State
  const defaultSupplier = initialSupplierId
    ? restaurantSuppliers.find(s => s.id === initialSupplierId) || restaurantSuppliers[0]
    : restaurantSuppliers[0];

  const [poForm, setPoForm] = useState({
    supplierId: defaultSupplier?.id || '',
    expectedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'Urgent weekend inventory replenishment.',
    items: [
      {
        ingredientId: restaurantIngredients[0]?.id || '',
        name: restaurantIngredients[0]?.name || '',
        quantity: 20,
        unit: restaurantIngredients[0]?.unit || 'kg',
        unitCost: restaurantIngredients[0]?.costPerUnit || 5.0,
      },
    ],
  });

  useEffect(() => {
    if (initialAction === 'create') {
      setIsCreateModalOpen(true);
    }
  }, [initialAction]);

  const handleAddItemRow = () => {
    const firstIng = restaurantIngredients[0];
    setPoForm({
      ...poForm,
      items: [
        ...poForm.items,
        {
          ingredientId: firstIng?.id || '',
          name: firstIng?.name || 'Item',
          quantity: 10,
          unit: firstIng?.unit || 'kg',
          unitCost: firstIng?.costPerUnit || 4.0,
        },
      ],
    });
  };

  const handleRemoveItemRow = (index) => {
    setPoForm({
      ...poForm,
      items: poForm.items.filter((_, i) => i !== index),
    });
  };

  const handleItemSelect = (index, ingredientId) => {
    const ing = restaurantIngredients.find(i => i.id === ingredientId);
    if (!ing) return;
    const updated = [...poForm.items];
    updated[index] = {
      ingredientId: ing.id,
      name: ing.name,
      quantity: updated[index]?.quantity || 10,
      unit: ing.unit,
      unitCost: ing.costPerUnit,
    };
    setPoForm({ ...poForm, items: updated });
  };

  const handleItemFieldChange = (index, field, val) => {
    const updated = [...poForm.items];
    updated[index] = { ...updated[index], [field]: val };
    setPoForm({ ...poForm, items: updated });
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (poForm.items.length === 0) {
      alert('Please add at least one ingredient to the purchase order.');
      return;
    }
    const newPO = createPurchaseOrder(poForm);
    setIsCreateModalOpen(false);
  };

  const handleOpenVerify = (po) => {
    setSelectedPO(po);
    setVerificationForm({
      batchNumber: 'BCH-REC-' + Math.floor(100 + Math.random() * 900),
      expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'All items inspected, cold chain verified, quantities match PO manifest.',
    });
    setVerifyModalOpen(true);
  };

  const handleConfirmVerification = (e) => {
    e.preventDefault();
    if (selectedPO) {
      verifyAndReceiveStock(selectedPO.id, verificationForm);
      setVerifyModalOpen(false);
      if (detailsModalOpen) setDetailsModalOpen(false);
    }
  };

  const filteredOrders = restaurantOrders.filter((po) => {
    const matchesSearch =
      po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchTerm.toLowerCase());

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
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <span>{row.poNumber}</span>
          </div>
          <div className="text-xs text-slate-400">
            {new Date(row.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      ),
    },
    {
      header: 'Assigned Supplier',
      accessor: 'supplierName',
      sortable: true,
      render: (row) => (
        <div className="text-xs">
          <div className="font-semibold text-slate-800">{row.supplierName}</div>
          <div className="text-slate-400 truncate max-w-[160px]">{row.supplierContact}</div>
        </div>
      ),
    },
    {
      header: 'Items Ordered',
      accessor: 'items',
      render: (row) => (
        <div className="text-xs">
          <span className="font-bold text-slate-800">{row.items.length} item(s)</span>
          <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
            {row.items.map(it => `${it.quantity} ${it.unit} ${it.name}`).join(', ')}
          </div>
        </div>
      ),
    },
    {
      header: 'Total Value',
      accessor: 'totalAmount',
      sortable: true,
      render: (row) => (
        <div className="text-xs">
          <div className="font-extrabold text-slate-900">{formatINR(row.totalAmount)}</div>
          <div className="text-[10px] text-slate-400">Incl. tax & delivery</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (row) => <Badge status={row.status} />,
    },
    {
      header: 'Actions',
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
            Details
          </Button>

          {/* Owner / Admin Direct Requisition Fallback (if any legacy PO pending approval) */}
          {row.status === 'pending_approval' &&
            (currentUser?.role === 'restaurant_owner' || currentUser?.role === 'super_admin') && (
              <Button
                variant="brand"
                size="xs"
                icon={CheckCircle2}
                onClick={() => approvePurchaseOrder(row.id)}
              >
                Approve PO
              </Button>
            )}

          {/* Full Line-Item GRN Receiving Dock Verification */}
          {(row.status === 'delivered' || row.status === 'dispatched') && !row.verifiedAt && currentUser.role !== 'kitchen_staff' && (
            <Button
              variant="brand"
              size="xs"
              icon={PackageCheck}
              onClick={() => navigate(`/goods-receiving?poId=${row.id}`)}
            >
              GRN Dock
            </Button>
          )}

          {/* Quick inline verify */}
          {row.status === 'delivered' && !row.verifiedAt && currentUser.role !== 'kitchen_staff' && (
            <Button
              variant="outline"
              size="xs"
              onClick={() => handleOpenVerify(row)}
            >
              Quick Check
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders & Procurement"
        subtitle="Manage supplier requisitions, 4-stage PO lifecycle, and dock receiving"
        breadcrumbs={[
          { label: 'Restaurant', href: '#/dashboard' },
          { label: 'Purchase Orders' },
        ]}
        actions={
          currentUser.role !== 'kitchen_staff' && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={Store}
                onClick={() => navigate('/marketplace')}
              >
                B2B Marketplace
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={PackageCheck}
                onClick={() => navigate('/goods-receiving')}
              >
                Receiving Dock (GRN)
              </Button>
              <Button
                variant="brand"
                size="sm"
                icon={Plus}
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create Purchase Order
              </Button>
            </div>
          )
        }
      />

      {/* Purchase Orders Workflow Notice */}
      <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <span className="w-5 h-5 rounded-full bg-teal-700 text-white flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
            PO
          </span>
          <div>
            <strong className="block font-semibold">Purchase Order &amp; Delivery Verification:</strong>
            Issue digital purchase orders to wholesale suppliers. Once delivered to your dock, click <strong>"Verify &amp; Receive Stock"</strong> to inspect accepted vs. damaged quantities. Verified stock automatically enters inventory.
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by PO number or supplier..."
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

      {/* Orders Table */}
      <DataTable
        columns={columns}
        data={filteredOrders}
        pageSize={8}
        emptyTitle="No purchase orders found"
        emptyDescription="Create your first purchase order to reorder depleted inventory."
      />

      {/* Create Purchase Order Modal (Workflow C Steps 2-4) */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Purchase Order"
        subtitle="Specify vendor, items, quantities, and delivery dispatch window"
        maxWidth="max-w-2xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="brand" icon={ShoppingBag} onClick={handleCreateSubmit}>
              Submit PO (Status: Pending)
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Select Supplier"
              name="supplierId"
              type="select"
              value={poForm.supplierId}
              onChange={(e) => setPoForm({ ...poForm, supplierId: e.target.value })}
              options={restaurantSuppliers.map(s => ({ label: `${s.name} (${s.paymentTerms})`, value: s.id }))}
              required
            />

            <FormInput
              label="Expected Delivery Date"
              name="expectedDelivery"
              type="date"
              value={poForm.expectedDelivery}
              onChange={(e) => setPoForm({ ...poForm, expectedDelivery: e.target.value })}
              required
            />
          </div>

          {/* Line items table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Order Line Items
              </label>
              <Button
                variant="ghost"
                size="xs"
                icon={Plus}
                onClick={handleAddItemRow}
              >
                Add Another Item
              </Button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto p-1">
              {poForm.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex-1">
                    <select
                      value={item.ingredientId}
                      onChange={(e) => handleItemSelect(idx, e.target.value)}
                      className="w-full text-xs font-medium py-1.5 px-2 rounded-lg border border-slate-300 bg-white"
                    >
                      {restaurantIngredients.map(ing => (
                        <option key={ing.id} value={ing.id}>
                          {ing.name} (${ing.costPerUnit}/{ing.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-24">
                    <input
                      type="number"
                      step="any"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemFieldChange(idx, 'quantity', Number(e.target.value))}
                      placeholder="Qty"
                      className="w-full text-xs py-1.5 px-2 rounded-lg border border-slate-300 bg-white text-center font-bold"
                    />
                  </div>

                  <span className="text-xs text-slate-500 font-medium w-12">{item.unit}</span>

                  <span className="text-xs font-bold text-slate-800 w-20 text-right">
                    ${(item.quantity * item.unitCost).toFixed(2)}
                  </span>

                  {poForm.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <FormInput
            label="Delivery Instructions / Notes"
            name="notes"
            value={poForm.notes}
            onChange={(e) => setPoForm({ ...poForm, notes: e.target.value })}
            placeholder="e.g. Deliver before 11 AM lunch rush to back dock"
          />
        </form>
      </Modal>

      {/* Verify & Receive Stock Modal (Workflow C Steps 9-11) */}
      {selectedPO && (
        <Modal
          isOpen={verifyModalOpen}
          onClose={() => setVerifyModalOpen(false)}
          title={`Verify & Receive Goods: ${selectedPO.poNumber}`}
          subtitle={`Supplier: ${selectedPO.supplierName} • Total Value: ${formatINR(selectedPO.totalAmount)}`}
          maxWidth="max-w-lg"
          footer={
            <>
              <Button variant="secondary" onClick={() => setVerifyModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="success" icon={PackageCheck} onClick={handleConfirmVerification}>
                Confirm Receipt & Increase Stock
              </Button>
            </>
          }
        >
          <form onSubmit={handleConfirmVerification} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
              <strong className="block mb-1 font-semibold">Workflow C Inventory Update:</strong>
              Confirming receipt will automatically add the following delivered quantities directly into your active inventory stock:
              <ul className="list-disc list-inside mt-1.5 space-y-0.5 font-medium">
                {selectedPO.items.map((it, idx) => (
                  <li key={idx}>
                    +{it.quantity} {it.unit} of <strong>{it.name}</strong>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Assign Batch / Lot Number"
                name="batchNumber"
                value={verificationForm.batchNumber}
                onChange={(e) => setVerificationForm({ ...verificationForm, batchNumber: e.target.value })}
                required
              />

              <FormInput
                label="Batch Expiry Date"
                name="expiryDate"
                type="date"
                value={verificationForm.expiryDate}
                onChange={(e) => setVerificationForm({ ...verificationForm, expiryDate: e.target.value })}
                required
              />
            </div>

            <FormInput
              label="Manager Inspection Notes"
              name="notes"
              type="textarea"
              rows={2}
              value={verificationForm.notes}
              onChange={(e) => setVerificationForm({ ...verificationForm, notes: e.target.value })}
            />
          </form>
        </Modal>
      )}

      {/* View PO Details Modal */}
      {selectedPO && (
        <Modal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          title={`Purchase Order ${selectedPO.poNumber}`}
          subtitle={`Created on ${new Date(selectedPO.createdAt).toLocaleString()}`}
          maxWidth="max-w-2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-500">
                Supplier: <strong>{selectedPO.supplierName}</strong>
              </span>
              <div className="flex items-center gap-2">
                {selectedPO.status === 'pending_approval' && (currentUser?.role === 'restaurant_owner' || currentUser?.role === 'super_admin') && (
                  <Button
                    variant="brand"
                    size="sm"
                    icon={CheckCircle2}
                    onClick={() => {
                      approvePurchaseOrder(selectedPO.id);
                      setDetailsModalOpen(false);
                    }}
                  >
                    Approve PO &amp; Send
                  </Button>
                )}
                {selectedPO.status === 'delivered' && !selectedPO.verifiedAt && currentUser.role !== 'kitchen_staff' && (
                  <Button
                    variant="success"
                    size="sm"
                    icon={PackageCheck}
                    onClick={() => {
                      setDetailsModalOpen(false);
                      handleOpenVerify(selectedPO);
                    }}
                  >
                    Verify & Receive Stock
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
            {/* 4-Stage B2B PO Workflow Stepper */}
            <div className="p-3.5 rounded-2xl bg-slate-900 text-white border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-2">
                Structured 4-Stage Procurement Workflow
              </span>
              <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-bold">
                  <span className="block text-xs mb-0.5">01</span>
                  <span>1. PO Requested</span>
                </div>
                <div className={`p-2 rounded-xl border ${
                  selectedPO.status !== 'pending_approval'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold animate-pulse'
                }`}>
                  <span className="block text-xs mb-0.5">02</span>
                  <span>2. Manager Approval</span>
                </div>
                <div className={`p-2 rounded-xl border ${
                  selectedPO.status === 'dispatched' || selectedPO.status === 'delivered' || selectedPO.status === 'received'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                    : selectedPO.status === 'accepted' || selectedPO.status === 'pending'
                    ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300 font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}>
                  <span className="block text-xs mb-0.5">03</span>
                  <span>3. Fulfillment</span>
                </div>
                <div className={`p-2 rounded-xl border ${
                  selectedPO.status === 'received'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                    : selectedPO.status === 'delivered'
                    ? 'bg-teal-950/80 border-teal-500 text-teal-300 font-bold animate-pulse'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}>
                  <span className="block text-xs mb-0.5">04</span>
                  <span>4. Dock &amp; Restock</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-xs text-slate-500 font-medium">Order Status:</span>
                <div className="mt-0.5">
                  <Badge status={selectedPO.status} size="md" />
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 font-medium">Total Manifest Amount:</span>
                <div className="text-xl font-bold text-slate-900">{formatINR(selectedPO.totalAmount)}</div>
              </div>
            </div>

            {/* Line items breakdown */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Ingredient</th>
                    <th className="p-3 text-center">Quantity</th>
                    <th className="p-3 text-right">Unit Cost</th>
                    <th className="p-3 text-right">Subtotal</th>
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
                Order Audit Timeline
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
    </div>
  );
};

