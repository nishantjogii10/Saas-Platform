import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Boxes,
  Search,
  Scale,
  MapPin,
  ClockAlert,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { SearchBar } from '../../components/common/SearchBar';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const KitchenIngredientsPage = () => {
  const navigate = useNavigate();
  const { restaurantIngredients } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = ['all', ...new Set(restaurantIngredients.map(i => i.category))];

  const filteredItems = restaurantIngredients.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.storageLocation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;

    return matchesSearch && matchesCat;
  });

  const columns = [
    {
      header: 'Ingredient',
      accessor: 'name',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.name}</div>
          <div className="text-xs text-slate-500">{row.category}</div>
        </div>
      ),
    },
    {
      header: 'Available Quantity',
      accessor: 'quantity',
      sortable: true,
      render: (row) => (
        <div className="flex items-baseline gap-1">
          <span className={`text-base font-extrabold ${
            row.quantity === 0 ? 'text-rose-600' : row.quantity <= row.minThreshold ? 'text-amber-600' : 'text-slate-900'
          }`}>
            {row.quantity}
          </span>
          <span className="text-xs text-slate-500 font-medium">{row.unit}</span>
        </div>
      ),
    },
    {
      header: 'Storage Location',
      accessor: 'storageLocation',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.storageLocation}</span>
        </div>
      ),
    },
    {
      header: 'Condition / Status',
      accessor: 'status',
      sortable: true,
      render: (row) => <Badge status={row.status} />,
    },
    {
      header: 'Expiry Date',
      accessor: 'daysUntilExpiry',
      sortable: true,
      render: (row) => (
        <span className={`text-xs font-semibold ${
          row.daysUntilExpiry <= 3 ? 'text-amber-600' : 'text-slate-600'
        }`}>
          {row.expiryDate} ({row.daysUntilExpiry}d left)
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (row) => (
        <Button
          variant="brand"
          size="xs"
          icon={Scale}
          onClick={() => navigate(`/kitchen/usage?ingredientId=${row.id}`)}
        >
          Use
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kitchen Inventory Availability"
        subtitle="Quick reference of active stock balances, pantry bins, and storage locations"
        breadcrumbs={[
          { label: 'Kitchen', href: '#/kitchen' },
          { label: 'Available Stock' },
        ]}
      />

      {/* Search and Category Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by ingredient or storage location..."
          className="w-full sm:w-80"
        />

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition-all select-none ${
                categoryFilter === cat
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Items' : cat}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredItems}
        pageSize={10}
        emptyTitle="No ingredients found"
        emptyDescription="Try adjusting your filter or search."
      />
    </div>
  );
};

