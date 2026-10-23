import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  PackageCheck,
  Search,
  Download,
  Calendar,
  Building2,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { SearchBar } from '../../components/common/SearchBar';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const SupplierHistoryPage = () => {
  const { purchaseOrders, currentUser, addToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const completedOrders = purchaseOrders.filter(
    (po) =>
      po.supplierId === (currentUser.supplierId || 'sup-1') &&
      (po.status === 'delivered' || po.status === 'cancelled' || po.status === 'rejected')
  );

  const filteredOrders = completedOrders.filter(
    (po) =>
      po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.restaurantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportHistory = () => {
    addToast('Historical fulfillment ledger exported to CSV.', 'success');
  };

  const columns = [
    {
      header: 'PO Number & Delivery Date',
      accessor: 'poNumber',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.poNumber}</div>
          <div className="text-xs text-slate-400">
            Delivered: {row.deliveredAt ? new Date(row.deliveredAt).toLocaleDateString() : row.expectedDelivery}
          </div>
        </div>
      ),
    },
    {
      header: 'Restaurant Client',
      accessor: 'restaurantName',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-slate-800 text-xs">
          {row.restaurantName}
        </span>
      ),
    },
    {
      header: 'Items Fulfilled',
      accessor: 'items',
      render: (row) => (
        <span className="text-xs text-slate-600">
          {row.items.map(it => `${it.quantity} ${it.unit} ${it.name}`).join(', ')}
        </span>
      ),
    },
    {
      header: 'Settlement Amount',
      accessor: 'totalAmount',
      sortable: true,
      render: (row) => (
        <div className="text-xs font-bold text-slate-900">
          ${row.totalAmount.toFixed(2)}
        </div>
      ),
    },
    {
      header: 'Final Status',
      accessor: 'status',
      sortable: true,
      render: (row) => <Badge status={row.status} />,
    },
    {
      header: 'Verified By Kitchen',
      accessor: 'verifiedBy',
      render: (row) => (
        <div className="text-xs text-slate-600">
          {row.verifiedBy ? (
            <span className="text-emerald-700 font-semibold">{row.verifiedBy}</span>
          ) : (
            <span className="text-slate-400 italic">Auto-confirmed</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supplier Order History"
        subtitle="Archived delivery records and historical billing receipts"
        breadcrumbs={[
          { label: 'Supplier', href: '#/supplier' },
          { label: 'Order History' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportHistory}
          >
            Export Archive (CSV)
          </Button>
        }
      />

      <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search delivered POs by number or client..."
          className="w-full sm:w-80"
        />
        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          {filteredOrders.length} completed records
        </span>
      </div>

      <DataTable
        columns={columns}
        data={filteredOrders}
        pageSize={8}
        emptyTitle="No completed orders in history"
        emptyDescription="Orders marked as Delivered appear here."
      />
    </div>
  );
};

