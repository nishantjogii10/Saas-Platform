import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Store,
  Boxes,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  Edit2,
  ShieldCheck,
  Star,
  Truck,
  IndianRupee,
  Layers,
  ArrowRight,
  Eye,
  Send,
  Building2,
  ChevronRight,
  AlertCircle,
  Copy,
  Check,
  Percent,
  SlidersHorizontal,
  RefreshCw,
  Globe,
  Handshake,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  SUPPLIER_CATEGORIES,
  LIVE_MARKET_BENCHMARKS,
  LIVE_RESTAURANT_DEMAND,
} from '../../data/supplierMarketplaceData';
import { formatINR } from '../../data/inventoryBillingData';

export const SupplierMarketplaceViewPage = () => {
  const navigate = useNavigate();
  const {
    supplierProducts,
    updateSupplierProduct,
    toggleSupplierProductStock,
    currentUser,
    suppliers,
    addToast,
  } = useApp();

  // Active Tab: 'storefront' | 'benchmarks' | 'demands' | 'network'
  const [activeTab, setActiveTab] = useState('storefront');

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Quick Price Edit Modal State
  const [editPriceModalOpen, setEditPriceModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newPrice, setNewPrice] = useState(0);
  const [newStock, setNewStock] = useState(0);

  // RFQ / Demands Quote Modal State
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState(null);
  const [quotePrice, setQuotePrice] = useState('');
  const [quoteDeliveryHours, setQuoteDeliveryHours] = useState('12');
  const [quoteNote, setQuoteNote] = useState('');

  // Active Supplier Identification
  const activeSupplierId = currentUser?.supplierId;
  const mySupplier = suppliers.find((s) => s.id === activeSupplierId || s.name === currentUser?.supplierName) || {
    id: activeSupplierId,
    name: currentUser?.supplierName || currentUser?.name || 'Vendor Partner',
    rating: 4.8,
    category: 'Food & Ingredient Wholesaler',
    phone: '+91 98000 00000',
    email: currentUser?.email || 'vendor@supplier.com',
    planName: 'Pro Vendor',
    fssai: '11522034000188',
  };

  // Products belonging strictly to current supplier
  const myProducts = useMemo(() => {
    return (supplierProducts || []).filter(
      (p) => (activeSupplierId && p.supplierId === activeSupplierId) || (mySupplier.name && p.supplierName === mySupplier.name)
    );
  }, [supplierProducts, activeSupplierId, mySupplier.name]);

  // Strictly show own products - suppliers can never see other suppliers' products!
  const displayProducts = myProducts;

  // Filtered products for Storefront Preview
  const filteredProducts = useMemo(() => {
    return displayProducts.filter((prod) => {
      const matchesSearch =
        prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prod.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat =
        selectedCategory === 'All Categories' || prod.category === selectedCategory;
      const matchesStock = onlyInStock ? (prod.stock ?? 0) > 0 : true;

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [displayProducts, searchTerm, selectedCategory, onlyInStock]);

  // Supplier Metrics
  const totalListed = displayProducts.length;
  const inStockCount = displayProducts.filter((p) => (p.stock ?? 0) > 0).length;
  const avgWholesalePrice =
    totalListed > 0
      ? Math.round(
          displayProducts.reduce((sum, p) => sum + Number(p.price || 0), 0) / totalListed
        )
      : 0;

  // Handle Copy Storefront URL
  const handleCopyLink = () => {
    navigator.clipboard?.writeText(
      `${window.location.origin}/marketplace?supplierId=${activeSupplierId}`
    );
    setCopiedLink(true);
    addToast('Public Marketplace link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Open Quick Price Edit
  const handleOpenPriceEdit = (product) => {
    setSelectedProduct(product);
    setNewPrice(product.price);
    setNewStock(product.stock ?? 100);
    setEditPriceModalOpen(true);
  };

  // Save Quick Price Edit
  const handleSavePriceEdit = (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    updateSupplierProduct(selectedProduct.id, {
      price: Number(newPrice),
      stock: Number(newStock),
    });

    addToast(`Updated pricing for ${selectedProduct.name} to ${formatINR(newPrice)}`, 'success');
    setEditPriceModalOpen(false);
  };

  // Open Quote Modal for Demand
  const handleOpenQuote = (demand) => {
    setSelectedDemand(demand);
    setQuotePrice(demand.targetPrice ? demand.targetPrice.replace(/[^0-9]/g, '') : '250');
    setQuoteDeliveryHours('12');
    setQuoteNote('Guaranteed fresh delivery with temperature-controlled logistics.');
    setQuoteModalOpen(true);
  };

  // Submit Quote to Restaurant
  const handleSubmitQuote = (e) => {
    e.preventDefault();
    addToast(
      `Procurement Quote of ₹${quotePrice} sent to ${selectedDemand?.restaurantName}!`,
      'success'
    );
    setQuoteModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Header */}
      <PageHeader
        title="Supplier Marketplace View"
        subtitle="Inspect how restaurant buyers see your catalog, track real-time market price benchmarks, and fulfill inbound restaurant demands."
        breadcrumbs={[
          { label: 'Supplier Portal', href: '/supplier' },
          { label: 'Marketplace View' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition"
              title="Copy link to your storefront"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>Share Storefront Link</span>
                </>
              )}
            </button>

            <Button
              variant="outline"
              size="sm"
              icon={Eye}
              onClick={() => navigate('/marketplace')}
              className="text-xs"
            >
              Restaurant Buyer View
            </Button>

            <Button
              variant="primary"
              size="sm"
              icon={Boxes}
              onClick={() => navigate('/supplier/products')}
              className="text-xs bg-sky-600 hover:bg-sky-700 text-white"
            >
              Manage Catalog SKUs
            </Button>
          </div>
        }
      />

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Live Marketplace SKUs"
          value={totalListed}
          subtitle={`${inStockCount} active & ready for order`}
          icon={Store}
          color="sky"
        />
        <StatCard
          title="Market Price Competitiveness"
          value="94.2%"
          subtitle="Top 5% among verified wholesalers"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Inbound Restaurant RFQs"
          value={LIVE_RESTAURANT_DEMAND.length}
          subtitle="Direct demands pending quotes"
          icon={Send}
          color="amber"
        />
        <StatCard
          title="Avg Wholesale Item Price"
          value={formatINR(avgWholesalePrice)}
          subtitle="Across your published catalog"
          icon={IndianRupee}
          color="indigo"
        />
      </div>

      {/* Storefront Hero Preview Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border border-sky-800/40 p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-4 ring-sky-500/20">
              {mySupplier.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white tracking-tight">{mySupplier.name}</h2>
                <Badge variant="success" size="sm" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                  <CheckCircle2 className="w-3 h-3 mr-1 inline" /> Verified B2B Wholesaler
                </Badge>
                <Badge variant="info" size="sm" className="bg-sky-500/20 text-sky-300 border-sky-500/40">
                  {mySupplier.planName || 'Pro Vendor'} Plan
                </Badge>
                {(() => {
                  const sType = mySupplier.supplierType || currentUser?.supplierType || (mySupplier.registeredVia === 'main_system' || currentUser?.registeredVia === 'main_system' || mySupplier.id === 'sup-4' || mySupplier.id === 'sup-5' ? 'Tie-up Supplier' : 'Third-Party Supplier');
                  const isTieUp = sType === 'Tie-up Supplier';
                  return (
                    <Badge variant={isTieUp ? 'success' : 'info'} size="sm" className={isTieUp ? 'bg-teal-500/20 text-teal-300 border-teal-500/40' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'}>
                      {isTieUp ? <Handshake className="w-3 h-3 mr-1 inline" /> : <Globe className="w-3 h-3 mr-1 inline" />}
                      {sType}
                    </Badge>
                  );
                })()}
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1 text-amber-300">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {mySupplier.rating || 4.8} / 5.0 Buyer Rating
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Truck className="w-3.5 h-3.5 text-sky-400" />
                  Guaranteed 24h Cold-Chain Delivery
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-400 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  FSSAI: {mySupplier.fssai || '11522034000188'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-700/60 text-right">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Store Status</div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Accepting POs Live
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/marketplace')}
              className="bg-sky-600/20 hover:bg-sky-600/30 text-sky-200 border-sky-500/30 text-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              Open Live View
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('storefront')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
            activeTab === 'storefront'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Storefront Preview ({totalListed})</span>
        </button>

        <button
          onClick={() => setActiveTab('benchmarks')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
            activeTab === 'benchmarks'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Price Intelligence & Benchmarks</span>
          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
            Live
          </span>
        </button>

        <button
          onClick={() => setActiveTab('demands')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
            activeTab === 'demands'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Inbound Restaurant Demands</span>
          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-500/20 text-amber-300 font-bold">
            {LIVE_RESTAURANT_DEMAND.length} RFQs
          </span>
        </button>
      </div>

      {/* TAB 1: STOREFRONT PREVIEW */}
      {activeTab === 'storefront' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products or ingredients..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  {SUPPLIER_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-sky-600 focus:ring-sky-500 w-4 h-4"
                />
                In Stock Only
              </label>

              <div className="text-xs text-slate-400 ml-auto md:ml-0">
                Showing <strong className="text-white">{filteredProducts.length}</strong> of {totalListed} products
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
              <Boxes className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-medium text-slate-300">No products match your filters</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try clearing search terms or selecting another wholesale category to view your products.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All Categories');
                  setOnlyInStock(false);
                }}
                className="mt-4 text-xs"
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const discount =
                  product.mrp && product.mrp > product.price
                    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
                    : 0;

                const isInStock = (product.stock ?? 0) > 0;

                return (
                  <div
                    key={product.id}
                    className="group bg-slate-900/90 border border-slate-800 hover:border-sky-500/40 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col"
                  >
                    {/* Image & Badges */}
                    <div className="relative h-44 bg-slate-950 overflow-hidden">
                      <img
                        src={
                          product.image ||
                          'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80'
                        }
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-slate-300 border border-slate-700/50">
                          {product.category}
                        </span>
                        {product.organic && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-950/90 text-emerald-300 border border-emerald-700/50">
                            Organic
                          </span>
                        )}
                      </div>

                      {discount > 0 && (
                        <div className="absolute top-2 right-2">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-red-600 text-white shadow">
                            {discount}% OFF
                          </span>
                        </div>
                      )}

                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                        <button
                          onClick={() => toggleSupplierProductStock(product.id)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md transition ${
                            isInStock
                              ? 'bg-emerald-900/90 text-emerald-200 border border-emerald-600/50 hover:bg-emerald-800'
                              : 'bg-rose-900/90 text-rose-200 border border-rose-600/50 hover:bg-rose-800'
                          }`}
                        >
                          {isInStock ? `● ${product.stock ?? 100} ${product.unit} Available` : '○ Out of Stock'}
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="text-sm font-semibold text-white group-hover:text-sky-300 transition-colors line-clamp-2">
                          {product.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                          {product.description || `Fresh wholesale ingredient supplied in ${product.unit} packs.`}
                        </p>
                      </div>

                      {/* Specs */}
                      <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                        <div>
                          <span className="text-slate-500">Min Order: </span>
                          <strong className="text-slate-200">{product.minOrderQty ?? 1} {product.unit}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500">Lead Time: </span>
                          <strong className="text-slate-200">{product.leadTimeDays ?? 1}d Delivery</strong>
                        </div>
                        {product.shelfLifeDays && (
                          <div className="col-span-2">
                            <span className="text-slate-500">Shelf Life: </span>
                            <strong className="text-slate-200">{product.shelfLifeDays} Days</strong>
                          </div>
                        )}
                      </div>

                      {/* Pricing Row */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-baseline justify-between">
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                            Wholesale Price
                          </div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-bold text-white">
                              {formatINR(product.price)}
                            </span>
                            <span className="text-xs text-slate-400">/{product.unit}</span>
                            {product.mrp && product.mrp > product.price && (
                              <span className="text-[11px] text-slate-500 line-through ml-1">
                                {formatINR(product.mrp)}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenPriceEdit(product)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-sky-600 hover:text-white text-slate-300 transition"
                          title="Quick Edit Wholesale Price & Stock"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRICE INTELLIGENCE & BENCHMARKS */}
      {activeTab === 'benchmarks' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Live Wholesale Market Price Intelligence
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Real-time price index compiled across 6 wholesale vendors and 30+ regional restaurants. Keeping your wholesale prices competitive wins more Purchase Orders.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => addToast('Market benchmarks refreshed from regional hubs.', 'info')}
              className="text-xs"
            >
              Refresh Index
            </Button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/90 shadow-lg">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Commodity / Product</th>
                  <th className="py-3 px-4">Wholesale Category</th>
                  <th className="py-3 px-4">Market Average</th>
                  <th className="py-3 px-4">Range (Low – High)</th>
                  <th className="py-3 px-4">7-Day Trend</th>
                  <th className="py-3 px-4">Demand Level</th>
                  <th className="py-3 px-4">Your Listing Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {LIVE_MARKET_BENCHMARKS.map((bench) => {
                  // Check if supplier has a matching product
                  const myMatch = displayProducts.find(
                    (p) =>
                      p.name.toLowerCase().includes(bench.productName.toLowerCase().split(' ')[0]) ||
                      bench.productName.toLowerCase().includes(p.name.toLowerCase().split(' ')[0])
                  );

                  const isCheaper = myMatch ? myMatch.price < bench.marketAvgPrice : false;
                  const priceDiff = myMatch
                    ? Math.round(
                        ((myMatch.price - bench.marketAvgPrice) / bench.marketAvgPrice) * 100
                      )
                    : null;

                  return (
                    <tr key={bench.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {bench.productName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 border border-slate-700">
                          {bench.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-100 text-sm">
                        {formatINR(bench.marketAvgPrice)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono">
                        {formatINR(bench.lowestMarketPrice)} – {formatINR(bench.highestMarketPrice)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${
                            bench.weeklyTrend.startsWith('+')
                              ? 'text-rose-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {bench.weeklyTrend.startsWith('+') ? (
                            <TrendingUp className="w-3.5 h-3.5" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5" />
                          )}
                          {bench.weeklyTrend}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={bench.demandLevel.includes('Very High') ? 'danger' : 'info'}
                          size="sm"
                        >
                          {bench.demandLevel}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        {myMatch ? (
                          <div>
                            <div className="font-semibold text-white">
                              {formatINR(myMatch.price)}/{myMatch.unit}
                            </div>
                            <span
                              className={`text-[10px] font-bold ${
                                isCheaper ? 'text-emerald-400' : 'text-amber-400'
                              }`}
                            >
                              {priceDiff > 0 ? `+${priceDiff}% vs avg` : `${priceDiff}% vs avg (Competitive)`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Not Listed</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {myMatch ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenPriceEdit(myMatch)}
                            className="text-xs py-1 px-2.5"
                          >
                            Adjust Price
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate('/supplier/products')}
                            className="text-xs py-1 px-2.5 bg-sky-600 hover:bg-sky-700 text-white"
                          >
                            + Add SKU
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: INBOUND RESTAURANT DEMANDS */}
      {activeTab === 'demands' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-sky-400" />
                Live Restaurant Procurement Requests (RFQs)
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Partner restaurants have posted immediate bulk ingredient requirements. Submit instant competitive quotes to convert them directly into Purchase Orders.
              </p>
            </div>
            <div className="text-xs px-3 py-1.5 rounded-lg bg-sky-950/80 border border-sky-800/50 text-sky-300 font-medium">
              ● Live updates every 15 mins
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LIVE_RESTAURANT_DEMAND.map((demand) => (
              <div
                key={demand.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-sky-500/40 rounded-xl p-5 shadow-sm hover:shadow-lg transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-sky-400 font-bold">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{demand.restaurantName}</h4>
                        <p className="text-xs text-slate-400">{demand.branch}</p>
                      </div>
                    </div>

                    <Badge
                      variant={demand.urgency.includes('Immediate') ? 'danger' : 'warning'}
                      size="sm"
                    >
                      {demand.urgency}
                    </Badge>
                  </div>

                  <div className="mt-4 p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Required Ingredient:</span>
                      <strong className="text-white font-medium">{demand.requestedItem}</strong>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Volume Required:</span>
                      <strong className="text-sky-300 font-semibold">{demand.neededQuantity}</strong>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Target Restaurant Budget:</span>
                      <strong className="text-emerald-400 font-bold">{demand.targetPrice}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Posted {demand.timestamp}
                  </span>

                  <Button
                    variant="primary"
                    size="sm"
                    icon={Send}
                    onClick={() => handleOpenQuote(demand)}
                    className="text-xs bg-sky-600 hover:bg-sky-700 text-white"
                  >
                    Submit Procurement Quote
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QUICK PRICE & STOCK EDIT MODAL */}
      <Modal
        isOpen={editPriceModalOpen}
        onClose={() => setEditPriceModalOpen(false)}
        title="Quick Edit Wholesale Price & Stock"
        maxWidth="max-w-md"
      >
        {selectedProduct && (
          <form onSubmit={handleSavePriceEdit} className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <h4 className="text-xs font-semibold text-white">{selectedProduct.name}</h4>
                <p className="text-[11px] text-slate-400">Category: {selectedProduct.category}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Wholesale Price (₹ / {selectedProduct.unit})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500">₹</span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Available Stock ({selectedProduct.unit})
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-sky-950/40 border border-sky-800/40 text-[11px] text-sky-300">
              💡 Changes reflect immediately on the B2B Marketplace. Registered restaurants will see your new price in search results.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditPriceModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="bg-sky-600 hover:bg-sky-700 text-white"
              >
                Save & Update Marketplace
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* SUBMIT QUOTE TO RESTAURANT DEMAND MODAL */}
      <Modal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        title="Submit Commercial Quote to Restaurant"
        maxWidth="max-w-lg"
      >
        {selectedDemand && (
          <form onSubmit={handleSubmitQuote} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs font-bold text-white">{selectedDemand.restaurantName}</div>
              <div className="text-[11px] text-slate-400">{selectedDemand.branch}</div>
              <div className="mt-2 text-xs flex justify-between">
                <span className="text-slate-400">Requested Item:</span>
                <strong className="text-sky-300">{selectedDemand.requestedItem}</strong>
              </div>
              <div className="text-xs flex justify-between mt-1">
                <span className="text-slate-400">Volume:</span>
                <strong className="text-white">{selectedDemand.neededQuantity}</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Your Offered Unit Price (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500">₹</span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quotePrice}
                    onChange={(e) => setQuotePrice(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Committed Delivery SLA (Hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="72"
                  value={quoteDeliveryHours}
                  onChange={(e) => setQuoteDeliveryHours(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Fulfillment & Quality Assurance Notes
              </label>
              <textarea
                rows={3}
                value={quoteNote}
                onChange={(e) => setQuoteNote(e.target.value)}
                placeholder="Include FSSAI batch assurance, cold storage transit, payment terms..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuoteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={Send}
                className="bg-sky-600 hover:bg-sky-700 text-white"
              >
                Dispatch Quote to Buyer
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

