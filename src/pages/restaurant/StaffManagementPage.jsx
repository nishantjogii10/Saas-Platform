import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Plus,
  Search,
  UserCheck,
  UserX,
  Mail,
  Shield,
  ChefHat,
  Building2,
  Calendar,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { SearchBar } from '../../components/common/SearchBar';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';

export const StaffManagementPage = () => {
  const { restaurantStaff, addStaff, updateUserStatus, currentRestaurant, addToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'kitchen_staff',
  });

  const filteredStaff = restaurantStaff.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || s.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleSaveStaff = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      addToast('Please enter both name and email.', 'error');
      return;
    }
    addStaff(formData);
    setIsAddModalOpen(false);
    setFormData({ name: '', email: '', role: 'kitchen_staff' });
  };

  const handleToggleStatus = (staff) => {
    const nextStatus = staff.status === 'active' ? 'suspended' : 'active';
    updateUserStatus(staff.id, nextStatus);
  };

  const columns = [
    {
      header: 'Staff Member',
      accessor: 'name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.avatar}
            alt={row.name}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
          />
          <div>
            <div className="font-bold text-slate-900">{row.name}</div>
            <div className="text-xs text-slate-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Assigned Role',
      accessor: 'role',
      sortable: true,
      render: (row) => <Badge status={row.role} />,
    },
    {
      header: 'Permissions Scope',
      accessor: 'role',
      render: (row) => {
        if (row.role === 'restaurant_owner') {
          return <span className="text-xs text-slate-600 font-medium">Full Restaurant & Subscription Control</span>;
        }
        if (row.role === 'inventory_manager') {
          return <span className="text-xs text-slate-600 font-medium">Stock Receiving, POs, Wastage & Thresholds</span>;
        }
        return <span className="text-xs text-slate-600 font-medium">Record Consumption, Wastage & Low Stock Reports</span>;
      },
    },
    {
      header: 'Account Status',
      accessor: 'status',
      sortable: true,
      render: (row) => <Badge status={row.status} />,
    },
    {
      header: 'Last Active',
      accessor: 'lastActive',
      render: (row) => (
        <div className="text-xs text-slate-500">
          <div>{row.lastActive || 'Today'}</div>
          <div className="text-[10px] text-slate-400">Joined {row.joinedDate}</div>
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (row) => (
        <div>
          {row.role !== 'restaurant_owner' ? (
            <Button
              variant={row.status === 'active' ? 'outline' : 'success'}
              size="xs"
              icon={row.status === 'active' ? UserX : UserCheck}
              onClick={() => handleToggleStatus(row)}
            >
              {row.status === 'active' ? 'Suspend' : 'Activate'}
            </Button>
          ) : (
            <span className="text-xs text-slate-400 italic">Workspace Owner</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${currentRestaurant?.name} Team Members`}
        subtitle="Manage employee accounts and designate role permissions between Inventory Managers and Kitchen Line Staff"
        breadcrumbs={[
          { label: 'Restaurant', href: '#/dashboard' },
          { label: 'Staff Management' },
        ]}
        actions={
          <Button
            variant="brand"
            size="sm"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Team Member
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search staff by name or email..."
          className="w-full sm:w-80"
        />

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'restaurant_owner', 'inventory_manager', 'kitchen_staff'].map((rKey) => (
            <button
              key={rKey}
              onClick={() => setRoleFilter(rKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition-all select-none ${
                roleFilter === rKey
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {rKey === 'all' ? 'All Roles' : rKey.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Table */}
      <DataTable
        columns={columns}
        data={filteredStaff}
        pageSize={8}
        emptyTitle="No staff members found"
        emptyDescription="Add staff members to give them inventory recording or PO access."
      />

      {/* Add Staff Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Staff Member"
        subtitle={`Invite a new employee to ${currentRestaurant?.name}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="brand" onClick={handleSaveStaff}>
              Add Member
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveStaff} className="space-y-4">
          <FormInput
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Maya Lin"
            required
          />

          <FormInput
            label="Staff Work Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="e.g. maya@spicegarden.com"
            required
          />

          <FormInput
            label="Assigned Role"
            name="role"
            type="select"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            options={[
              { label: 'Inventory Manager (Stock receiving, POs, Alerts)', value: 'inventory_manager' },
              { label: 'Kitchen Staff (Record usage, Wastage, Low-stock report)', value: 'kitchen_staff' },
            ]}
          />

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <strong>Role Permissions:</strong> Kitchen Staff have a simplified station dashboard and cannot create purchase orders or alter supplier agreements.
          </div>
        </form>
      </Modal>
    </div>
  );
};

