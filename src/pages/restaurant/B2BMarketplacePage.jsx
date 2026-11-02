import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Store,
  Search,
  Filter,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  X,
  CreditCard,
  Building2,
  Boxes,
  Layers,
  Award,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Globe,
  Handshake,
  RotateCcw,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { SUPPLIER_CATEGORIES } from '../../data/supplierMarketplaceData';
import { formatINR } from '../../data/inventoryBillingData';

export const B2BMarketplacePage = () => {
  const navigate = useNavigate();
  const {
    supplierProducts,
    suppliers,
    supplierAgreements,
    createMarketplacePO,
    currentUser,
    currentRestaurant,
    currentBranch,
    addToast,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedSupplierId, setSelectedSupplierId] = useState('all');
  const [supplierTypeFilter, setSupplierTypeFilter] = useState('all'); // 'all' | 'third-party' | 'tie-up'
  const [onlyOrganic, setOnlyOrganic] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  // Cart state: array of { ...product, quantity }
  const [cart, setCart] = useState([]);

  const getProductSupplierReturnPolicy = (prod) => {
    const sup = (suppliers || []).find(
      (s) => s.id === prod.supplierId || s.name?.toLowerCase() === prod.supplierName?.toLowerCase()
    );
    const agr = (supplierAgreements || []).find((a) => a.supplierId === prod.supplierId);
    const accepts = sup?.acceptsReturns !== undefined
      ? sup.acceptsReturns
      : agr
      ? Boolean(agr.acceptsReturns ?? agr.unsoldReturnAllowed)
      : prod.supplierId !== 'sup-1' && prod.supplierId !== 'sup-3' && prod.supplierId !== 'sup-6';
    return {
      accepts,
      windowHours: sup?.returnWindowHours || agr?.returnWindowHours || 36,
      conditions: [
        (sup?.returnConditions?.unused ?? agr?.coversUnused ?? agr?.unsoldReturnAllowed ?? true) && 'Unused',
        (sup?.returnConditions?.damaged ?? agr?.coversDamaged ?? true) && 'Damaged',
        (sup?.returnConditions?.spoiled ?? agr?.coversSpoiled ?? true) && 'Spoiled',
      ].filter(Boolean).join(', '),
    };
  };

  // Resolve whether product supplier is Third-Party vs Tie-up
  const getProductSupplierType = (prod) => {
    const sup = (suppliers || []).find(
      (s) => s.id === prod.supplierId || s.name?.toLowerCase() === prod.supplierName?.toLowerCase()
    );
    if (sup?.supplierType) return sup.supplierType;
    if (prod.supplierType) return prod.supplierType;
    if (
      sup?.registeredVia === 'main_system' ||
      prod.registeredVia === 'main_system' ||
      prod.supplierId === 'sup-4' ||
      prod.supplierId === 'sup-5' ||
      prod.supplierName?.toLowerCase().includes('golden crust') ||
      prod.supplierName?.toLowerCase().includes('amrit dairy')
    ) {
      return 'Tie-up Supplier';
    }
    if (
      sup?.registeredVia === 'supplier_portal' ||
      prod.registeredVia === 'supplier_portal' ||
      prod.supplierId === 'sup-1' ||
      prod.supplierId === 'sup-2' ||
      prod.supplierId === 'sup-3' ||
      prod.supplierId === 'sup-6' ||
      prod.supplierId === 'sup-diksha'
    ) {
      return 'Third-Party Supplier';
    }
    return 'Tie-up Supplier';
  };

  const thirdPartyProductCount = useMemo(() => {
    return (supplierProducts || []).filter(
      (p) => getProductSupplierType(p) === 'Third-Party Supplier'
    ).length;
  }, [supplierProducts, suppliers]);

  const tieUpProductCount = useMemo(() => {
    return (supplierProducts || []).filter(
      (p) => getProductSupplierType(p) === 'Tie-up Supplier'
    ).length;
  }, [supplierProducts, suppliers]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return supplierProducts.filter((prod) => {
      const matchesSearch =
        prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prod.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prod.supplierName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat =
        selectedCategory === 'All Categories' || prod.category === selectedCategory;

      const matchesSup =
        selectedSupplierId === 'all' || prod.supplierId === selectedSupplierId;

      const matchesOrganic = !onlyOrganic || prod.organic;

      const prodSupType = getProductSupplierType(prod);
      const matchesSupplierType =
        supplierTypeFilter === 'all' ||
        (supplierTypeFilter === 'third-party' && prodSupType === 'Third-Party Supplier') ||
        (supplierTypeFilter === 'tie-up' && prodSupType === 'Tie-up Supplier');

      return matchesSearch && matchesCat && matchesSup && matchesOrganic && matchesSupplierType && prod.inStock;
    });
  }, [supplierProducts, searchTerm, selectedCategory, selectedSupplierId, supplierTypeFilter, onlyOrganic, suppliers]);

  // Cart Operations
  const handleAddToCart = (product, qtyToAdd = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + qtyToAdd }
            : item
        );
      } else {
        const initialQty = Math.max(qtyToAdd, product.minOrderQty || 1);
        return [...prev, { ...product, quantity: initialQty }];
      }
    });
    addToast(`Added ${product.name} to Procurement Cart`, 'success');
  };

  const handleUpdateCartQty = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Cart Totals
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartTax = Number((cartSubtotal * 0.05).toFixed(2)); // 5% GST
  const cartShipping = cartSubtotal > 1500 || cartSubtotal === 0 ? 0 : 150;
  const cartTotal = cartSubtotal + cartTax + cartShipping;
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Group items by supplier for multi-supplier order dispatch
  const cartBySupplier = useMemo(() => {
    const map = {};
    cart.forEach((item) => {
      if (!map[item.supplierId]) {
        map[item.supplierId] = {
          supplierId: item.supplierId,
          supplierName: item.supplierName,
          items: [],
        };
      }
      map[item.supplierId].items.push(item);
    });
    return Object.values(map);
  }, [cart]);

  // PO Creation Form State inside Cart
  const [poNotes, setPoNotes] = useState('B2B Wholesale Procurement order for weekly kitchen prep.');
  const [expectedDate, setExpectedDate] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [isSubmittingPO, setIsSubmittingPO] = useState(false);

  const handleSubmitProcurementOrder = () => {
    if (cart.length === 0) return;
    setIsSubmittingPO(true);

    setTimeout(() => {
      try {
        // Create PO for each distinct supplier in cart - directly dispatches to supplier!
        cartBySupplier.forEach((supGroup) => {
          createMarketplacePO({
            supplierId: supGroup.supplierId,
            items: supGroup.items,
            notes: poNotes,
            expectedDelivery: expectedDate,
            requireApproval: false,
          });
        });

        setIsSubmittingPO(false);
        setCart([]);
        setCartDrawerOpen(false);
        navigate('/purchase-orders');
      } catch (err) {
        setIsSubmittingPO(false);
        addToast('Failed to create Purchase Order: ' + err.message, 'error');
      }
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Third-Party Supplier B2B Marketplace"
        subtitle="Source commercial ingredients directly from verified wholesale producers, dairy farms, and distributors."
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Verified Wholesale Exchange</span>
          </span>
        }
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              icon={ShoppingBag}
              onClick={() => navigate('/purchase-orders')}
            >
              Active POs
            </Button>

            {/* Cart Trigger Button */}
            <button
              onClick={() => setCartDrawerOpen(true)}
              className="relative px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Store className="w-4 h-4 text-emerald-400" />
              <span>Procurement Cart</span>
              {totalCartCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px]">
                  {totalCartCount}
                </span>
              )}
              {cartSubtotal > 0 && (
                <span className="font-mono text-emerald-400 border-l border-slate-700 pl-2">
                  ₹{cartSubtotal.toLocaleString('en-IN')}
                </span>
              )}
            </button>
          </div>
        }
      />

      {/* Verified Suppliers Showcase Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shrink-0 font-bold shadow-lg shadow-emerald-500/20">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black">Direct Supplier B2B Procurement Protocol</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold">
                Zero Middlemen Commission
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Place wholesale requisitions with certified farm producers. Orders automatically generate digital POs, dispatch alerts, and update your restaurant inventory upon dock inspection.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
          <Link
            to="/supplier-portal"
            target="_blank"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-slate-950/60 hover:bg-slate-950 px-3 py-2 rounded-xl border border-emerald-500/30 transition-all flex items-center gap-1.5"
          >
            <span>Are you a Supplier? Vendor Portal Login</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Supplier Registration Source Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSupplierTypeFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              supplierTypeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>All Catalog Items</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700/50 text-slate-200 font-bold">
              {supplierProducts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSupplierTypeFilter('third-party')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              supplierTypeFilter === 'third-party'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-200/60 hover:bg-indigo-100'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Third-Party Suppliers (Portal)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              supplierTypeFilter === 'third-party' ? 'bg-indigo-800 text-white' : 'bg-indigo-200 text-indigo-900'
            }`}>
              {thirdPartyProductCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSupplierTypeFilter('tie-up')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              supplierTypeFilter === 'tie-up'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-teal-50 text-teal-700 border border-teal-200/60 hover:bg-teal-100'
            }`}
          >
            <Handshake className="w-3.5 h-3.5" />
            <span>Tie-up Suppliers (Main System)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              supplierTypeFilter === 'tie-up' ? 'bg-teal-800 text-white' : 'bg-teal-200 text-teal-900'
            }`}>
              {tieUpProductCount}
            </span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 font-medium hidden lg:block">
          Differentiating wholesale catalog items by supplier registration origin
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {SUPPLIER_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search produce, dairy, spices, SKU..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          {/* Supplier Filter */}
          <select
            value={selectedSupplierId}
            onChange={(e) => setSelectedSupplierId(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 text-slate-700 font-medium"
          >
            <option value="all">All Partner Suppliers ({suppliers.length})</option>
            {suppliers.map((s) => {
              const type = s.supplierType || (s.planName || s.registeredVia === 'supplier_portal' ? 'Third-Party' : 'Tie-up');
              return (
                <option key={s.id} value={s.id}>
                  {s.name} [{type} Supplier]
                </option>
              );
            })}
          </select>
        </div>

        {/* Organic Filter Toggle & Count */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
            <input
              type="checkbox"
              checked={onlyOrganic}
              onChange={(e) => setOnlyOrganic(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <span>Organic Certified Only</span>
          </label>

          <span className="text-xs text-slate-500">
            <strong>{filteredProducts.length}</strong> items available
          </span>
        </div>
      </div>

      {/* Marketplace Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredProducts.map((prod) => {
          const cartItem = cart.find((c) => c.id === prod.id);

          return (
            <div
              key={prod.id}
              className="group bg-white rounded-2xl border border-slate-200 hover:border-emerald-500/60 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden"
            >
              {/* Product Visual */}
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
                      Organic
                    </span>
                  )}
                </div>

                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-xs text-slate-800 text-[10px] font-bold shadow-xs">
                  {prod.leadTimeDays === 0 ? 'Same-day delivery' : `${prod.leadTimeDays}-day delivery`}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  {/* Supplier Attribution & Supplier Type Tag */}
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-1.5 truncate max-w-[140px]">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-xs font-bold text-slate-700 truncate" title={prod.supplierName}>
                        {prod.supplierName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                      {(() => {
                        const supType = getProductSupplierType(prod);
                        const isTieUp = supType === 'Tie-up Supplier';
                        return (
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold ${
                              isTieUp
                                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                                : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                            }`}
                            title={isTieUp ? 'Tie-up Supplier (Added via Main System)' : 'Third-Party Supplier (External Supplier Portal)'}
                          >
                            {isTieUp ? <Handshake className="w-2.5 h-2.5 text-teal-600" /> : <Globe className="w-2.5 h-2.5 text-indigo-600" />}
                            <span>{isTieUp ? 'Tie-up' : 'Third-Party'}</span>
                          </span>
                        );
                      })()}
                      <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {prod.supplierRating || 4.9}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                    {prod.name}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {prod.description || 'Verified wholesale food supply item.'}
                  </p>

                  {/* Return Policy SLA Tag */}
                  {(() => {
                    const policy = getProductSupplierReturnPolicy(prod);
                    return policy.accepts ? (
                      <div
                        className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-700 font-semibold"
                        title={`Supplier accepts returns for: ${policy.conditions || 'Unused, damaged, or spoiled items'} (${policy.windowHours}h window)`}
                      >
                        <RotateCcw className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Returns Accepted ({policy.windowHours}h SLA)</span>
                      </div>
                    ) : (
                      <div
                        className="mt-2 flex items-center gap-1 text-[10px] text-slate-400 font-medium"
                        title="Final Sale - Vendor has strict no-returns policy once accepted at dock"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0"></span>
                        <span>Final Sale (No Returns)</span>
                      </div>
                    );
                  })()}

                  {/* Price & MOQ */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-black text-slate-900">
                          ₹{prod.price}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">/{prod.unit}</span>
                      </div>
                      {prod.mrp && prod.mrp > prod.price && (
                        <span className="text-[10px] text-slate-400 line-through">
                          MRP ₹{prod.mrp}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-semibold">Min. Order (MOQ)</span>
                      <span className="text-xs font-bold text-slate-700">
                        {prod.minOrderQty} {prod.unit}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Add to Cart / Requisition Button */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  {cartItem ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-1">
                      <button
                        type="button"
                        onClick={() => handleUpdateCartQty(prod.id, cartItem.quantity - 1)}
                        className="w-7 h-7 rounded-lg bg-white text-emerald-700 font-bold flex items-center justify-center hover:bg-emerald-100 shadow-xs"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-black text-emerald-950">
                        {cartItem.quantity} {prod.unit}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateCartQty(prod.id, cartItem.quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-white text-emerald-700 font-bold flex items-center justify-center hover:bg-emerald-100 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAddToCart(prod, prod.minOrderQty || 1)}
                      className="w-full py-2 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to PO Requisition</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Cart Pill (Mobile & Desktop) */}
      {cart.length > 0 && !cartDrawerOpen && (
        <div className="fixed bottom-6 right-6 z-40 animate-in fade-in slide-in-from-bottom-4">
          <button
            onClick={() => setCartDrawerOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-black text-sm shadow-2xl shadow-emerald-500/40 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
          >
            <div className="relative">
              <Store className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full bg-slate-950 text-white text-[10px] font-black">
                {cart.length}
              </span>
            </div>
            <span>Review Requisition (₹{cartTotal.toLocaleString('en-IN')})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Slide-over Procurement Cart Drawer */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setCartDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Procurement Requisition Cart</h3>
                    <span className="text-xs text-slate-500">
                      {cart.length} item{cart.length > 1 ? 's' : ''} from {cartBySupplier.length} supplier{cartBySupplier.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setCartDrawerOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Items List */}
              <div className="p-5 overflow-y-auto flex-1 divide-y divide-slate-100 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 text-xs">
                    <Store className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p className="font-semibold text-slate-600">Your Procurement Cart is Empty</p>
                    <p className="mt-1">Browse wholesale ingredients from verified suppliers and click "+ Add to Requisition".</p>
                  </div>
                ) : (
                  cartBySupplier.map((group) => (
                    <div key={group.supplierId} className="pt-3 first:pt-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                          {group.supplierName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          PO Group #{group.supplierId}
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {group.items.map((item) => (
                          <div
                            key={item.id}
                            className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-bold text-slate-900 truncate">
                                {item.name}
                              </h5>
                              <span className="text-[11px] text-slate-500">
                                ₹{item.price}/{item.unit}
                              </span>
                            </div>

                            {/* Qty Stepper */}
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleUpdateCartQty(item.id, item.quantity - 1)}
                                className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold text-slate-900 w-6 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateCartQty(item.id, item.quantity + 1)}
                                className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="text-xs font-black text-slate-900 min-w-[50px] text-right">
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Checkout Footer */}
              {cart.length > 0 && (
                <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3.5">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Expected Delivery Date</label>
                      <input
                        type="date"
                        value={expectedDate}
                        onChange={(e) => setExpectedDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Delivery Destination</label>
                      <div className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 font-semibold truncate">
                        {currentBranch?.name || 'Main Kitchen Dock'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Procurement Notes</label>
                    <input
                      type="text"
                      value={poNotes}
                      onChange={(e) => setPoNotes(e.target.value)}
                      placeholder="Special delivery instructions, timing..."
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="pt-2 border-t border-slate-200/80 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Items Subtotal</span>
                      <span>₹{cartSubtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>GST (5%)</span>
                      <span>₹{cartTax.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Logistics &amp; Delivery</span>
                      <span>{cartShipping === 0 ? <strong className="text-emerald-700 font-bold">FREE</strong> : `₹${cartShipping}`}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                      <span>Estimated PO Total</span>
                      <span className="text-emerald-700">₹{cartTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Submission CTA */}
                  <button
                    type="button"
                    disabled={isSubmittingPO}
                    onClick={handleSubmitProcurementOrder}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {isSubmittingPO ? (
                      <span>Generating Digital Purchase Order...</span>
                    ) : (
                      <>
                        <span>Submit as Purchase Order (PO)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-slate-500">
                    {currentUser?.role === 'restaurant_owner'
                      ? '✓ Authorized as Owner: Dispatches directly to supplier queue.'
                      : 'ℹ Staff Requisition: Submitted for General Manager sign-off before dispatch.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

