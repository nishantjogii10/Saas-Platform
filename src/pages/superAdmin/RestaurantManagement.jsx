import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Search,
  Filter,
  CheckCircle2,
  Ban,
  RotateCcw,
  Eye,
  Plus,
  ExternalLink,
  ShieldCheck,
  MapPin,
  Mail,
  Phone,
  CreditCard,
  Users,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { SearchBar } from '../../components/common/SearchBar';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';

export const RestaurantManagement = () => {
  const {
    restaurants,
    approveRestaurant,
    suspendRestaurant,
    reactivateRestaurant,
    switchRestaurant,
    users,
    plans,
  } = useApp();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialFilter = searchParams.get('filter') || 'all';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Confirm dialog states
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    type: 'danger',
    title: '',
    message: '',
    action: () => {},
  });

  // Filtered restaurants
  const filteredRestaurants = restaurants.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Confirmation triggers
  const handleApproveClick = (restaurant) => {
    setConfirmState({
      isOpen: true,
      type: 'success',
      title: `Approve Restaurant Account`,
      message: `Are you sure you want to approve "${restaurant.name}"? This will activate their tenant workspace and enable the owner (${restaurant.ownerName}) to log in.`,
      confirmText: 'Approve & Activate',
      action: () => approveRestaurant(restaurant.id),
    });
  };

  const handleSuspendClick = (restaurant) => {
    setConfirmState({
      isOpen: true,
      type: 'danger',
      title: `Suspend Restaurant Account`,
      message: `Are you sure you want to suspend "${restaurant.name}"? Active staff logins and inventory access will be temporarily halted.`,
      confirmText: 'Suspend Account',
      action: () => suspendRestaurant(restaurant.id, 'Super Admin operational review'),
    });
  };

  const handleReactivateClick = (restaurant) => {
    setConfirmState({
      isOpen: true,
      type: 'info',
      title: `Reactivate Restaurant Account`,
      message: `Restore active tenant access for "${restaurant.name}"? Staff will be permitted to resume daily operations.`,
      confirmText: 'Reactivate Account',
      action: () => reactivateRestaurant(restaurant.id),
    });
  };

  const openDetails = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setDetailsModalOpen(true);
  };

  const columns = [
    {
      header: 'Restaurant Name',
      accessor: 'name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="text-xl p-1 rounded-xl bg-slate-100/80 shrink-0">{row.logo || '🍽️'}</span>
          <div className="font-bold text-slate-900 hover:text-emerald-800 transition-colors cursor-pointer text-xs" onClick={() => openDetails(row)}>
            {row.name}
          </div>
        </div>
      ),
    },
    {
      header: 'Cuisine / Concept',
      accessor: 'cuisine',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-600 font-medium px-2 py-0.5 bg-slate-100 rounded-md">
          {row.cuisine}
        </span>
      ),
    },
    {
      header: 'Owner Name',
      accessor: 'ownerName',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-slate-800 text-xs">{row.ownerName}</span>
      ),
    },
    {
      header: 'Owner Email',
      accessor: 'ownerEmail',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-600 font-mono">{row.ownerEmail}</span>
      ),
    },
    {
      header: 'Subscription Plan',
      accessor: 'planName',
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
          {row.planName}
        </span>
      ),
    },
    {
      header: 'Joined Date',
      accessor: 'joinedDate',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-500 font-mono">
          {new Date(row.joinedDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
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
            onClick={() => openDetails(row)}
            title="View Account Details"
          />

          {row.status === 'pending' && (
            <Button
              variant="success"
              size="xs"
              icon={CheckCircle2}
              onClick={() => handleApproveClick(row)}
            >
              Approve
            </Button>
          )}

          {row.status === 'active' && (
            <Button
              variant="outline"
              size="xs"
              className="text-rose-600 hover:bg-rose-50 border-rose-200"
              icon={Ban}
              onClick={() => handleSuspendClick(row)}
            >
              Suspend
            </Button>
          )}

          {row.status === 'suspended' && (
            <Button
              variant="primary"
              size="xs"
              icon={RotateCcw}
              onClick={() => handleReactivateClick(row)}
            >
              Reactivate
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Restaurant Tenant Accounts"
        subtitle="Manage hospitality client organizations, monitor subscriptions, and administer account statuses"
        breadcrumbs={[
          { label: 'Admin', href: '#/admin/dashboard' },
          { label: 'Restaurants' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Total: <strong>{restaurants.length}</strong> restaurants
            </span>
          </div>
        }
      />

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by restaurant name, owner, or email..."
          className="w-full sm:w-80"
        />

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex items-center gap-1 overflow-x-auto">
            {['all', 'active', 'suspended'].map((filterKey) => (
              <button
                key={filterKey}
                onClick={() => setStatusFilter(filterKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all select-none ${
                  statusFilter === filterKey
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filterKey}
                {filterKey === 'pending' && restaurants.filter(r => r.status === 'pending').length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-amber-950 font-bold">
                    {restaurants.filter(r => r.status === 'pending').length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={filteredRestaurants}
        pageSize={8}
        emptyTitle="No restaurants found"
        emptyDescription="Try clearing your search query or filter to see registered accounts."
      />

      {/* View Details Modal */}
      {selectedRestaurant && (
        <Modal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          title={selectedRestaurant.name}
          subtitle={`Account ID: ${selectedRestaurant.id} • Registered on ${selectedRestaurant.joinedDate}`}
          maxWidth="max-w-2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                {selectedRestaurant.status === 'pending' ? (
                  <Button
                    variant="success"
                    size="sm"
                    icon={CheckCircle2}
                    onClick={() => {
                      approveRestaurant(selectedRestaurant.id);
                      setDetailsModalOpen(false);
                    }}
                  >
                    Approve Account
                  </Button>
                ) : selectedRestaurant.status === 'active' ? (
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Ban}
                    onClick={() => {
                      suspendRestaurant(selectedRestaurant.id);
                      setDetailsModalOpen(false);
                    }}
                  >
                    Suspend Access
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={RotateCcw}
                    onClick={() => {
                      reactivateRestaurant(selectedRestaurant.id);
                      setDetailsModalOpen(false);
                    }}
                  >
                    Reactivate Account
                  </Button>
                )}
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDetailsModalOpen(false)}
              >
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-5">
            {/* Top overview card */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 rounded-xl bg-white shadow-xs">{selectedRestaurant.logo || '🌿'}</span>
                <div>
                  <h4 className="text-base font-bold text-slate-900">{selectedRestaurant.name}</h4>
                  <p className="text-xs text-slate-500">{selectedRestaurant.cuisine}</p>
                </div>
              </div>
              <Badge status={selectedRestaurant.status} size="md" />
            </div>

            {/* Account Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Owner & Contact
                </span>
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <span>{selectedRestaurant.ownerName}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{selectedRestaurant.ownerEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{selectedRestaurant.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{selectedRestaurant.address}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Subscription & Limits
                </span>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Active Tier:</span>
                  <span className="font-bold text-emerald-800">{selectedRestaurant.planName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Ingredients Count:</span>
                  <span className="font-medium text-slate-800">
                    {selectedRestaurant.monthlyUsage?.ingredientsCount || 0} / {selectedRestaurant.monthlyUsage?.ingredientsLimit || 100}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Staff Limit:</span>
                  <span className="font-medium text-slate-800">
                    {selectedRestaurant.monthlyUsage?.staffCount || 1} / {selectedRestaurant.monthlyUsage?.staffLimit || 5} users
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Renewal Date:</span>
                  <span className="font-medium text-slate-800">{selectedRestaurant.renewalDate}</span>
                </div>
              </div>
            </div>

            {/* Quick Demo Switcher link for evaluators */}
            {selectedRestaurant.status === 'active' && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
                <span>
                  <strong>Tenant Simulation:</strong> Switch to this restaurant workspace to review their live inventory.
                </span>
                <Button
                  variant="primary"
                  size="xs"
                  onClick={() => {
                    switchRestaurant(selectedRestaurant.id);
                    setDetailsModalOpen(false);
                  }}
                >
                  Enter Workspace
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Confirmation Dialog */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ ...confirmState, isOpen: false })}
        onConfirm={confirmState.action}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        type={confirmState.type}
      />
    </div>
  );
};

