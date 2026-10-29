import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Boxes,
  Store,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Edit2,
  Trash2,
  Eye,
  IndianRupee,
  Layers,
  Award,
  Package,
  ArrowRight,
  TrendingUp,
  LayoutGrid,
  List,
  ShieldCheck,
  Globe,
  Handshake,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import {
  SUPPLIER_CATEGORIES,
  SUPPLIER_SUBSCRIPTION_PLANS,
  autoDetectProductCategory,
  normalizeSupplierCategory,
} from '../../data/supplierMarketplaceData';
import { formatINR } from '../../data/inventoryBillingData';

export const SupplierProductsPage = () => {
  const navigate = useNavigate();
  const {
    supplierProducts,
    addSupplierProduct,
    updateSupplierProduct,
    deleteSupplierProduct,
    toggleSupplierProductStock,
    currentUser,
    suppliers,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Active supplier details
  const activeSupplierId = currentUser?.supplierId;
  const mySupplier = suppliers.find((s) => s.id === activeSupplierId || s.name === currentUser?.supplierName) || {
    id: activeSupplierId,
    name: currentUser?.supplierName || currentUser?.name || 'Partner',
    planName: 'Pro Vendor',
    rating: 4.8,
    categories: ['Dairy & Cheese'],
  };

  // Normalized categories registered by this supplier
  const registeredCategories = useMemo(() => {
    const raw = mySupplier?.categories || currentUser?.categories || ['Dairy & Cheese'];
    const list = Array.isArray(raw) ? raw : [raw];
    return list.map(normalizeSupplierCategory);
  }, [mySupplier, currentUser]);

  const activePlan =
    SUPPLIER_SUBSCRIPTION_PLANS.find((p) => p.name === mySupplier.planName) ||
    SUPPLIER_SUBSCRIPTION_PLANS[1];

  // Strictly filter products for this supplier only - no other supplier products!
  const myProducts = useMemo(() => {
    return (supplierProducts || []).filter(
      (p) =>
        (activeSupplierId && p.supplierId === activeSupplierId) ||
        (mySupplier.name && p.supplierName === mySupplier.name)
    );
  }, [supplierProducts, activeSupplierId, mySupplier.name]);

  // Suppliers can ONLY see products they added themselves
  const displayProducts = myProducts;

  const [groupByCategory, setGroupByCategory] = useState(true);

  const filteredProducts = useMemo(() => {
    return displayProducts.filter((prod) => {
      const matchesSearch =
        prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prod.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prod.description && prod.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCat =
        selectedCategory === 'All Categories' || prod.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [displayProducts, searchTerm, selectedCategory]);

  // Distinct categories available in current product list
  const catalogCategories = useMemo(() => {
    const cats = new Set(displayProducts.map((p) => p.category));
    registeredCategories.forEach((c) => cats.add(c));
    return Array.from(cats);
  }, [displayProducts, registeredCategories]);

  // Group products by category automatically for mapped division
  const productsByCategory = useMemo(() => {
    const grouped = {};
    filteredProducts.forEach((p) => {
      const cat = p.category || registeredCategories[0] || 'Dairy & Cheese';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(p);
    });
    return grouped;
  }, [filteredProducts, registeredCategories]);

  // Form State
  const initialFormState = {
    name: '',
    category: registeredCategories[0] || 'Dairy & Cheese',
    unit: 'kg',
    price: 150,
    mrp: 180,
    stock: 100,
    minOrderQty: 2,
    leadTimeDays: 1,
    shelfLifeDays: 7,
    fssai: '11522034000188',
    organic: false,
    description: '',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80',
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleOpenAdd = () => {
    const defaultCat = registeredCategories[0] || 'Dairy & Cheese';
    setFormData({
      ...initialFormState,
      category: defaultCat,
    });
    setIsAddModalOpen(true);
  };

  // Smart auto-detection when entering product name: eliminates redundant category selection
  const handleProductNameChange = (newName) => {
    const detected = autoDetectProductCategory(newName, registeredCategories[0]);
    // If supplier sells multiple registered categories and detected matches one, auto-select it!
    const targetCat = registeredCategories.includes(detected)
      ? detected
      : formData.category || registeredCategories[0];

    setFormData((prev) => ({
      ...prev,
      name: newName,
      category: targetCat,
    }));
  };

  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      unit: product.unit,
      price: product.price,
      mrp: product.mrp || Math.round(product.price * 1.25),
      stock: product.stock,
      minOrderQty: product.minOrderQty,
      leadTimeDays: product.leadTimeDays,
      shelfLifeDays: product.shelfLifeDays,
      fssai: product.fssai || '11522034000188',
      organic: Boolean(product.organic),
      description: product.description || '',
      image: product.image,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (isEditModalOpen && selectedProduct) {
      updateSupplierProduct(selectedProduct.id, formData);
      setIsEditModalOpen(false);
    } else {
      addSupplierProduct({
        ...formData,
        supplierId: activeSupplierId,
        supplierName: mySupplier.name,
        supplierPlan: mySupplier.planName || 'Pro Vendor',
      });
      setIsAddModalOpen(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      deleteSupplierProduct(productToDelete.id);
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    }
  };

  // Stats calculation
  const totalListed = displayProducts.length;
  const inStockCount = displayProducts.filter((p) => p.inStock && p.stock > 0).length;
  const lowStockCount = displayProducts.filter((p) => p.stock > 0 && p.stock < 20).length;
  const totalInventoryUnits = displayProducts.reduce((sum, p) => sum + (p.stock || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Supplier Inventory &amp; Catalog Management"
        subtitle={`Wholesale product listings published to the B2B Marketplace for 500+ restaurants.`}
        badge={
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{mySupplier.planName || 'Pro Vendor'} Tier ({totalListed}/{activePlan.maxProducts} SKUs)</span>
            </span>
            {(() => {
              const sType = mySupplier.supplierType || currentUser?.supplierType || (mySupplier.registeredVia === 'main_system' || currentUser?.registeredVia === 'main_system' || mySupplier.id === 'sup-4' || mySupplier.id === 'sup-5' ? 'Tie-up Supplier' : 'Third-Party Supplier');
              const isTieUp = sType === 'Tie-up Supplier';
              return (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                  isTieUp
                    ? 'bg-teal-50 text-teal-800 border border-teal-200'
                    : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                }`}>
                  {isTieUp ? <Handshake className="w-3 h-3 text-teal-600" /> : <Globe className="w-3 h-3 text-indigo-600" />}
                  <span>{sType}</span>
                </span>
              );
            })()}
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Store}
              onClick={() => navigate('/supplier/marketplace')}
            >
              Marketplace View
            </Button>
            <Button
              variant="brand"
              size="sm"
              icon={Plus}
              onClick={handleOpenAdd}
            >
              Add New Product
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Listed Products"
          value={totalListed}
          change={`Tier limit: ${activePlan.maxProducts} SKUs`}
          trend="neutral"
          subtext="Active in B2B Marketplace"
          icon={Boxes}
          accentColor="emerald"
        />

        <StatCard
          title="On-Hand Stock Units"
          value={totalInventoryUnits.toLocaleString('en-IN')}
          change="Available for PO dispatch"
          trend="up"
          subtext="Across all storage lots"
          icon={Package}
          accentColor="blue"
        />

        <StatCard
          title="Low Stock Alerts"
          value={lowStockCount}
          change={lowStockCount > 0 ? 'Replenishment needed' : 'All Optimal'}
          trend={lowStockCount > 0 ? 'down' : 'up'}
          subtext="Stock &lt; 20 units"
          icon={AlertTriangle}
          accentColor={lowStockCount > 0 ? 'amber' : 'emerald'}
        />

        <StatCard
          title="Commission Rate"
          value={`${activePlan.commissionRate}%`}
          change={`${activePlan.payoutDays} Settlements`}
          trend="up"
          subtext="B2B Marketplace fee"
          icon={ShieldCheck}
          accentColor="teal"
        />
      </div>

      {/* Filter and View Mode Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ingredient, SKU, category..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 text-slate-700 font-medium"
          >
            <option value="All Categories">All Categories</option>
            {catalogCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* View Switcher, Category Grouping & Result Count */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <label className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 font-medium cursor-pointer select-none">
            <input
              type="checkbox"
              checked={groupByCategory}
              onChange={(e) => setGroupByCategory(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>Group by Category</span>
          </label>

          <span className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{filteredProducts.length}</strong> products
          </span>

          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Navigation Pills for Direct Mapping & Division */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedCategory('All Categories')}
          className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
            selectedCategory === 'All Categories'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Items ({displayProducts.length})
        </button>
        {catalogCategories.map((cat) => {
          const count = displayProducts.filter((p) => p.category === cat).length;
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Products Grid View */}
      {viewMode === 'grid' ? (
        selectedCategory === 'All Categories' && groupByCategory ? (
          <div className="space-y-8">
            {Object.keys(productsByCategory).map((catName) => (
              <div key={catName} className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <h3 className="text-sm font-bold text-slate-900">{catName}</h3>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {productsByCategory[catName].length} items
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">Auto-mapped Category</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {productsByCategory[catName].map((prod) => (
                    <div
                      key={prod.id}
                      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500/50 shadow-xs hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col justify-between"
                    >
                      {/* Product Image & Badges */}
                      <div className="relative h-44 bg-slate-100 overflow-hidden">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                          <span className="px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                            {prod.category}
                          </span>
                          {prod.organic && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold">
                              Organic Certified
                            </span>
                          )}
                        </div>

                        <div className="absolute top-2.5 right-2.5">
                          <button
                            type="button"
                            onClick={() => toggleSupplierProductStock(prod.id)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                              prod.inStock
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {prod.inStock ? 'In Stock' : 'Paused'}
                          </button>
                        </div>
                      </div>

                      {/* Content Details */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                            {prod.name}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                            {prod.description || 'Wholesale commercial grade kitchen ingredient.'}
                          </p>

                          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-slate-400 block uppercase font-bold">Wholesale Price</span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-base font-black text-slate-900">
                                  ₹{prod.price}
                                </span>
                                <span className="text-xs text-slate-500">/{prod.unit}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block uppercase font-bold">Stock on Hand</span>
                              <span className={`text-xs font-bold ${prod.stock < 20 ? 'text-amber-600' : 'text-slate-800'}`}>
                                {prod.stock} {prod.unit}
                              </span>
                            </div>
                          </div>

                          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-xl">
                            <span>MOQ: <strong>{prod.minOrderQty} {prod.unit}</strong></span>
                            <span>Lead: <strong>{prod.leadTimeDays}d</strong></span>
                            <span>Life: <strong>{prod.shelfLifeDays}d</strong></span>
                          </div>
                        </div>

                        {/* Card Action Footer */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(prod)}
                            className="flex-1 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setProductToDelete(prod);
                              setDeleteConfirmOpen(true);
                            }}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="group bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500/50 shadow-xs hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col justify-between"
              >
                {/* Product Image & Badges */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                    <span className="px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                      {prod.category}
                    </span>
                    {prod.organic && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold">
                        Organic Certified
                      </span>
                    )}
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <button
                      type="button"
                      onClick={() => toggleSupplierProductStock(prod.id)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                        prod.inStock
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {prod.inStock ? 'In Stock' : 'Paused'}
                    </button>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                      {prod.name}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {prod.description || 'Wholesale commercial grade kitchen ingredient.'}
                    </p>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Wholesale Price</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-black text-slate-900">
                            ₹{prod.price}
                          </span>
                          <span className="text-xs text-slate-500">/{prod.unit}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Stock on Hand</span>
                        <span className={`text-xs font-bold ${prod.stock < 20 ? 'text-amber-600' : 'text-slate-800'}`}>
                          {prod.stock} {prod.unit}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-xl">
                      <span>MOQ: <strong>{prod.minOrderQty} {prod.unit}</strong></span>
                      <span>Lead: <strong>{prod.leadTimeDays}d</strong></span>
                      <span>Life: <strong>{prod.shelfLifeDays}d</strong></span>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(prod)}
                      className="flex-1 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setProductToDelete(prod);
                        setDeleteConfirmOpen(true);
                      }}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Products Table View */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Unit Price (₹)</th>
                  <th className="px-4 py-3">Stock Available</th>
                  <th className="px-4 py-3">MOQ</th>
                  <th className="px-4 py-3">Lead Time</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900 flex items-center gap-3">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-9 h-9 rounded-lg object-cover shrink-0"
                      />
                      <div>
                        <span className="block font-bold">{prod.name}</span>
                        <span className="text-[10px] text-slate-400">SKU: {prod.id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{prod.category}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      ₹{prod.price} <span className="text-[11px] font-normal text-slate-500">/{prod.unit}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${prod.stock < 20 ? 'text-amber-600' : 'text-slate-800'}`}>
                        {prod.stock} {prod.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{prod.minOrderQty} {prod.unit}</td>
                    <td className="px-4 py-3 text-slate-600">{prod.leadTimeDays} day</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleSupplierProductStock(prod.id)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          prod.inStock
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {prod.inStock ? 'Active' : 'Paused'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-1 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setProductToDelete(prod);
                            setDeleteConfirmOpen(true);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-slate-200">
          <Boxes className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            {myProducts.length === 0 ? 'No Products Listed Yet' : 'No Matching Products Found'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {myProducts.length === 0
              ? "You haven't added any products to your catalog yet. Click 'Add New Product' to list your wholesale ingredients and make them available to restaurants."
              : 'Try clearing your search term or category filters to see your listed items.'}
          </p>
          {myProducts.length === 0 && (
            <div className="mt-4">
              <Button variant="brand" size="sm" icon={Plus} onClick={handleOpenAdd}>
                Add Your First Product
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isEditModalOpen ? 'Edit Product Details' : 'List New Wholesale Ingredient'}
        size="lg"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Product / Ingredient Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleProductNameChange(e.target.value)}
                placeholder="e.g. Fresh Malai Paneer, Grade-A Eggs, Button Mushrooms"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Category automatically maps as you type
              </span>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category {registeredCategories.length === 1 ? '(Auto-Assigned)' : '*'}
              </label>
              {registeredCategories.length === 1 ? (
                <div className="flex items-center justify-between px-3 py-2 text-xs bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-bold">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{formData.category || registeredCategories[0]}</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100/80 px-2 py-0.5 rounded-md">
                    Auto-mapped
                  </span>
                </div>
              ) : (
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-semibold text-slate-800"
                >
                  {registeredCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Unit of Measure *</label>
              <input
                type="text"
                required
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g. kg, box, tray, liter"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Wholesale Price (₹) *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Initial Stock Units *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Min Order Qty (MOQ)</label>
              <input
                type="number"
                min="1"
                value={formData.minOrderQty}
                onChange={(e) => setFormData({ ...formData, minOrderQty: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lead Time (Days)</label>
              <input
                type="number"
                min="0"
                value={formData.leadTimeDays}
                onChange={(e) => setFormData({ ...formData, leadTimeDays: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Shelf Life (Days)</label>
              <input
                type="number"
                min="1"
                value={formData.shelfLifeDays}
                onChange={(e) => setFormData({ ...formData, shelfLifeDays: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Product Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Freshness standards, packaging details, storage instructions..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="organicCheck"
              checked={formData.organic}
              onChange={(e) => setFormData({ ...formData, organic: e.target.checked })}
              className="w-4 h-4 rounded-md text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <label htmlFor="organicCheck" className="text-xs font-medium text-slate-700">
              Certified Organic / Pesticide-Free
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="brand"
              size="sm"
            >
              {isEditModalOpen ? 'Save Changes' : 'Publish to Marketplace'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Remove Product Listing"
        message={`Are you sure you want to delete "${productToDelete?.name}" from your catalog? Restaurants will no longer be able to place new purchase orders for this SKU.`}
        confirmText="Remove Product"
        type="danger"
      />
    </div>
  );
};

