import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Package,
  Plus,
  Search,
  Pencil,
  Trash2,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ArrowUpDown,
  ChevronDown,
  Download,
  UploadCloud,
  X,
  RotateCcw,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { FormInput } from '../../components/common/FormInput';
import { ColumnExportDialog } from '../../components/common/ColumnExportDialog';
import { ExcelImportDialog } from '../../components/common/ExcelImportDialog';
import { formatINR } from '../../data/inventoryBillingData';

export const InventoryPage = () => {
  const {
    restaurantIngredients = [],
    restaurantSuppliers = [],
    addIngredient,
    updateIngredient,
    deleteIngredient,
    currentUser,
    currentBranch,
    importIngredientsBulk,
  } = useApp();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialFilter = searchParams.get('filter') || 'all';
  const initialAction = searchParams.get('action');

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState(initialFilter); // 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'
  const [sortBy, setSortBy] = useState('name-asc'); // 'name-asc' | 'name-desc' | 'stock-asc' | 'stock-desc' | 'cost-desc' | 'cost-asc' | 'expiry-asc'

  // Dialog & Modal states
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(initialAction === 'add');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const isOwner = currentUser?.role === 'restaurant_owner';
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewIngredient, setViewIngredient] = useState(null);

  const handleOpenView = (ingredient) => {
    setViewIngredient(ingredient);
    setIsViewModalOpen(true);
  };

  // Confirm delete dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Produce',
    quantity: 10,
    unit: 'kg',
    minThreshold: 5,
    costPerUnit: 45.0,
    supplierId: restaurantSuppliers[0]?.id || '',
    supplierName: restaurantSuppliers[0]?.name || 'Local Supplier',
    batchNumber: 'BCH-NEW-101',
    storageLocation: 'Walk-in Chiller',
    expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    if (initialAction === 'add') {
      setIsAddModalOpen(true);
    }
  }, [initialAction]);

  // Sync supplier name when supplier ID changes in form
  const handleSupplierChange = (supId) => {
    const sup = restaurantSuppliers.find((s) => s.id === supId);
    setFormData((prev) => ({
      ...prev,
      supplierId: supId,
      supplierName: sup ? sup.name : 'Selected Supplier',
    }));
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      category: 'Produce',
      quantity: 10,
      unit: 'kg',
      minThreshold: 5,
      costPerUnit: 35.0,
      supplierId: restaurantSuppliers[0]?.id || '',
      supplierName: restaurantSuppliers[0]?.name || 'Local Supplier',
      batchNumber: `BCH-${Math.floor(100 + Math.random() * 900)}`,
      storageLocation: 'Dry Storage',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (ingredient) => {
    if (isOwner) {
      handleOpenView(ingredient);
      return;
    }
    setSelectedIngredient(ingredient);
    setFormData({
      name: ingredient.name,
      category: ingredient.category,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      minThreshold: ingredient.minThreshold,
      costPerUnit: ingredient.costPerUnit,
      supplierId: ingredient.supplierId,
      supplierName: ingredient.supplierName,
      batchNumber: ingredient.batchNumber,
      storageLocation: ingredient.storageLocation,
      expiryDate: ingredient.expiryDate,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    addIngredient(formData);
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !selectedIngredient) return;
    updateIngredient(selectedIngredient.id, formData);
    setIsEditModalOpen(false);
  };

  // Distinct category list
  const categories = useMemo(() => {
    const list = Array.from(new Set(restaurantIngredients.map((i) => i.category).filter(Boolean)));
    return ['all', ...list];
  }, [restaurantIngredients]);

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    const total = restaurantIngredients.length;
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let totalValuation = 0;

    restaurantIngredients.forEach((item) => {
      const qty = Number(item.quantity) || 0;
      const minT = Number(item.minThreshold) || 0;
      const cost = Number(item.costPerUnit) || 0;
      totalValuation += qty * cost;

      if (qty === 0 || item.status === 'out_of_stock') {
        outOfStock += 1;
      } else if (qty <= minT || item.status === 'low_stock') {
        lowStock += 1;
      } else {
        inStock += 1;
      }
    });

    return {
      total,
      inStock,
      lowStock,
      outOfStock,
      totalValuation,
    };
  }, [restaurantIngredients]);

  // Filter & Sort Ingredients
  const filteredIngredients = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();

    const filtered = restaurantIngredients.filter((item) => {
      const matchesSearch =
        !q ||
        item.name?.toLowerCase().includes(q) ||
        item.supplierName?.toLowerCase().includes(q) ||
        item.batchNumber?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        item.storageLocation?.toLowerCase().includes(q);

      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

      const qty = Number(item.quantity) || 0;
      const minT = Number(item.minThreshold) || 0;
      let matchesStatus = true;
      if (categoryFilter === 'low_stock') {
        matchesStatus = item.status === 'low_stock' || (qty <= minT && qty > 0);
      } else if (categoryFilter === 'out_of_stock') {
        matchesStatus = item.status === 'out_of_stock' || qty === 0;
      } else if (categoryFilter === 'in_stock') {
        matchesStatus = item.status === 'in_stock' || (qty > minT);
      }

      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sorting
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'stock-asc':
          return (Number(a.quantity) || 0) - (Number(b.quantity) || 0);
        case 'stock-desc':
          return (Number(b.quantity) || 0) - (Number(a.quantity) || 0);
        case 'cost-desc':
          return (
            (Number(b.quantity) || 0) * (Number(b.costPerUnit) || 0) -
            (Number(a.quantity) || 0) * (Number(a.costPerUnit) || 0)
          );
        case 'cost-asc':
          return (
            (Number(a.quantity) || 0) * (Number(a.costPerUnit) || 0) -
            (Number(b.quantity) || 0) * (Number(b.costPerUnit) || 0)
          );
        case 'expiry-asc': {
          const dateA = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
          const dateB = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
          return dateA - dateB;
        }
        default:
          return 0;
      }
    });
  }, [restaurantIngredients, searchTerm, selectedCategory, categoryFilter, sortBy]);

  // Table Columns Definition
  const columns = [
    {
      header: 'Ingredient',
      accessor: 'name',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900 text-sm">{row.name}</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
            <span className="font-medium text-slate-600">{row.category}</span>
            <span className="text-slate-300">•</span>
            <span className="font-mono text-[11px] text-slate-400">Batch: {row.batchNumber || 'N/A'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Current Stock',
      accessor: 'quantity',
      sortable: true,
      render: (row) => {
        const qty = Number(row.quantity) || 0;
        const minT = Number(row.minThreshold) || 0;
        const isZero = qty === 0;
        const isLow = qty <= minT && qty > 0;

        return (
          <div>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-sm font-bold ${
                  isZero ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-900'
                }`}
              >
                {qty}
              </span>
              <span className="text-xs text-slate-500 font-medium">{row.unit}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Min: {minT} {row.unit}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Unit Cost',
      accessor: 'costPerUnit',
      sortable: true,
      render: (row) => {
        const unitCost = Number(row.costPerUnit) || 0;
        const totalValue = (Number(row.quantity) || 0) * unitCost;

        return (
          <div>
            <div className="font-semibold text-slate-800 text-xs sm:text-sm">
              {formatINR(unitCost)} / {row.unit}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              Total: {formatINR(totalValue)}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Stock Status',
      accessor: 'status',
      sortable: true,
      render: (row) => {
        const qty = Number(row.quantity) || 0;
        const minT = Number(row.minThreshold) || 0;

        if (qty === 0 || row.status === 'out_of_stock') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Out of Stock
            </span>
          );
        }
        if (qty <= minT || row.status === 'low_stock') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Low Stock
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            In Stock
          </span>
        );
      },
    },
    {
      header: 'Supplier & Expiry',
      accessor: 'supplierName',
      sortable: true,
      render: (row) => {
        let daysLeft = row.daysUntilExpiry;
        if (daysLeft === undefined && row.expiryDate) {
          const diff = new Date(row.expiryDate) - new Date();
          daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
        }

        const isExpired = daysLeft !== undefined && daysLeft < 0;
        const isExpiringSoon = daysLeft !== undefined && daysLeft >= 0 && daysLeft <= 3;

        return (
          <div className="text-xs">
            <div className="font-medium text-slate-800 truncate max-w-[170px]" title={row.supplierName}>
              {row.supplierName || 'Direct / Internal'}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-slate-500 font-mono text-[11px]">{row.expiryDate || 'No date'}</span>
              {isExpired ? (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  Expired
                </span>
              ) : isExpiringSoon ? (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  {daysLeft === 0 ? 'Expires today' : `${daysLeft}d left`}
                </span>
              ) : null}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Actions',
      accessor: 'id',
      className: 'text-center w-24',
      cellClassName: 'text-center',
      render: (row) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer border border-transparent hover:border-slate-300"
            title="Edit ingredient"
            aria-label="Edit ingredient"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          {currentUser?.role !== 'kitchen_staff' && (
            <button
              type="button"
              onClick={() => {
                setIngredientToDelete(row);
                setDeleteConfirmOpen(true);
              }}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer border border-transparent hover:border-rose-200"
              title="Delete ingredient"
              aria-label="Delete ingredient"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* 1. Page Header */}
      <PageHeader
        title="Kitchen Inventory"
        subtitle="Monitor stock levels, ingredient costs, and expiry dates."
        breadcrumbs={[
          { label: 'Restaurant', href: '#/dashboard' },
          { label: 'Inventory' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsExportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all active:scale-[0.98] cursor-pointer"
              title="Export inventory data"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>

            {currentUser?.role !== 'kitchen_staff' && currentUser?.role !== 'supplier' && (
              <button
                type="button"
                onClick={() => setIsImportOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                title="Import inventory data"
              >
                <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                <span>Import</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs hover:shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Ingredient</span>
            </button>
          </div>
        }
      />

      {/* 2. Compact Inventory Overview (4 Summary Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Ingredients */}
        <div
          onClick={() => setCategoryFilter('all')}
          className={`p-4 sm:p-5 rounded-2xl bg-white border transition-all cursor-pointer ${
            categoryFilter === 'all'
              ? 'border-emerald-300 ring-2 ring-emerald-500/10 shadow-xs'
              : 'border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Ingredients</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900">{summaryMetrics.total}</span>
            <span className="text-xs text-slate-400 font-medium">items</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="font-medium text-slate-500">Valuation: {formatINR(summaryMetrics.totalValuation)}</span>
          </div>
        </div>

        {/* Card 2: In Stock */}
        <div
          onClick={() => setCategoryFilter('in_stock')}
          className={`p-4 sm:p-5 rounded-2xl bg-white border transition-all cursor-pointer ${
            categoryFilter === 'in_stock'
              ? 'border-emerald-500 ring-2 ring-emerald-500/10 shadow-xs'
              : 'border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">In Stock</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-emerald-700">{summaryMetrics.inStock}</span>
            <span className="text-xs text-emerald-600/70 font-medium">items</span>
          </div>
          <div className="mt-2 text-xs text-emerald-700 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-medium">Healthy stock levels</span>
          </div>
        </div>

        {/* Card 3: Low Stock */}
        <div
          onClick={() => setCategoryFilter('low_stock')}
          className={`p-4 sm:p-5 rounded-2xl bg-white border transition-all cursor-pointer ${
            categoryFilter === 'low_stock'
              ? 'border-amber-500 ring-2 ring-amber-500/10 shadow-xs'
              : 'border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Low Stock</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-amber-700">{summaryMetrics.lowStock}</span>
            <span className="text-xs text-amber-600/70 font-medium">items</span>
          </div>
          <div className="mt-2 text-xs text-amber-700 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-[11px] font-medium">Below safety threshold</span>
          </div>
        </div>

        {/* Card 4: Out of Stock */}
        <div
          onClick={() => setCategoryFilter('out_of_stock')}
          className={`p-4 sm:p-5 rounded-2xl bg-white border transition-all cursor-pointer ${
            categoryFilter === 'out_of_stock'
              ? 'border-rose-500 ring-2 ring-rose-500/10 shadow-xs'
              : 'border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Out of Stock</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-rose-700">{summaryMetrics.outOfStock}</span>
            <span className="text-xs text-rose-600/70 font-medium">items</span>
          </div>
          <div className="mt-2 text-xs text-rose-700 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span className="text-[11px] font-medium">Requires replenishment</span>
          </div>
        </div>
      </div>

      {/* 3. Search and Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ingredients, suppliers, or batches..."
              className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/70 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="w-full sm:w-auto min-w-[170px]">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none pl-3.5 pr-8 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/70 text-slate-700 hover:bg-slate-100/70 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all cursor-pointer"
              >
                <option value="all">All Categories ({categories.length - 1})</option>
                {categories
                  .filter((c) => c !== 'all')
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Stock Status Filter */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            {[
              { id: 'all', label: 'All Stock', count: summaryMetrics.total },
              { id: 'in_stock', label: 'In Stock', count: summaryMetrics.inStock },
              { id: 'low_stock', label: 'Low Stock', count: summaryMetrics.lowStock },
              { id: 'out_of_stock', label: 'Out of Stock', count: summaryMetrics.outOfStock },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all select-none cursor-pointer ${
                  categoryFilter === tab.id
                    ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                    categoryFilter === tab.id ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Sorting Control */}
          <div className="w-full sm:w-auto min-w-[160px]">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none pl-3.5 pr-8 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/70 text-slate-700 hover:bg-slate-100/70 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all cursor-pointer"
              >
                <option value="name-asc">Sort: Name (A-Z)</option>
                <option value="name-desc">Sort: Name (Z-A)</option>
                <option value="stock-asc">Stock: Low to High</option>
                <option value="stock-desc">Stock: High to Low</option>
                <option value="cost-desc">Value: High to Low</option>
                <option value="cost-asc">Value: Low to High</option>
                <option value="expiry-asc">Expiry: Soonest</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Active Filters Summary Reset Bar */}
        {(searchTerm || selectedCategory !== 'all' || categoryFilter !== 'all' || sortBy !== 'name-asc') && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>
              Showing <strong className="text-slate-700">{filteredIngredients.length}</strong> of{' '}
              <strong className="text-slate-700">{restaurantIngredients.length}</strong> ingredients
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setCategoryFilter('all');
                setSortBy('name-asc');
              }}
              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Redesigned Inventory Table */}
      <DataTable
        columns={columns}
        data={filteredIngredients}
        pageSize={10}
        emptyTitle="No ingredients found"
        emptyDescription="Try adjusting your search criteria or add a new ingredient."
      />

      {/* 5. Add / Edit Ingredient Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isAddModalOpen ? 'Add New Ingredient' : `Edit Ingredient: ${formData.name}`}
        subtitle="Manage inventory specifications, minimum safety thresholds, and supplier details."
        maxWidth="max-w-2xl"
        footer={
          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={isAddModalOpen ? handleSaveAdd : handleSaveEdit}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs hover:shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              {isAddModalOpen ? 'Add Ingredient' : 'Save Changes'}
            </button>
          </div>
        }
      >
        <form onSubmit={isAddModalOpen ? handleSaveAdd : handleSaveEdit} className="space-y-4">
          {/* Section: Basic Information */}
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
              General Information
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <FormInput
                label="Ingredient Name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Grass-Fed Butter, Basmati Rice"
                required
              />

              <FormInput
                label="Category"
                name="category"
                type="select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                options={[
                  'Produce',
                  'Dairy',
                  'Poultry',
                  'Meat & Grills',
                  'Grains & Rice',
                  'Spices & Seasoning',
                  'Fresh Herbs',
                  'Bakery',
                  'Oils & Fats',
                  'Canned Goods',
                  'Beverage & Bar',
                  'Fuel & Consumables',
                ]}
                required
              />
            </div>
          </div>

          {/* Section: Stock Quantities & Threshold */}
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
              Stock &amp; Alert Threshold
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <FormInput
                label="Current Quantity"
                name="quantity"
                type="number"
                step="any"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                required
              />

              <FormInput
                label="Measurement Unit"
                name="unit"
                type="select"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                options={['kg', 'grams', 'litres', 'ml', 'units', 'packs', 'boxes', 'cans']}
                required
              />

              <FormInput
                label="Min Safety Alert Level"
                name="minThreshold"
                type="number"
                step="any"
                min="0"
                value={formData.minThreshold}
                onChange={(e) => setFormData({ ...formData, minThreshold: Number(e.target.value) })}
                helperText="Triggers Low Stock warning when quantity <= threshold"
                required
              />
            </div>
          </div>

          {/* Section: Cost & Preferred Supplier */}
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
              Cost &amp; Supplier
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <FormInput
                label="Cost Per Unit (₹ INR)"
                name="costPerUnit"
                type="number"
                step="0.01"
                min="0"
                value={formData.costPerUnit}
                onChange={(e) => setFormData({ ...formData, costPerUnit: Number(e.target.value) })}
                required
              />

              <FormInput
                label="Preferred Supplier"
                name="supplierId"
                type="select"
                value={formData.supplierId}
                onChange={(e) => handleSupplierChange(e.target.value)}
                options={restaurantSuppliers.map((s) => ({
                  label: s.name,
                  value: s.id,
                }))}
                required
              />
            </div>
          </div>

          {/* Section: Batch & Storage Details */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
              Batch &amp; Expiry
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <FormInput
                label="Batch / Lot Number"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                placeholder="e.g. BCH-2026-101"
              />

              <FormInput
                label="Storage Location"
                name="storageLocation"
                value={formData.storageLocation}
                onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                placeholder="e.g. Walk-in Cooler Shelf 2"
              />

              <FormInput
                label="Expiry Date"
                name="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                required
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* 6. Confirm Delete Dialog */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={() => {
          if (ingredientToDelete) {
            deleteIngredient(ingredientToDelete.id);
            setIngredientToDelete(null);
          }
        }}
        title={`Delete "${ingredientToDelete?.name}"?`}
        message="Are you sure you want to delete this ingredient record? This action will permanently remove it from the active inventory catalog."
        confirmText="Delete Ingredient"
        type="danger"
      />

      {/* 7. Column Export Dialog */}
      <ColumnExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        data={filteredIngredients}
        availableColumns={[
          { key: 'name', header: 'Ingredient Name' },
          { key: 'category', header: 'Category' },
          { key: 'quantity', header: 'Current Stock', format: (val, row) => `${val} ${row.unit || ''}` },
          { key: 'unit', header: 'Unit' },
          { key: 'costPerUnit', header: 'Cost Per Unit (INR)', format: (val) => formatINR(val) },
          {
            key: 'totalValue',
            header: 'Total Value (INR)',
            format: (_, row) => formatINR((row.quantity || 0) * (row.costPerUnit || 0)),
          },
          { key: 'minThreshold', header: 'Min Safety Threshold', format: (val, row) => `${val} ${row.unit || ''}` },
          { key: 'status', header: 'Stock Status', format: (val) => (val || '').replace('_', ' ').toUpperCase() },
          { key: 'supplierName', header: 'Supplier' },
          { key: 'storageLocation', header: 'Storage Location' },
          { key: 'batchNumber', header: 'Batch Number' },
          { key: 'expiryDate', header: 'Expiry Date' },
        ]}
        reportTitle={`Kitchen Inventory — ${currentBranch?.name || 'Active Branch'}`}
        fileNamePrefix="stockmate_kitchen_inventory"
        filtersSummary={{
          Category: selectedCategory !== 'all' ? selectedCategory : 'All',
          Status: categoryFilter !== 'all' ? categoryFilter.toUpperCase() : 'All',
          Search: searchTerm || 'None',
        }}
      />

      {/* 8. Excel Import Dialog */}
      <ExcelImportDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        moduleType="inventory"
        targetBranchName={currentBranch?.name || 'Current Outlet'}
        existingRecords={restaurantIngredients}
        onImportConfirm={importIngredientsBulk}
      />
    </div>
  );
};
