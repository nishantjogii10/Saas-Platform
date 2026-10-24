import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  Plus,
  Shield,
  Store,
  ChefHat,
  Truck,
  Building2,
  Mail,
  Calendar,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { SearchBar } from '../../components/common/SearchBar';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';

export const UserManagement = () => {
  const navigate = useNavigate();
  const { users, restaurants, updateUserStatus, addStaff, addToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [restaurantFilter, setRestaurantFilter] = useState('all');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    role: 'restaurant_owner',
    restaurantId: restaurants[0]?.id || '',
  });

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    const matchesRest =
      restaurantFilter === 'all' ||
      (restaurantFilter === 'none' && !u.restaurantId) ||
      u.restaurantId === restaurantFilter;

    return matchesSearch && matchesRole && matchesRest;
  });

  const handleToggleStatus = (user) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    updateUserStatus(user.id, newStatus);
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email) {
      addToast('Please enter both name and email.', 'error');
      return;
    }
    addStaff(newUserForm);
    setIsAddUserModalOpen(false);
    setNewUserForm({
      name: '',
      email: '',
      role: 'restaurant_owner',
      restaurantId: restaurants[0]?.id || '',
    });
  };

  const columns = [
    {
      header: 'User & Profile',
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
            <div className="font-semibold text-slate-900">{row.name}</div>
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
      header: 'Restaurant Workspace',
      accessor: 'restaurantName',
      sortable: true,
      render: (row) => (
        <div className="text-xs">
          <span className="font-medium text-slate-800">
            {row.restaurantName || (row.role === 'super_admin' ? 'Platform Wide' : 'Supplier Partner')}
          </span>
          {row.restaurantId && (
            <span className="block text-[11px] text-slate-400">ID: {row.restaurantId}</span>
          )}
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
      header: 'Activity',
      accessor: 'lastActive',
      sortable: true,
      render: (row) => (
        <div className="text-xs text-slate-500">
          <div>{row.lastActive || 'Recently'}</div>
          <div className="text-[10px] text-slate-400">Joined {row.joinedDate}</div>
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (row) => (
        <div>
          {row.role !== 'super_admin' ? (
            <Button
              variant={row.status === 'active' ? 'outline' : 'success'}
              size="xs"
              icon={row.status === 'active' ? UserX : UserCheck}
              onClick={() => handleToggleStatus(row)}
            >
              {row.status === 'active' ? 'Deactivate' : 'Activate'}
            </Button>
          ) : (
            <span className="text-xs text-slate-400 italic">Root Admin</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform User Accounts"
        subtitle="Cross-tenant identity management, role verification, and access controls"
        breadcrumbs={[
          { label: 'Admin', href: '#/admin/dashboard' },
          { label: 'User Accounts' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Shield}
              onClick={() => navigate('/admin/role-matrix')}
            >
              Role Matrix & Access
            </Button>
            <Button
              variant="brand"
              size="sm"
              icon={Plus}
              onClick={() => setIsAddUserModalOpen(true)}
            >
              Create User Account
            </Button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="sm:col-span-6">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by name, email..."
            className="w-full"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">All Roles ({users.length})</option>
            <option value="super_admin">Super Admins</option>
            <option value="restaurant_owner">Restaurant Owners</option>
            <option value="restaurant_manager">Restaurant Managers</option>
            <option value="inventory_manager">Inventory Managers</option>
            <option value="kitchen_staff">Kitchen Staff</option>
            <option value="supplier">Suppliers</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={restaurantFilter}
            onChange={(e) => setRestaurantFilter(e.target.value)}
            className="w-full text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">All Tenants</option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
            <option value="none">Platform / External</option>
          </select>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        pageSize={8}
        emptyTitle="No users found"
        emptyDescription="No platform accounts match your current filter."
      />

      {/* Create User Modal */}
      <Modal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        title="Create Platform User Account"
        subtitle="Simulate provisioning a user account into the mock database"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddUserModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="brand" onClick={handleCreateUser}>
              Save User
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <FormInput
            label="Full Name"
            name="name"
            value={newUserForm.name}
            onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
            placeholder="e.g. Liam O'Connor"
            required
          />

          <FormInput
            label="Email Address"
            name="email"
            type="email"
            value={newUserForm.email}
            onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
            placeholder="e.g. liam@spicegarden.com"
            required
          />

          <FormInput
            label="System Role"
            name="role"
            type="select"
            value={newUserForm.role}
            onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
            options={[
              { label: 'Restaurant Owner', value: 'restaurant_owner' },
              { label: 'Restaurant Manager', value: 'restaurant_manager' },
              { label: 'Inventory Manager', value: 'inventory_manager' },
              { label: 'Kitchen Staff', value: 'kitchen_staff' },
            ]}
          />

          <FormInput
            label="Tenant Restaurant Assignment"
            name="restaurantId"
            type="select"
            value={newUserForm.restaurantId}
            onChange={(e) => setNewUserForm({ ...newUserForm, restaurantId: e.target.value })}
            options={restaurants.map(r => ({ label: r.name, value: r.id }))}
          />
        </form>
      </Modal>
    </div>
  );
};

