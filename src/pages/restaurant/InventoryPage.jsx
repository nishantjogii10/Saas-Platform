import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Scale,
  AlertTriangle,
  ClockAlert,
  ArrowUpDown,
  Calendar,
  Layers,
  ShoppingBag,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { SearchBar } from '../../components/common/SearchBar';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { FormInput } from '../../components/common/FormInput';
import { ColumnExportDialog } from '../../components/common/ColumnExportDialog';
import { ExcelImportDialog } from '../../components/common/ExcelImportDialog';
import { Download, UploadCloud } from 'lucide-react';
import { formatINR } from '../../data/inventoryBillingData';

export const InventoryPage = () => {
  const {
    restaurantIngredients,
    restaurantSuppliers,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    recordConsumption,
    currentUser,
    currentBranch,
    importIngredientsBulk,
  } = useApp();

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialFilter = searchParams.get('filter') || 'all';
  const initialAction = searchParams.get('action');

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(initialFilter);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(initialAction === 'add');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConsumeModalOpen, setIsConsumeModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);

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
    costPerUnit: 4.50,
    supplierId: restaurantSuppliers[0]?.id || '',
    supplierName: restaurantSuppliers[0]?.name || 'Local Supplier',
    batchNumber: 'BCH-NEW-101',
    storageLocation: 'Walk-in Chiller',
    expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  // Consume modal form state
  const [consumeAmount, setConsumeAmount] = useState(1);
  const [consumeReason, setConsumeReason] = useState('Line prep for service');

  useEffect(() => {
    if (initialAction === 'add') {
      setIsAddModalOpen(true);
    }
  }, [initialAction]);

  // Handle supplier change in form to sync name
  const handleSupplierChange = (supId) => {
    const sup = restaurantSuppliers.find(s => s.id === supId);
    setFormData({
      ...formData,
      supplierId: supId,
      supplierName: sup ? sup.name : 'Selected Supplier',
    });
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      category: 'Produce',
      quantity: 10,
      unit: 'kg',
      minThreshold: 5,
      costPerUnit: 3.50,
      supplierId: restaurantSuppliers[0]?.id || '',
      supplierName: restaurantSuppliers[0]?.name || 'Local Supplier',
      batchNumber: `BCH-${Math.floor(100 + Math.random() * 900)}`,
      storageLocation: 'Dry Storage',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (ingredient) => {
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

  const handleOpenConsume = (ingredient) => {
    setSelectedIngredient(ingredient);
    setConsumeAmount(Math.min(ingredient.quantity > 0 ? 1 : 0, ingredient.quantity));
    setConsumeReason('Line prep for lunch service');
    setIsConsumeModalOpen(true);
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    addIngredient(formData);
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (selectedIngredient) {
      updateIngredient(selectedIngredient.id, formData);
      setIsEditModalOpen(false);
    }
  };

  const handleSaveConsume = (e) => {
    e.preventDefault();
    if (selectedIngredient) {
      recordConsumption({
        ingredientId: selectedIngredient.id,
        amount: Number(consumeAmount),
        reason: consumeReason,
        staffName: currentUser.name,
        roleName: currentUser.role,
      });
      setIsConsumeModalOpen(false);
    }
  };

  // Extract unique categories
  const categories = ['all', ...new Set(restaurantIngredients.map(i => i.category))];

  // Filtered ingredients
  const filteredIngredients = restaurantIngredients.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

    let matchesStatus = true;
    if (categoryFilter === 'low_stock') matchesStatus = item.status === 'low_stock';
    else if (categoryFilter === 'out_of_stock') matchesStatus = item.status === 'out_of_stock';
    else if (categoryFilter === 'in_stock') matchesStatus = item.status === 'in_stock';

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const columns = [
    {
      header: 'Ingredient & Batch',
      accessor: 'name',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.name}</div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span className="font-medium text-slate-600">{row.category}</span>
            <span>•</span>
            <span className="font-mono text-[11px] text-slate-400">{row.batchNumber}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Current Stock',
      accessor: 'quantity',
      sortable: true,
      render: (row) => (
        <div>
          <div className="flex items-baseline gap-1">
            <span className={`text-base font-extrabold ${
              row.quantity === 0
                ? 'text-rose-600'
                : row.quantity <= row.minThreshold
                ? 'text-amber-600'
                : 'text-slate-900'
            }`}>
              {row.quantity}
            </span>
            <span className="text-xs text-slate-500 font-medium">{row.unit}</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Min Safety: {row.minThreshold} {row.unit}
          </div>
        </div>
      ),
    },
    {
      header: 'Unit Cost & Value',
      accessor: 'costPerUnit',
      sortable: true,
      render: (row) => (
        <div className="text-xs">
          <div className="font-semibold text-slate-800">
            {formatINR(row.costPerUnit)} / {row.unit}
          </div>
          <div className="text-slate-500 font-medium">
            Total: {formatINR(row.quantity * row.costPerUnit)}
          </div>
        </div>
      ),
    },
    {
      header: 'Stock Status',
      accessor: 'status',
      sortable: true,
      render: (row) => <Badge status={row.status} />,
    },
    {
      header: 'Supplier & Expiry',
      accessor: 'supplierName',
      sortable: true,
      render: (row) => (
        <div className="text-xs">
          <div className="font-medium text-slate-700 truncate max-w-[150px]">{row.supplierName}</div>
          <div className={`mt-0.5 ${
            row.daysUntilExpiry < 0
              ? 'text-rose-600 font-bold'
              : row.daysUntilExpiry <= 3
              ? 'text-amber-600 font-semibold'
              : 'text-slate-400'
          }`}>
            Exp: {row.expiryDate} ({row.daysUntilExpiry < 0 ? 'Expired' : `${row.daysUntilExpiry}d left`})
          </div>
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {/* Quick Record Usage shortcut for Workflow B */}
          <Button
            variant="ghost"
            size="xs"
            icon={Scale}
            title="Record kitchen consumption (Workflow B)"
            className="text-emerald-800 hover:bg-emerald-50"
            onClick={() => handleOpenConsume(row)}
          >
            Use
          </Button>

          <Button
            variant="ghost"
            size="xs"
            icon={Edit3}
            title="Edit item details"
            onClick={() => handleOpenEdit(row)}
          />

          {currentUser.role !== 'kitchen_staff' && (
            <Button
              variant="ghost"
              size="xs"
              icon={Trash2}
              title="Delete item"
              className="text-rose-600 hover:bg-rose-50"
              onClick={() => {
                setIngredientToDelete(row);
                setDeleteConfirmOpen(true);
              }}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kitchen Inventory Items"
        subtitle="Track on-hand ingredient volumes, minimum thresholds, unit costing, and consumption (Workflow B)"
        breadcrumbs={[
          { label: 'Restaurant', href: '#/dashboard' },
          { label: 'Inventory' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={() => setIsExportOpen(true)}
            >
              Export to Excel
            </Button>
            {currentUser.role !== 'kitchen_staff' && currentUser.role !== 'supplier' && (
              <Button
                variant="outline"
                size="sm"
                icon={UploadCloud}
                onClick={() => setIsImportOpen(true)}
              >
                Import Excel
              </Button>
            )}
            <Button
              variant="brand"
              size="sm"
              icon={Plus}
              onClick={handleOpenAdd}
            >
              Add New Ingredient
            </Button>
          </div>
        }
      />

      {/* Workflow B Step Indicator Notice */}
      <div className="p-4 rounded-2xl glass-panel bg-emerald-50/40 border-emerald-200/70 flex items-start gap-3 text-xs text-emerald-950">
        <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 font-bold text-[11px]">
          B
        </span>
        <div>
          <strong className="block font-semibold">Workflow B Interactive Flow:</strong>
          Click <strong>"Use"</strong> on any ingredient (or add/edit quantity) to record consumption. When the stock balance drops below the minimum threshold, it will automatically transition to <strong>Low Stock</strong> and trigger real-time alerts across your dashboard and alerts page!
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 glass-panel p-4">
        <div className="sm:col-span-5">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search ingredient, supplier, batch..."
            className="w-full"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">All Categories ({categories.length - 1})</option>
            {categories.filter(c => c !== 'all').map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-4 flex items-center gap-1 overflow-x-auto">
          {['all', 'in_stock', 'low_stock', 'out_of_stock'].map((f) => (
            <button
              key={f}
              onClick={() => setCategoryFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all select-none ${
                categoryFilter === f
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-sm font-bold active:scale-[0.98]'
                  : 'glass-pill text-slate-600 hover:text-slate-900 hover:bg-white/80 active:scale-[0.98]'
              }`}
            >
              {f === 'all' ? 'All Stock' : f.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Inventory Table */}
      <DataTable
        columns={columns}
        data={filteredIngredients}
        pageSize={8}
        emptyTitle="No ingredients found"
        emptyDescription="Try adjusting your search criteria or add your first ingredient."
      />

      {/* Add / Edit Ingredient Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isAddModalOpen ? 'Add New Ingredient' : `Edit ${formData.name}`}
        subtitle="Manage inventory specifications, minimum safety thresholds, and vendor links"
        maxWidth="max-w-2xl"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="brand"
              onClick={isAddModalOpen ? handleSaveAdd : handleSaveEdit}
            >
              {isAddModalOpen ? 'Add Ingredient' : 'Update Ingredient'}
            </Button>
          </>
        }
      >
        <form onSubmit={isAddModalOpen ? handleSaveAdd : handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Ingredient Name"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Grass-Fed Butter"
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
                'Oils & Fats',
                'Canned Goods',
                'Beverage & Bar',
                'Fuel & Consumables',
              ]}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput
              label="Current Quantity"
              name="quantity"
              type="number"
              step="any"
              min="0"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
            />

            <FormInput
              label="Measurement Unit"
              name="unit"
              type="select"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              options={['kg', 'grams', 'litres', 'ml', 'units', 'cans', 'packs', 'boxes']}
              required
            />

            <FormInput
              label="Min Threshold (Alert Level)"
              name="minThreshold"
              type="number"
              step="any"
              min="0"
              value={formData.minThreshold}
              onChange={(e) => setFormData({ ...formData, minThreshold: e.target.value })}
              helperText="Alerts trigger when stock <= threshold"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Cost Per Unit (₹ INR)"
              name="costPerUnit"
              type="number"
              step="0.01"
              min="0"
              value={formData.costPerUnit}
              onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
              required
            />

            <FormInput
              label="Preferred Supplier"
              name="supplierId"
              type="select"
              value={formData.supplierId}
              onChange={(e) => handleSupplierChange(e.target.value)}
              options={restaurantSuppliers.map(s => ({ label: s.name, value: s.id }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput
              label="Batch / Lot Number"
              name="batchNumber"
              value={formData.batchNumber}
              onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
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
        </form>
      </Modal>

      {/* Record Consumption Modal (Workflow B Step 3) */}
      {selectedIngredient && (
        <Modal
          isOpen={isConsumeModalOpen}
          onClose={() => setIsConsumeModalOpen(false)}
          title={`Record Consumption: ${selectedIngredient.name}`}
          subtitle={`Current stock: ${selectedIngredient.quantity} ${selectedIngredient.unit} • Threshold: ${selectedIngredient.minThreshold} ${selectedIngredient.unit}`}
          maxWidth="max-w-md"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsConsumeModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="brand" icon={Scale} onClick={handleSaveConsume}>
                Confirm Usage
              </Button>
            </>
          }
        >
          <form onSubmit={handleSaveConsume} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <span className="font-semibold block mb-1">Stock Balance Simulation:</span>
              If you consume <strong>{consumeAmount} {selectedIngredient.unit}</strong>, the new balance will be{' '}
              <strong>{Math.max(0, selectedIngredient.quantity - Number(consumeAmount)).toFixed(1)} {selectedIngredient.unit}</strong>.
              {selectedIngredient.quantity - Number(consumeAmount) <= selectedIngredient.minThreshold && (
                <span className="block text-amber-700 font-bold mt-1">
                  ⚠️ This will trigger an automatic Low Stock Alert!
                </span>
              )}
            </div>

            <FormInput
              label={`Amount Used (${selectedIngredient.unit})`}
              name="consumeAmount"
              type="number"
              step="any"
              min="0.1"
              max={selectedIngredient.quantity}
              value={consumeAmount}
              onChange={(e) => setConsumeAmount(e.target.value)}
              required
            />

            <FormInput
              label="Usage Reason / Service Session"
              name="consumeReason"
              value={consumeReason}
              onChange={(e) => setConsumeReason(e.target.value)}
              placeholder="e.g. Dinner rush butter chicken batch"
              required
            />
          </form>
        </Modal>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={() => {
          if (ingredientToDelete) {
            deleteIngredient(ingredientToDelete.id);
          }
        }}
        title={`Delete "${ingredientToDelete?.name}"?`}
        message="Are you sure you want to delete this ingredient record? This action will permanently remove it from the active inventory catalog."
        confirmText="Delete Ingredient"
        type="danger"
      />

      {/* Customizable Export & Excel Import Modals */}
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
          { key: 'totalValue', header: 'Total Value (INR)', format: (_, row) => formatINR((row.quantity || 0) * (row.costPerUnit || 0)) },
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

