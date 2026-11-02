import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Search,
  Filter,
  Clock,
  Shield,
  Download,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { SearchBar } from '../../components/common/SearchBar';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const ActivityLogs = () => {
  const { platformLogs, addToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredLogs = platformLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || log.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'ID,Timestamp,Actor,Action,Target,Category,Status\n' +
      filteredLogs
        .map(
          (l) =>
            `"${l.id}","${l.timestamp}","${l.actor}","${l.action}","${l.target}","${l.category}","${l.status}"`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StockMate_Platform_Logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Platform activity logs exported to CSV.', 'success');
  };

  const columns = [
    {
      header: 'Date',
      accessor: 'timestamp',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-slate-800 text-xs">
          {new Date(row.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ),
    },
    {
      header: 'Time',
      accessor: 'time',
      render: (row) => (
        <span className="text-xs text-slate-500 font-mono">
          {new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      ),
    },
    {
      header: 'Action Taken',
      accessor: 'action',
      sortable: true,
      render: (row) => (
        <div className="font-semibold text-slate-900 text-sm">
          {row.action}
        </div>
      ),
    },
    {
      header: 'Target Entity / Scope',
      accessor: 'target',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
          {row.target}
        </span>
      ),
    },
    {
      header: 'Actor',
      accessor: 'actor',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
          <Shield className="w-3.5 h-3.5 text-emerald-700" />
          <span>{row.actor}</span>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-semibold text-slate-600">
          {row.category}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (row) => <Badge status={row.status} size="xs" />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Audit & Activity Logs"
        subtitle="Immutable security trail of administrative actions, account registrations, and policy alterations"
        breadcrumbs={[
          { label: 'Admin', href: '#/admin/dashboard' },
          { label: 'Activity Logs' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportCSV}
          >
            Export Audit Trail (CSV)
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by action, target, or actor..."
          className="w-full sm:w-80"
        />

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex items-center gap-1 overflow-x-auto">
            {['all', 'Onboarding', 'Account Management', 'Billing', 'System Config'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat === 'all' ? 'all' : cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all select-none ${
                  categoryFilter === cat || (cat === 'all' && categoryFilter === 'all')
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'All Events' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <DataTable
        columns={columns}
        data={filteredLogs}
        pageSize={10}
        emptyTitle="No log entries found"
        emptyDescription="There are no audit events matching your criteria."
      />
    </div>
  );
};

