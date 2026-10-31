import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  CreditCard,
  Check,
  Edit3,
  Building2,
  Plus,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  FileCheck,
  RotateCcw,
  X,
  Trash2,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Eye,
  Info,
  Sliders,
  Store,
  Users,
  Package,
  Truck,
  Receipt,
  Search,
  Filter,
  CheckCircle2,
  Download,
  Printer,
  Globe,
  Handshake,
  Tag,
  ExternalLink,
  Monitor,
  Tablet,
  Bike,
  ChefHat,
  ToggleLeft,
  ToggleRight,
  Settings2,
  Lock,
  Clock,
  Percent,
  ShieldCheck,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { formatINR } from '../../data/inventoryBillingData';
import { calculatePlanSavings } from '../../services/pricingEngine';
import { SUPPLIER_SUBSCRIPTION_PLANS } from '../../data/supplierMarketplaceData';

const STANDARD_MODULE_CATEGORIES = [
  'Core POS',
  'Pantry & Kitchen',
  'Food Cost Optimization',
  'Procurement & Supply Chain',
  'Front of House',
  'Multi-Unit Governance',
  'Integrations',
];

export const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const {
    plans,
    restaurants,
    suppliers,
    supplierPlanPayments,
    updatePlan,
    resetPlansToDefaults,
    assignPlanToRestaurant,
    customPlanRequests = [],
    currentUser,
    customPlanModules = [],
    pricingUnitRates = {},
    addCustomPlanModule,
    updateCustomPlanModule,
    deleteCustomPlanModule,
    assignCustomPlanToRestaurant,
    updatePricingUnitRates,
    resetCustomPlanModulesToDefaults,
    reviewCustomPlanRequest,
  } = useApp();

  // Top navigation tabs: Restaurant Plans, Third-Party Supplier Plans, Supplier Payment History
  const [mainTab, setMainTab] = useState('restaurant_plans'); // 'restaurant_plans' | 'custom_plan_rules' | 'supplier_plans' | 'supplier_payments'

  // Supplier Payment History Search, Filter & Receipt Modal
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentPlanFilter, setPaymentPlanFilter] = useState('all');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  const pendingReviewsCount = (customPlanRequests || []).filter(
    (r) => (r.path === 'PATH_C' || r.requiresManualReview) && r.status === 'pending_review'
  ).length;

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [showComparisonTable, setShowComparisonTable] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState('general'); // 'general' | 'pricing' | 'limits' | 'features' | 'preview'
  const [newFeatureText, setNewFeatureText] = useState('');
  const [validationError, setValidationError] = useState('');

  // Edit Plan Form State
  const [editFormData, setEditFormData] = useState({
    id: '',
    name: '',
    badge: '',
    status: 'active',
    monthlyPrice: 0,
    annualPrice: 0,
    description: '',
    maxIngredients: 0,
    maxStaff: 0,
    branches: 1,
    support: '',
    popular: false,
    features: [],
  });

  // Assign Plan Form State
  const [assignFormData, setAssignFormData] = useState({
    restaurantId: restaurants[0]?.id || '',
    planId: plans[0]?.id || '',
  });

  // Filtered Supplier Plan Payments
  const filteredPayments = useMemo(() => {
    return (supplierPlanPayments || []).filter((p) => {
      const matchSearch =
        !paymentSearch ||
        p.supplierName?.toLowerCase().includes(paymentSearch.toLowerCase()) ||
        p.invoiceNumber?.toLowerCase().includes(paymentSearch.toLowerCase()) ||
        p.referenceNumber?.toLowerCase().includes(paymentSearch.toLowerCase()) ||
        p.transactionId?.toLowerCase().includes(paymentSearch.toLowerCase());

      const matchPlan = paymentPlanFilter === 'all' || p.planName === paymentPlanFilter;
      return matchSearch && matchPlan;
    });
  }, [supplierPlanPayments, paymentSearch, paymentPlanFilter]);

  // Custom Plan Modules & Billing Rules Management State
  const [moduleSearch, setModuleSearch] = useState('');
  const [moduleCategoryFilter, setModuleCategoryFilter] = useState('all');
  const [moduleStatusFilter, setModuleStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [moduleModalMode, setModuleModalMode] = useState('create'); // 'create' | 'edit'
  const [moduleFormData, setModuleFormData] = useState({
    id: '',
    name: '',
    description: '',
    monthlyPrice: 0,
    annualPrice: 0,
    status: 'active',
    category: 'Integrations',
    isRequired: false,
    isBaseModule: false,
  });

  const [deleteModuleModalOpen, setDeleteModuleModalOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState(null);

  const [ratesModalOpen, setRatesModalOpen] = useState(false);
  const [ratesFormData, setRatesFormData] = useState({
    additionalTerminalMonthly: pricingUnitRates.additionalTerminalMonthly ?? 250,
    additionalTerminalAnnual: pricingUnitRates.additionalTerminalAnnual ?? 2400,
    additionalOutletMonthly: pricingUnitRates.additionalOutletMonthly ?? 499,
    additionalOutletAnnual: pricingUnitRates.additionalOutletAnnual ?? 4788,
    additionalStaffMonthly: pricingUnitRates.additionalStaffMonthly ?? 99,
    additionalStaffAnnual: pricingUnitRates.additionalStaffAnnual ?? 948,
    gstRate: pricingUnitRates.gstRate ?? 0.18,
    annualDiscountPercent: pricingUnitRates.annualDiscountPercent ?? 20,
    minimumPriceMarginFloorRatio: pricingUnitRates.minimumPriceMarginFloorRatio ?? 0.70,
    minTerminals: pricingUnitRates.minTerminals ?? 1,
    maxTerminals: pricingUnitRates.maxTerminals ?? 25,
    minOutlets: pricingUnitRates.minOutlets ?? 1,
    maxOutlets: pricingUnitRates.maxOutlets ?? 50,
    minStaff: pricingUnitRates.minStaff ?? 1,
    maxStaff: pricingUnitRates.maxStaff ?? 200,
  });

  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [inspectingTenant, setInspectingTenant] = useState(null);
  const [customTenantsSearch, setCustomTenantsSearch] = useState('');
  const [customTenantsStatusFilter, setCustomTenantsStatusFilter] = useState('all');

  // Review Quote State
  const [quoteReviewModalOpen, setQuoteReviewModalOpen] = useState(false);
  const [reviewingRequest, setReviewingRequest] = useState(null);
  const [quoteDecision, setQuoteDecision] = useState('approve'); // 'approve' | 'quote' | 'reject'
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteAdminNotes, setQuoteAdminNotes] = useState('');
  const [quoteRejectionReason, setQuoteRejectionReason] = useState('');

  // Assign Custom Plan State
  const [assignCustomModalOpen, setAssignCustomModalOpen] = useState(false);
  const [assignCustomTenant, setAssignCustomTenant] = useState(null);
  const [assignTargetRestaurantId, setAssignTargetRestaurantId] = useState('');

  // Combined custom plan tenants and requests
  const customPlanTenants = useMemo(() => {
    const fromTenants = (restaurants || [])
      .filter((r) => r.planId === 'plan-custom' || r.planName?.toLowerCase().includes('custom') || r.customPlanConfig)
      .map((r) => ({
        id: r.id,
        restaurantId: r.id,
        name: r.name,
        cuisine: r.cuisine || 'Multi-Cuisine',
        ownerName: r.ownerName,
        ownerEmail: r.ownerEmail,
        phone: r.phone,
        outlets: r.branches || 1,
        terminals: r.monthlyUsage?.posTerminals || (r.branches || 1) * 2,
        staffCount: r.monthlyUsage?.staffCount || 6,
        activeModules: r.customPlanConfig?.activeModules || ['pos_billing', 'recipe_costing', 'aggregator_integration'],
        billingCycle: r.customPlanConfig?.billingCycle || 'annual',
        status: r.status || 'active',
        monthlyAmount: r.customPlanConfig?.monthlyAmount || 2477,
        annualAmount: r.customPlanConfig?.annualAmount || 23775,
        source: 'restaurant_tenant',
      }));

    const fromRequests = (customPlanRequests || []).map((req) => ({
      id: req.id,
      restaurantId: req.restaurantId,
      name: req.restaurantName,
      cuisine: 'Multi-Outlet Group',
      ownerName: req.ownerName,
      ownerEmail: req.ownerEmail,
      phone: req.ownerPhone,
      outlets: req.config?.branches || req.config?.outlets || 1,
      terminals: req.config?.posTerminals || Math.max(1, (req.config?.branches || 1) * 2),
      staffCount: req.config?.staffCount || 15,
      activeModules: req.config?.selectedFeatureIds || req.config?.selectedModuleIds || ['pos_billing'],
      billingCycle: req.config?.billingCycle || 'annual',
      status: req.status === 'activated' ? 'active' : req.status === 'quoted' ? 'quoted' : req.status === 'approved' ? 'approved' : req.status === 'rejected' ? 'rejected' : 'pending_review',
      monthlyAmount: req.systemMonthlyEquivalent || Math.round((req.proposedQuotation || req.systemCalculatedAmount || 25000) / 12),
      annualAmount: req.proposedQuotation || req.systemCalculatedAmount || 25000,
      source: 'custom_request',
      rawRequest: req,
    }));

    return [...fromTenants, ...fromRequests];
  }, [restaurants, customPlanRequests]);

  const filteredCustomTenants = useMemo(() => {
    let list = customPlanTenants;
    if (customTenantsStatusFilter !== 'all') {
      list = list.filter((t) => t.status === customTenantsStatusFilter);
    }
    if (customTenantsSearch) {
      const q = customTenantsSearch.toLowerCase();
      list = list.filter(
        (t) =>
          t.name?.toLowerCase().includes(q) ||
          t.ownerName?.toLowerCase().includes(q) ||
          t.ownerEmail?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [customPlanTenants, customTenantsSearch, customTenantsStatusFilter]);

  const filteredCustomModules = useMemo(() => {
    return (customPlanModules || []).filter((mod) => {
      const matchSearch =
        !moduleSearch ||
        mod.name?.toLowerCase().includes(moduleSearch.toLowerCase()) ||
        mod.description?.toLowerCase().includes(moduleSearch.toLowerCase()) ||
        mod.category?.toLowerCase().includes(moduleSearch.toLowerCase());
      const matchCat = moduleCategoryFilter === 'all' || mod.category === moduleCategoryFilter;
      const matchStatus =
        moduleStatusFilter === 'all' ||
        (moduleStatusFilter === 'active' ? mod.status !== 'inactive' : mod.status === 'inactive');
      return matchSearch && matchCat && matchStatus;
    });
  }, [customPlanModules, moduleSearch, moduleCategoryFilter, moduleStatusFilter]);

  const moduleCategories = useMemo(() => {
    const set = new Set([
      ...STANDARD_MODULE_CATEGORIES,
      ...(customPlanModules || []).map((m) => m.category).filter(Boolean),
    ]);
    return ['all', ...Array.from(set)];
  }, [customPlanModules]);

  const handleOpenCreateModule = () => {
    setModuleModalMode('create');
    setModuleFormData({
      id: '',
      name: '',
      description: '',
      monthlyPrice: 400,
      annualPrice: 3840,
      status: 'active',
      category: 'Integrations',
      isRequired: false,
      isBaseModule: false,
    });
    setModuleModalOpen(true);
  };

  const handleOpenEditModule = (mod) => {
    setModuleModalMode('edit');
    setModuleFormData({
      id: mod.id,
      name: mod.name || '',
      description: mod.description || '',
      monthlyPrice: mod.monthlyPrice ?? 0,
      annualPrice: mod.annualPrice ?? (mod.monthlyPrice ? Math.round(mod.monthlyPrice * 12 * 0.8) : 0),
      status: mod.status || 'active',
      category: mod.category || 'Integrations',
      isRequired: Boolean(mod.isRequired || mod.isBaseModule),
      isBaseModule: Boolean(mod.isBaseModule),
    });
    setModuleModalOpen(true);
  };

  const handleSaveModule = (e) => {
    if (e) e.preventDefault();
    if (!moduleFormData.name.trim()) return;

    if (moduleModalMode === 'create') {
      addCustomPlanModule({
        ...moduleFormData,
        name: moduleFormData.name.trim(),
        description: moduleFormData.description.trim(),
        monthlyPrice: Math.max(0, Number(moduleFormData.monthlyPrice) || 0),
        annualPrice: Math.max(0, Number(moduleFormData.annualPrice) || 0),
      });
    } else {
      updateCustomPlanModule(moduleFormData.id, {
        name: moduleFormData.name.trim(),
        description: moduleFormData.description.trim(),
        monthlyPrice: Math.max(0, Number(moduleFormData.monthlyPrice) || 0),
        annualPrice: Math.max(0, Number(moduleFormData.annualPrice) || 0),
        status: moduleFormData.status,
        category: moduleFormData.category,
        isRequired: moduleFormData.isRequired,
      });
    }
    setModuleModalOpen(false);
  };

  const handlePromptDeleteModule = (mod) => {
    setModuleToDelete(mod);
    setDeleteModuleModalOpen(true);
  };

  const handleConfirmDeleteModule = () => {
    if (moduleToDelete) {
      deleteCustomPlanModule(moduleToDelete.id);
      setDeleteModuleModalOpen(false);
      setModuleToDelete(null);
    }
  };

  const handleToggleModuleStatus = (mod) => {
    if (mod.isBaseModule || mod.id === 'pos_billing' || mod.isRequired) return;
    const newStatus = mod.status === 'active' ? 'inactive' : 'active';
    updateCustomPlanModule(mod.id, { status: newStatus });
  };

  const handleOpenRatesModal = () => {
    setRatesFormData({
      additionalTerminalMonthly: pricingUnitRates.additionalTerminalMonthly ?? 250,
      additionalTerminalAnnual: pricingUnitRates.additionalTerminalAnnual ?? 2400,
      additionalOutletMonthly: pricingUnitRates.additionalOutletMonthly ?? 499,
      additionalOutletAnnual: pricingUnitRates.additionalOutletAnnual ?? 4788,
      additionalStaffMonthly: pricingUnitRates.additionalStaffMonthly ?? 99,
      additionalStaffAnnual: pricingUnitRates.additionalStaffAnnual ?? 948,
      gstRate: pricingUnitRates.gstRate ?? 0.18,
      annualDiscountPercent: pricingUnitRates.annualDiscountPercent ?? 20,
      minimumPriceMarginFloorRatio: pricingUnitRates.minimumPriceMarginFloorRatio ?? 0.70,
      minTerminals: pricingUnitRates.minTerminals ?? 1,
      maxTerminals: pricingUnitRates.maxTerminals ?? 25,
      minOutlets: pricingUnitRates.minOutlets ?? 1,
      maxOutlets: pricingUnitRates.maxOutlets ?? 50,
      minStaff: pricingUnitRates.minStaff ?? 1,
      maxStaff: pricingUnitRates.maxStaff ?? 200,
    });
    setRatesModalOpen(true);
  };

  const handleSaveRates = (e) => {
    if (e) e.preventDefault();
    updatePricingUnitRates({
      additionalTerminalMonthly: Math.max(0, Number(ratesFormData.additionalTerminalMonthly) || 0),
      additionalTerminalAnnual: Math.max(0, Number(ratesFormData.additionalTerminalAnnual) || 0),
      additionalOutletMonthly: Math.max(0, Number(ratesFormData.additionalOutletMonthly) || 0),
      additionalOutletAnnual: Math.max(0, Number(ratesFormData.additionalOutletAnnual) || 0),
      additionalStaffMonthly: Math.max(0, Number(ratesFormData.additionalStaffMonthly) || 0),
      additionalStaffAnnual: Math.max(0, Number(ratesFormData.additionalStaffAnnual) || 0),
      gstRate: Math.max(0, Math.min(1, Number(ratesFormData.gstRate) || 0.18)),
      annualDiscountPercent: Math.max(0, Math.min(100, Number(ratesFormData.annualDiscountPercent) || 20)),
      minimumPriceMarginFloorRatio: Math.max(0, Math.min(1, Number(ratesFormData.minimumPriceMarginFloorRatio) || 0.70)),
      minTerminals: Math.max(1, Number(ratesFormData.minTerminals) || 1),
      maxTerminals: Math.max(Number(ratesFormData.minTerminals) || 1, Number(ratesFormData.maxTerminals) || 25),
      minOutlets: Math.max(1, Number(ratesFormData.minOutlets) || 1),
      maxOutlets: Math.max(Number(ratesFormData.minOutlets) || 1, Number(ratesFormData.maxOutlets) || 50),
      minStaff: Math.max(1, Number(ratesFormData.minStaff) || 1),
      maxStaff: Math.max(Number(ratesFormData.minStaff) || 1, Number(ratesFormData.maxStaff) || 200),
    });
    setRatesModalOpen(false);
  };

  const handleOpenReviewQuote = (request) => {
    setReviewingRequest(request);
    setQuoteDecision('approve');
    setQuoteAmount(request.proposedQuotation || request.systemCalculatedAmount || 25000);
    setQuoteAdminNotes(request.adminNotes || '');
    setQuoteRejectionReason('');
    setQuoteReviewModalOpen(true);
  };

  const handleSaveReviewDecision = (e) => {
    if (e) e.preventDefault();
    if (!reviewingRequest) return;
    reviewCustomPlanRequest(reviewingRequest.id, quoteDecision, {
      quotedAmount: Number(quoteAmount) || reviewingRequest.systemCalculatedAmount,
      adminNotes: quoteAdminNotes,
      rejectionReason: quoteRejectionReason,
    });
    setQuoteReviewModalOpen(false);
    setReviewingRequest(null);
  };

  const handleOpenAssignCustom = (tenant) => {
    setAssignCustomTenant(tenant);
    setAssignTargetRestaurantId(tenant.restaurantId || tenant.id || restaurants[0]?.id || '');
    setAssignCustomModalOpen(true);
  };

  const handleConfirmAssignCustom = (e) => {
    if (e) e.preventDefault();
    if (!assignTargetRestaurantId || !assignCustomTenant) return;
    assignCustomPlanToRestaurant(assignTargetRestaurantId, {
      monthlyAmount: assignCustomTenant.monthlyAmount,
      annualAmount: assignCustomTenant.annualAmount,
      outlets: assignCustomTenant.outlets,
      terminals: assignCustomTenant.terminals,
      staffCount: assignCustomTenant.staffCount,
      activeModules: assignCustomTenant.activeModules,
      billingCycle: assignCustomTenant.billingCycle,
      sourceRequestId: assignCustomTenant.rawRequest?.id || assignCustomTenant.id,
    });
    setAssignCustomModalOpen(false);
    setAssignCustomTenant(null);
  };

  const handleOpenEdit = (plan) => {
    setSelectedPlan(plan);
    setEditFormData({
      id: plan.id,
      name: plan.name || '',
      badge: plan.badge || '',
      status: plan.status || 'active',
      monthlyPrice: plan.monthlyPrice ?? 0,
      annualPrice: plan.annualPrice ?? (plan.monthlyPrice ? Math.round(plan.monthlyPrice * 12 * 0.8) : 0),
      description: plan.description || '',
      maxIngredients: plan.limits?.maxIngredients ?? 100,
      maxStaff: plan.limits?.maxStaff ?? 5,
      branches: plan.limits?.branches ?? 1,
      support: plan.limits?.support || 'Standard Email (24h SLA)',
      popular: !!plan.popular,
      features: Array.isArray(plan.features) ? [...plan.features] : [],
    });
    setNewFeatureText('');
    setValidationError('');
    setActiveModalTab('general');
    setEditModalOpen(true);
  };

  // Feature Manager Handlers
  const handleAddFeature = (e) => {
    if (e) e.preventDefault();
    const trimmed = newFeatureText.trim();
    if (!trimmed) return;
    setEditFormData((prev) => ({
      ...prev,
      features: [...prev.features, trimmed],
    }));
    setNewFeatureText('');
  };

  const handleUpdateFeature = (index, value) => {
    setEditFormData((prev) => {
      const next = [...prev.features];
      next[index] = value;
      return { ...prev, features: next };
    });
  };

  const handleRemoveFeature = (index) => {
    setEditFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleMoveFeature = (index, direction) => {
    setEditFormData((prev) => {
      const next = [...prev.features];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return { ...prev, features: next };
    });
  };

  const handleAutoDiscount = () => {
    const monthly = Number(editFormData.monthlyPrice) || 0;
    const computedAnnual = Math.round(monthly * 12 * 0.8);
    setEditFormData((prev) => ({ ...prev, annualPrice: computedAnnual }));
  };

  const handleSavePlan = (e) => {
    if (e) e.preventDefault();

    if (!editFormData.name.trim()) {
      setValidationError('Plan display name cannot be empty.');
      setActiveModalTab('general');
      return;
    }
    if (Number(editFormData.monthlyPrice) < 0) {
      setValidationError('Monthly price cannot be negative.');
      setActiveModalTab('pricing');
      return;
    }
    if (Number(editFormData.annualPrice) < 0) {
      setValidationError('Annual price cannot be negative.');
      setActiveModalTab('pricing');
      return;
    }
    if (editFormData.features.length === 0) {
      setValidationError('Plan must have at least one included feature.');
      setActiveModalTab('features');
      return;
    }

    setValidationError('');

    const monthlyPrice = Number(editFormData.monthlyPrice);
    const annualPrice = Number(editFormData.annualPrice);

    const success = updatePlan(editFormData.id, {
      name: editFormData.name.trim(),
      badge: editFormData.badge.trim(),
      status: editFormData.status,
      monthlyPrice,
      annualPrice,
      description: editFormData.description.trim(),
      popular: editFormData.popular,
      limits: {
        maxIngredients: Number(editFormData.maxIngredients) || 100,
        maxStaff: Number(editFormData.maxStaff) || 5,
        branches: Number(editFormData.branches) || 1,
        support: editFormData.support.trim() || 'Standard Email (24h SLA)',
      },
      features: editFormData.features.filter((f) => f.trim().length > 0),
    });

    if (success !== false) {
      setEditModalOpen(false);
    }
  };

  const handleConfirmReset = () => {
    resetPlansToDefaults();
    setResetModalOpen(false);
  };

  const handleAssignPlan = (e) => {
    if (e) e.preventDefault();
    assignPlanToRestaurant(assignFormData.restaurantId, assignFormData.planId);
    setAssignModalOpen(false);
  };

  // Metrics Quick Bar
  const activeSubs = restaurants.filter((r) => r.status === 'active').length;
  const trialSubs = restaurants.filter((r) => r.status === 'trial' || r.isTrial).length || 1;

  // Real-time savings preview for Edit Modal
  const editSavingsPreview = calculatePlanSavings(editFormData.monthlyPrice, editFormData.annualPrice);

  return (
    <div className="space-y-4 sm:space-y-5">
      <PageHeader
        title="Subscription Tier Management"
        subtitle="Configure dynamic SaaS pricing, resource limits, features, and platform status"
        breadcrumbs={[
          { label: 'Admin', href: '#/admin/dashboard' },
          { label: 'Subscription Plans' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={() => setResetModalOpen(true)}
              title="Reset all plans to default factory prices"
            >
              Reset to Defaults
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={FileCheck}
              onClick={() => navigate('/admin/custom-plan-requests')}
            >
              Review Queue ({pendingReviewsCount})
            </Button>
            <Button
              variant="brand"
              size="sm"
              icon={Building2}
              onClick={() => {
                setAssignFormData({
                  restaurantId: restaurants[0]?.id || '',
                  planId: plans[0]?.id || '',
                });
                setAssignModalOpen(true);
              }}
            >
              Assign Plan to Restaurant
            </Button>
          </div>
        }
      />

      {/* Platform Plan Scope Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 w-fit">
        <button
          onClick={() => setMainTab('restaurant_plans')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            mainTab === 'restaurant_plans'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Restaurant SaaS Plans ({plans.length})</span>
        </button>

        <button
          onClick={() => setMainTab('custom_plan_rules')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            mainTab === 'custom_plan_rules'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Custom Plan Modules &amp; Billing Rules</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
            {customPlanModules.length} Modules
          </span>
        </button>

        <button
          onClick={() => setMainTab('supplier_plans')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            mainTab === 'supplier_plans'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Third-Party Supplier Plans ({SUPPLIER_SUBSCRIPTION_PLANS.length})</span>
        </button>

        <button
          onClick={() => setMainTab('supplier_payments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            mainTab === 'supplier_payments'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Supplier Plan Payment History ({(supplierPlanPayments || []).length})</span>
        </button>
      </div>

      {mainTab === 'restaurant_plans' && (
        <>
          {/* Subscription Metrics Quick Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 glass-panel p-5">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Subscriptions</span>
              <div className="text-xl font-bold text-emerald-800 mt-1">{activeSubs} Accounts</div>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Trial Accounts</span>
              <div className="text-xl font-bold text-blue-700 mt-1">{trialSubs} Account</div>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Plan ARPU</span>
              <div className="text-xl font-bold text-slate-800 mt-1">₹2,499 / mo</div>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Tiers</span>
              <div className="text-xl font-bold text-slate-800 mt-1">
                {plans.filter((p) => p.status !== 'inactive').length} Active of {plans.length}
              </div>
            </div>
          </div>

      {/* Dynamic Sync Helper Notice */}
      <div className="p-4 rounded-2xl glass-panel bg-indigo-50/40 border-indigo-200/70 flex items-start gap-3 text-xs text-indigo-950">
        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 font-bold text-[11px]">
          D
        </span>
        <div className="leading-relaxed">
          <strong className="font-semibold">Dynamic Platform-Wide Subscription Engine:</strong>
          Any modifications made to plan names, monthly/annual rates, resource allowances, or features below propagate in real time across the public Landing Page, Signup checkout, Custom Plan builder, Tenant billing, and active Restaurant limit checks.
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const assignedRestaurants = restaurants.filter((r) => r.planId === plan.id);
          const isInactive = plan.status === 'inactive';
          const annualSavings = plan.annualSavings ?? Math.max(0, (plan.monthlyPrice * 12) - plan.annualPrice);
          const savingsPercent = plan.savingsPercent ?? (plan.monthlyPrice > 0 ? Math.round((annualSavings / (plan.monthlyPrice * 12)) * 100) : 0);
          const effectiveMonthly = plan.effectiveMonthlyAnnual ?? (plan.annualPrice > 0 ? Math.round(plan.annualPrice / 12) : plan.monthlyPrice);

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-6 transition-all duration-200 flex flex-col justify-between ${
                isInactive
                  ? 'border-dashed border-amber-300/80 bg-amber-50/30 opacity-80 backdrop-blur-md'
                  : plan.popular
                  ? 'glass-panel border-emerald-500 ring-2 ring-emerald-500/30 shadow-glass-hover bg-gradient-to-b from-white/95 to-emerald-50/20'
                  : 'glass-panel hover:shadow-glass-hover'
              }`}
            >
              <div>
                {/* Header Badge & Status */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        plan.popular ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {plan.badge || plan.name}
                    </span>
                    {isInactive ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        Inactive
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenEdit(plan)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
                    title={`Edit ${plan.name} Pricing & Limits`}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                <p className="text-xs text-slate-500 mt-1 min-h-[36px] leading-relaxed">
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="my-4 pt-2 border-t border-slate-100">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {plan.monthlyPrice > 0 ? formatINR(plan.monthlyPrice) : 'Custom Quote'}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {plan.monthlyPrice > 0 ? '/ month billed monthly' : 'tailored to scale'}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">
                      Annual:{' '}
                      <strong className="text-slate-900">
                        {plan.annualPrice > 0 ? `${formatINR(plan.annualPrice)}/yr` : 'Flexible Billing'}
                      </strong>
                    </span>
                    {annualSavings > 0 ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                        Save {formatINR(annualSavings)}/yr ({savingsPercent}%)
                      </span>
                    ) : plan.monthlyPrice === 0 ? (
                      <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/80">
                        Interactive SLA
                      </span>
                    ) : null}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {plan.annualPrice > 0
                      ? `(Effective ${formatINR(effectiveMonthly)}/mo on annual billing)`
                      : '(Configure pricing & limits via Edit Plan)'}
                  </div>
                </div>

                {/* Limits summary */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 mb-5 text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-slate-400" />
                      Tracked Ingredients:
                    </span>
                    <span className="font-bold text-slate-800">
                      {plan.limits?.maxIngredients > 1000 ? 'Unlimited' : `Up to ${plan.limits?.maxIngredients}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      Staff Accounts:
                    </span>
                    <span className="font-bold text-slate-800">
                      {plan.limits?.maxStaff > 1000 ? 'Unlimited' : `Up to ${plan.limits?.maxStaff} users`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-slate-400" />
                      Branches Supported:
                    </span>
                    <span className="font-bold text-slate-800">
                      {plan.limits?.branches > 50 ? 'Unlimited' : `${plan.limits?.branches} location(s)`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 text-[11px]">
                    <span className="text-slate-500">Support SLA:</span>
                    <span className="font-semibold text-emerald-700">{plan.limits?.support || 'Standard Email'}</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Included Features ({plan.features?.length || 0})
                    </span>
                  </div>
                  {plan.features?.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-700">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className="leading-snug">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assigned Restaurants list */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-600">Assigned Tenants:</span>
                  <span className="font-bold text-emerald-800">{assignedRestaurants.length}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 min-h-[30px] mb-4">
                  {assignedRestaurants.length === 0 ? (
                    <span className="text-[11px] text-slate-400 italic">No restaurants currently on this tier</span>
                  ) : (
                    assignedRestaurants.map((r) => (
                      <span
                        key={r.id}
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {r.name}
                      </span>
                    ))
                  )}
                </div>

                <div>
                  <Button
                    variant={plan.popular ? 'brand' : 'outline'}
                    size="sm"
                    className="w-full"
                    icon={Edit3}
                    onClick={() => handleOpenEdit(plan)}
                  >
                    Edit Plan Pricing &amp; Features
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expandable Comparison Matrix Toggle */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
        <button
          onClick={() => setShowComparisonTable((prev) => !prev)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Platform Subscription Comparison Matrix</h4>
              <p className="text-xs text-slate-500">Side-by-side feature and limit comparison across all active plans</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
            <span>{showComparisonTable ? 'Hide Table' : 'Compare All Plans'}</span>
            {showComparisonTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showComparisonTable && (
          <div className="p-4 border-t border-slate-100 overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold">
                  <th className="py-3 px-4">Plan Specification</th>
                  {plans.map((p) => (
                    <th key={p.id} className="py-3 px-4 text-center">
                      <div className="font-extrabold text-sm text-slate-900">{p.name}</div>
                      <div className="text-[11px] font-semibold text-emerald-700">{formatINR(p.monthlyPrice)}/mo</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="bg-slate-50/50 font-bold text-slate-800">
                  <td colSpan={plans.length + 1} className="py-2 px-4 uppercase text-[10px] tracking-wider text-slate-400">
                    Pricing &amp; Discounts
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium">Monthly Billed Rate</td>
                  {plans.map((p) => (
                    <td key={p.id} className="py-2.5 px-4 text-center font-bold text-slate-900">
                      {formatINR(p.monthlyPrice)} / month
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium">Annual Billed Rate</td>
                  {plans.map((p) => (
                    <td key={p.id} className="py-2.5 px-4 text-center font-semibold text-slate-800">
                      {formatINR(p.annualPrice)} / year
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium">Annual Savings</td>
                  {plans.map((p) => (
                    <td key={p.id} className="py-2.5 px-4 text-center font-bold text-emerald-700">
                      Save {formatINR(p.annualSavings)}/yr ({p.savingsPercent}%)
                    </td>
                  ))}
                </tr>

                <tr className="bg-slate-50/50 font-bold text-slate-800">
                  <td colSpan={plans.length + 1} className="py-2 px-4 uppercase text-[10px] tracking-wider text-slate-400">
                    Resource Allocations &amp; Limits
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium">Tracked Pantry Ingredients</td>
                  {plans.map((p) => (
                    <td key={p.id} className="py-2.5 px-4 text-center font-semibold text-slate-800">
                      {p.limits?.maxIngredients > 1000 ? 'Unlimited' : `Up to ${p.limits?.maxIngredients}`}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium">Allowed Staff Accounts</td>
                  {plans.map((p) => (
                    <td key={p.id} className="py-2.5 px-4 text-center font-semibold text-slate-800">
                      {p.limits?.maxStaff > 1000 ? 'Unlimited' : `Up to ${p.limits?.maxStaff} users`}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium">Supported Outlets &amp; Branches</td>
                  {plans.map((p) => (
                    <td key={p.id} className="py-2.5 px-4 text-center font-semibold text-slate-800">
                      {p.limits?.branches > 50 ? 'Unlimited' : `${p.limits?.branches} branch`}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium">Customer Support SLA</td>
                  {plans.map((p) => (
                    <td key={p.id} className="py-2.5 px-4 text-center font-semibold text-emerald-700">
                      {p.limits?.support || 'Standard'}
                    </td>
                  ))}
                </tr>

                <tr className="bg-slate-50/50 font-bold text-slate-800">
                  <td colSpan={plans.length + 1} className="py-2 px-4 uppercase text-[10px] tracking-wider text-slate-400">
                    Core Modules &amp; Capabilities
                  </td>
                </tr>
                {[
                  { name: 'POS & Cloud Billing', starter: true, pro: true, ent: true },
                  { name: 'Pantry Inventory & Low Stock Alerts', starter: true, pro: true, ent: true },
                  { name: 'FEFO Expiry Color Tracking', starter: true, pro: true, ent: true },
                  { name: 'Digital Purchase Orders & Basic GRN', starter: true, pro: true, ent: true },
                  { name: 'Pure SVG QR Lot Traceability Matrix', starter: false, pro: true, ent: true },
                  { name: 'Standardized Recipe Costing & BOMs', starter: false, pro: true, ent: true },
                  { name: 'Dockside Verified GRN & Claims', starter: false, pro: true, ent: true },
                  { name: 'Table & Captain Ordering Terminal', starter: false, pro: true, ent: true },
                  { name: 'Multi-Store Central Commissary Sync', starter: false, pro: false, ent: true },
                  { name: 'Swiggy / Zomato Aggregator Sync', starter: false, pro: false, ent: true },
                  { name: 'Predictive Consumption & Wastage BI', starter: false, pro: false, ent: true },
                  { name: 'Dedicated Customer Success Manager', starter: false, pro: false, ent: true },
                ].map((row, rIdx) => (
                  <tr key={rIdx}>
                    <td className="py-2.5 px-4 font-medium text-slate-800">{row.name}</td>
                    {plans.map((p) => {
                      const isIncluded =
                        p.id === 'plan-starter' ? row.starter : p.id === 'plan-pro' ? row.pro : row.ent;
                      return (
                        <td key={p.id} className="py-2.5 px-4 text-center">
                          {isIncluded ? (
                            <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-800">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          ) : (
                            <span className="text-slate-300 font-bold">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </>
      )}

      {/* 2. CUSTOM PLAN MODULES & BILLING RULES TAB */}
      {mainTab === 'custom_plan_rules' && (
        <div className="space-y-6">
          {/* Section 0: High-Impact Pricing Summary Cards (6-grid) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {/* Card 1: Total Modules */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs hover:shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Total Modules
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black font-mono text-slate-900">
                  {customPlanModules.length}
                </div>
                <span className="text-[11px] text-slate-500 font-medium">Catalog Capabilities</span>
              </div>
            </div>

            {/* Card 2: Active in Builder */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs hover:shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Active in Builder
                </span>
                <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black font-mono text-teal-700">
                  {customPlanModules.filter((m) => m.status !== 'inactive').length}
                </div>
                <span className="text-[11px] text-emerald-600 font-bold">Selectable in Configurator</span>
              </div>
            </div>

            {/* Card 3: Required Base */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs hover:shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Required Modules
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black font-mono text-blue-700">
                  {customPlanModules.filter((m) => m.isBaseModule || m.isRequired || m.id === 'pos_billing').length}
                </div>
                <span className="text-[11px] text-slate-500 font-medium">Locked Base POS</span>
              </div>
            </div>

            {/* Card 4: Custom Subscribers */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs hover:shadow-sm hover:border-purple-300 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Subscribers
                </span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black font-mono text-purple-700">
                  {restaurants.filter((r) => r.planId === 'plan-custom' || r.planName?.toLowerCase().includes('custom') || r.customPlanConfig).length}
                </div>
                <span className="text-[11px] text-slate-500 font-medium">Active Custom Tenants</span>
              </div>
            </div>

            {/* Card 5: Pending Quotes */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs hover:shadow-sm hover:border-amber-300 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Pending Quotes
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black font-mono text-amber-600">
                  {(customPlanRequests || []).filter((r) => r.status === 'pending_review' || r.status === 'quoted').length}
                </div>
                <span className="text-[11px] text-amber-600 font-bold">Inbound Approvals</span>
              </div>
            </div>

            {/* Card 6: Terminal Hardware Rate */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs hover:shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  POS Device Rate
                </span>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Tablet className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black font-mono text-slate-900">
                  {formatINR(pricingUnitRates.additionalTerminalMonthly || 250)}
                </div>
                <span className="text-[11px] text-slate-500 font-medium">per device / mo</span>
              </div>
            </div>
          </div>

          {/* Section 1: Global Hardware & Billing Rules Card */}
          <div className="bg-white border border-[#E5E7EB] p-6 sm:p-7 rounded-2xl sm:rounded-3xl space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E5E7EB]">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/80">
                  Authoritative Unit Scaling Rules
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">
                  Hardware Scaling &amp; Statutory Billing Rules
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Configure unit prices, tax policies, annual discounts, and minimum/maximum resource limits.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  icon={RotateCcw}
                  onClick={resetCustomPlanModulesToDefaults}
                  className="bg-white hover:bg-slate-50 text-slate-700 border-slate-300 font-bold shadow-xs"
                >
                  Reset Defaults
                </Button>
                <Button
                  size="sm"
                  variant="brand"
                  icon={Settings2}
                  onClick={handleOpenRatesModal}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
                >
                  Configure Billing Rules
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {/* POS Terminal */}
              <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between space-y-3.5 group">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800">Extra POS Terminal Station</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Tablet className="w-4 h-4" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black font-mono text-slate-900 tracking-tight">
                      {formatINR(pricingUnitRates.additionalTerminalMonthly || 250)}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">/mo</span>
                  </div>
                  <div className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                    <span>{formatINR(pricingUnitRates.additionalTerminalAnnual || 2400)}/yr</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold">
                      ~20% off
                    </span>
                  </div>
                </div>
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Station Limits:</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-800 font-bold font-mono">
                    {pricingUnitRates.minTerminals ?? 1} – {pricingUnitRates.maxTerminals ?? 25} devices
                  </span>
                </div>
              </div>

              {/* Outlet */}
              <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between space-y-3.5 group">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800">Additional Branch / Outlet</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Store className="w-4 h-4" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black font-mono text-slate-900 tracking-tight">
                      {formatINR(pricingUnitRates.additionalOutletMonthly || 499)}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">/mo</span>
                  </div>
                  <div className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                    <span>{formatINR(pricingUnitRates.additionalOutletAnnual || 4788)}/yr</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold">
                      ~20% off
                    </span>
                  </div>
                </div>
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Outlet Limits:</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-800 font-bold font-mono">
                    {pricingUnitRates.minOutlets ?? 1} – {pricingUnitRates.maxOutlets ?? 50} locations
                  </span>
                </div>
              </div>

              {/* Staff */}
              <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between space-y-3.5 group">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800">Additional Staff Seat</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black font-mono text-slate-900 tracking-tight">
                      {formatINR(pricingUnitRates.additionalStaffMonthly || 99)}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">/mo</span>
                  </div>
                  <div className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                    <span>{formatINR(pricingUnitRates.additionalStaffAnnual || 948)}/yr</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold">
                      ~20% off
                    </span>
                  </div>
                </div>
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Seat Limits:</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-800 font-bold font-mono">
                    {pricingUnitRates.minStaff ?? 1} – {pricingUnitRates.maxStaff ?? 200} users
                  </span>
                </div>
              </div>

              {/* Tax & Guardrails */}
              <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between space-y-3.5 group">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800">Tax &amp; Annual Discount</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Percent className="w-4 h-4" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black font-mono text-slate-900 tracking-tight">
                      {((Number(pricingUnitRates.gstRate ?? 0.18)) * 100).toFixed(0)}%
                    </span>
                    <span className="text-xs font-semibold text-slate-500">GST</span>
                  </div>
                  <div className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                    <span>{pricingUnitRates.annualDiscountPercent ?? 20}% Annual Discount</span>
                  </div>
                </div>
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Margin Safeguard:</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-800 font-bold font-mono">
                    Floor {((Number(pricingUnitRates.minimumPriceMarginFloorRatio ?? 0.70)) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Grandfathering Protection Notice */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 flex items-start gap-3 text-xs text-emerald-950">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="text-emerald-900 font-bold">Grandfathered Agreement Protection:</strong> Existing active subscriptions retain their agreed rates and terms. Updates made to unit prices, discounts, and tax rates apply strictly to new custom plan configurations created in the public Custom Plan Builder and inbound custom quotations.
              </div>
            </div>
          </div>

          {/* Section 2: Modular Add-on Capabilities Matrix */}
          <div className="bg-white border border-[#E5E7EB] p-6 sm:p-7 rounded-2xl sm:rounded-3xl space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-600" />
                  <span>Configurable Modular Capabilities Matrix</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Manage module pricing, categorize capabilities, and toggle live availability for the public custom plan builder.
                </p>
              </div>

              <Button
                variant="brand"
                size="sm"
                icon={Plus}
                onClick={handleOpenCreateModule}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
              >
                Add New Module
              </Button>
            </div>

            {/* Category Filter Pills & Search Controls */}
            <div className="space-y-3 pt-1">
              {/* Category Pills Bar */}
              <div className="flex flex-wrap items-center gap-1.5">
                {moduleCategories.map((cat) => {
                  const isSelected = moduleCategoryFilter === cat;
                  const count = cat === 'all'
                    ? customPlanModules.length
                    : customPlanModules.filter((m) => m.category === cat).length;

                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setModuleCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                      }`}
                    >
                      <span>{cat === 'all' ? 'All Modules' : cat}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected
                          ? 'bg-emerald-950 text-emerald-200'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search & Status Filter Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="relative flex-1 min-w-[240px] max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={moduleSearch}
                    onChange={(e) => setModuleSearch(e.target.value)}
                    placeholder="Search by module name, keyword, or description..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E5E7EB] text-xs bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={moduleStatusFilter}
                    onChange={(e) => setModuleStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs font-medium"
                  >
                    <option value="all">All Statuses ({customPlanModules.length})</option>
                    <option value="active">Active Only ({customPlanModules.filter(m => m.status !== 'inactive').length})</option>
                    <option value="inactive">Disabled Only ({customPlanModules.filter(m => m.status === 'inactive').length})</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modules Table */}
            <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-slate-50 text-slate-600 font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Module Name &amp; Description</th>
                    <th className="py-3.5 px-3">Category</th>
                    <th className="py-3.5 px-3">Requirement</th>
                    <th className="py-3.5 px-4 text-right">Monthly Rate</th>
                    <th className="py-3.5 px-4 text-right">Annual Rate</th>
                    <th className="py-3.5 px-4 text-right">Effective Monthly</th>
                    <th className="py-3.5 px-3 text-center">Configurator Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] bg-white">
                  {filteredCustomModules.map((mod) => {
                    const isBase = Boolean(mod.isBaseModule || mod.id === 'pos_billing');
                    const isRequired = Boolean(mod.isRequired || isBase);
                    const isActive = mod.status !== 'inactive';
                    const effectiveMonthly = Math.round(Number(mod.annualPrice || 0) / 12);
                    const annualSavings = Math.max(0, (Number(mod.monthlyPrice || 0) * 12) - Number(mod.annualPrice || 0));

                    return (
                      <tr key={mod.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <span>{mod.name}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 max-w-md">
                            {mod.description}
                          </p>
                        </td>

                        <td className="py-4 px-3 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {mod.category || 'Integrations'}
                          </span>
                        </td>

                        <td className="py-4 px-3 whitespace-nowrap">
                          {isRequired ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                              <Lock className="w-2.5 h-2.5" />
                              Required Base
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                              Optional Add-on
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-right whitespace-nowrap font-mono font-black text-slate-900 text-sm sm:text-base">
                          {formatINR(mod.monthlyPrice)}
                          <span className="text-xs font-normal text-slate-500 ml-0.5">/mo</span>
                        </td>

                        <td className="py-4 px-4 text-right whitespace-nowrap font-mono text-slate-700">
                          <div className="font-bold text-xs sm:text-sm">{formatINR(mod.annualPrice)}/yr</div>
                          {annualSavings > 0 && (
                            <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">
                              Save {formatINR(annualSavings)}/yr
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-right whitespace-nowrap font-mono font-black text-emerald-600 text-xs sm:text-base">
                          {formatINR(effectiveMonthly)}
                          <span className="text-[10px] font-normal text-slate-500 ml-0.5">/mo</span>
                        </td>

                        <td className="py-4 px-3 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleModuleStatus(mod)}
                            disabled={isRequired}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-2xs ${
                              isRequired
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-not-allowed opacity-90'
                                : isActive
                                  ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                            <span>{isRequired ? 'Required Base' : isActive ? 'Active' : 'Disabled'}</span>
                          </button>
                        </td>

                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              icon={Edit3}
                              onClick={() => handleOpenEditModule(mod)}
                              className="bg-white hover:bg-slate-50 text-slate-700 border-slate-300"
                            >
                              Edit
                            </Button>
                            {!isBase && (
                              <Button
                                size="sm"
                                variant="ghost"
                                icon={Trash2}
                                onClick={() => handlePromptDeleteModule(mod)}
                                title="Remove module"
                                className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredCustomModules.length === 0 && (
                    <tr>
                      <td colSpan="8" className="py-10 text-center text-slate-400">
                        <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-slate-600">No modules match your filter criteria.</p>
                        <p className="text-xs text-slate-400 mt-0.5">Try resetting the category filter or search query.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Custom Plan Subscriptions & Customer Quotations */}
          <div className="bg-white border border-[#E5E7EB] p-6 sm:p-7 rounded-2xl sm:rounded-3xl space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  <span>Custom Subscribers &amp; Enterprise Quotation Queue</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Inspect custom tenant configurations, evaluate inbound custom quote requests, submit commercial pricing, and assign plans.
                </p>
              </div>

              {/* Status Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: 'All Accounts', count: customPlanTenants.length },
                  { id: 'active', label: 'Active Subscribers', count: customPlanTenants.filter(t => t.status === 'active').length },
                  { id: 'pending_review', label: 'Pending Review', count: customPlanTenants.filter(t => t.status === 'pending_review').length },
                  { id: 'quoted', label: 'Quoted', count: customPlanTenants.filter(t => t.status === 'quoted').length },
                  { id: 'rejected', label: 'Rejected', count: customPlanTenants.filter(t => t.status === 'rejected').length },
                ].map((tab) => {
                  const isSelected = customTenantsStatusFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setCustomTenantsStatusFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected ? 'bg-emerald-950 text-emerald-200' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={customTenantsSearch}
                onChange={(e) => setCustomTenantsSearch(e.target.value)}
                placeholder="Search by restaurant name, owner, or email..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E5E7EB] text-xs bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-slate-50 text-slate-600 font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Restaurant &amp; Inbound Contact</th>
                    <th className="py-3.5 px-3">Capacity Specs</th>
                    <th className="py-3.5 px-3">Selected Capabilities</th>
                    <th className="py-3.5 px-3">Billing Cycle</th>
                    <th className="py-3.5 px-4 text-right">Subscription Value</th>
                    <th className="py-3.5 px-3 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] bg-white">
                  {filteredCustomTenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4">
                        <strong className="text-slate-900 block font-bold text-sm">
                          {tenant.name}
                        </strong>
                        <span className="text-xs text-slate-500 mt-0.5 block">
                          {tenant.ownerName} &bull; {tenant.ownerEmail}
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">{tenant.phone}</span>
                      </td>

                      <td className="py-4 px-3 whitespace-nowrap">
                        <div className="font-bold text-slate-800 text-xs">
                          {tenant.outlets} Outlet{tenant.outlets > 1 ? 's' : ''} &bull; {tenant.terminals} Terminals
                        </div>
                        <span className="text-[11px] text-slate-500 mt-0.5 block">{tenant.staffCount} Staff Accounts</span>
                      </td>

                      <td className="py-4 px-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {tenant.activeModules.slice(0, 3).map((modId) => {
                            const mod = customPlanModules.find((m) => m.id === modId);
                            return (
                              <span
                                key={modId}
                                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                              >
                                {mod ? mod.name.split(' ')[0] : modId}
                              </span>
                            );
                          })}
                          {tenant.activeModules.length > 3 && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                              +{tenant.activeModules.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-3 whitespace-nowrap">
                        <span className="capitalize font-bold text-xs text-slate-800">
                          {tenant.billingCycle}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right whitespace-nowrap font-mono font-black text-emerald-600 text-sm sm:text-base">
                        {formatINR(tenant.monthlyAmount)}/mo
                        <span className="text-xs text-slate-500 block font-normal">
                          {formatINR(tenant.annualAmount)}/yr
                        </span>
                      </td>

                      <td className="py-4 px-3 text-center whitespace-nowrap">
                        <Badge
                          variant={
                            tenant.status === 'active'
                              ? 'success'
                              : tenant.status === 'quoted'
                                ? 'info'
                                : tenant.status === 'approved'
                                  ? 'brand'
                                  : tenant.status === 'rejected'
                                    ? 'danger'
                                    : 'warning'
                          }
                        >
                          {tenant.status === 'active'
                            ? 'Active'
                            : tenant.status === 'quoted'
                              ? 'Quoted'
                              : tenant.status === 'approved'
                                ? 'Approved'
                                : tenant.status === 'rejected'
                                  ? 'Rejected'
                                  : 'Pending Review'}
                        </Badge>
                      </td>

                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="secondary"
                            icon={Eye}
                            onClick={() => {
                              setInspectingTenant(tenant);
                              setInspectModalOpen(true);
                            }}
                          >
                            Inspect
                          </Button>

                          {tenant.rawRequest && tenant.status === 'pending_review' && (
                            <Button
                              size="sm"
                              variant="brand"
                              icon={FileCheck}
                              onClick={() => handleOpenReviewQuote(tenant.rawRequest)}
                            >
                              Review &amp; Quote
                            </Button>
                          )}

                          {(tenant.status === 'quoted' || tenant.status === 'approved') && (
                            <Button
                              size="sm"
                              variant="outline"
                              icon={Building2}
                              onClick={() => handleOpenAssignCustom(tenant)}
                            >
                              Assign Plan
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCustomTenants.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-10 text-center text-slate-400">
                        <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-slate-600">No custom plan subscriptions or inquiries found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. THIRD-PARTY SUPPLIER PLANS TAB */}
      {mainTab === 'supplier_plans' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 glass-panel p-5">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Supplier Tiers</span>
              <div className="text-xl font-bold text-emerald-800 mt-1">{SUPPLIER_SUBSCRIPTION_PLANS.length} Plans</div>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Enrolled Third-Party Vendors</span>
              <div className="text-xl font-bold text-blue-700 mt-1">
                {(suppliers || []).filter((s) => s.supplierType === 'Third-Party Supplier' || s.registeredVia === 'supplier_portal').length} Suppliers
              </div>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Commission Spread</span>
              <div className="text-xl font-bold text-slate-800 mt-1">1.0% – 5.0%</div>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fastest Payout Cycle</span>
              <div className="text-xl font-bold text-indigo-700 mt-1">Same Day (Instant)</div>
            </div>
          </div>

          {/* Supplier Plan Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUPPLIER_SUBSCRIPTION_PLANS.map((plan) => {
              const enrolledSuppliers = (suppliers || []).filter(
                (s) => s.planName === plan.name || s.planId === plan.id
              );
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl p-6 transition-all duration-200 flex flex-col justify-between ${
                    plan.popular
                      ? 'glass-panel border-emerald-500 ring-2 ring-emerald-500/30 shadow-glass-hover bg-gradient-to-b from-white/95 to-emerald-50/20'
                      : 'glass-panel hover:shadow-glass-hover'
                  }`}
                >
                  <div>
                    {/* Header Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          plan.popular
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {plan.badge}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <Truck className="w-3 h-3" />
                        {enrolledSuppliers.length} Enrolled
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold text-slate-900 mb-1">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mb-4 min-h-[32px]">{plan.description}</p>

                    {/* Pricing */}
                    <div className="mb-5 pb-5 border-b border-slate-200/60">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-900">
                          {plan.price === 0 ? 'Free Starter' : formatINR(plan.price)}
                        </span>
                        {plan.price > 0 && <span className="text-xs text-slate-500">/ month</span>}
                      </div>
                      {plan.yearlyPrice > 0 && (
                        <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                          {formatINR(plan.yearlyPrice)} billed annually (Save 17%)
                        </div>
                      )}
                    </div>

                    {/* Key Wholesale Limits */}
                    <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2 mb-5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Platform Commission:</span>
                        <span className="font-bold text-emerald-700">{plan.commissionRate}% per order</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Bank Payout SLA:</span>
                        <span className="font-bold text-slate-800">{plan.payoutDays}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Listing SKU Capacity:</span>
                        <span className="font-bold text-slate-800">{plan.maxProducts} Products</span>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-2 mb-6">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                        Included Tier Features ({plan.features?.length || 0})
                      </span>
                      {plan.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-700">
                          <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                          <span className="leading-snug">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Enrolled Partners Footer */}
                  <div className="pt-4 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400 uppercase font-bold block mb-1.5">
                      Active Vendors ({enrolledSuppliers.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {enrolledSuppliers.slice(0, 3).map((s) => (
                        <span
                          key={s.id}
                          className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium"
                        >
                          {s.name}
                        </span>
                      ))}
                      {enrolledSuppliers.length > 3 && (
                        <span className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500">
                          +{enrolledSuppliers.length - 3} more
                        </span>
                      )}
                      {enrolledSuppliers.length === 0 && (
                        <span className="text-xs text-slate-400 italic">No suppliers enrolled yet</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Enrolled Third-Party Suppliers Directory Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Third-Party Supplier Plan Directory</h3>
                <p className="text-xs text-slate-500">
                  Comprehensive listing of all registered third-party suppliers, assigned plan tiers, and commission terms.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={Receipt}
                onClick={() => setMainTab('supplier_payments')}
              >
                View Payment Records
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold">
                    <th className="py-3 px-4">Supplier Partner</th>
                    <th className="py-3 px-4">Classification</th>
                    <th className="py-3 px-4">Supplied Categories</th>
                    <th className="py-3 px-4">Current Plan</th>
                    <th className="py-3 px-4">Commission</th>
                    <th className="py-3 px-4">Payout SLA</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(suppliers || [])
                    .filter((s) => (s.supplierType === 'Third-Party Supplier' || s.registeredVia === 'supplier_portal') && s.supplierType !== 'Tie-up Supplier' && s.registeredVia !== 'main_system')
                    .map((sup) => (
                      <tr key={sup.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{sup.name}</div>
                          <div className="text-[11px] text-slate-500">{sup.contactPerson} • {sup.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <Globe className="w-3 h-3" />
                            Third-Party Supplier
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {(Array.isArray(sup.categories) ? sup.categories : [sup.categories || 'All Categories']).map((c, i) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                                {c}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900">{sup.planName || 'Pro Vendor'}</span>
                          <div className="text-[11px] text-emerald-700 font-medium">
                            {sup.billingCycle === 'yearly' ? 'Annual Plan' : 'Monthly Plan'}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-emerald-800">
                          {sup.commissionRate || 2.5}%
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">
                          {sup.paymentTerms || 'Net 2 (48h Payout)'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUPPLIER PLAN PAYMENT HISTORY TAB */}
      {mainTab === 'supplier_payments' && (
        <div className="space-y-6">
          {/* Payment Revenue KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 glass-panel p-5">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Supplier Plan Revenue</span>
              <div className="text-xl font-bold text-emerald-800 mt-1">
                {formatINR((supplierPlanPayments || []).reduce((acc, p) => acc + (p.amount || 0), 0))}
              </div>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Invoices Processed</span>
              <div className="text-xl font-bold text-blue-700 mt-1">
                {(supplierPlanPayments || []).length} Transactions
              </div>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Paying Vendors</span>
              <div className="text-xl font-bold text-slate-800 mt-1">
                {new Set((supplierPlanPayments || []).map((p) => p.supplierId)).size} Vendors
              </div>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Platform Settlement Status</span>
              <div className="text-xl font-bold text-indigo-700 mt-1">100% Reconciled</div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by supplier, invoice #, UTR..."
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={paymentPlanFilter}
                onChange={(e) => setPaymentPlanFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="all">All Plan Tiers</option>
                <option value="Pro Vendor">Pro Vendor (₹1,499)</option>
                <option value="Enterprise Distributor">Enterprise Distributor (₹4,999)</option>
                <option value="Free Starter">Free Starter (₹0)</option>
              </select>
            </div>
          </div>

          {/* Payment History Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Third-Party Supplier</th>
                    <th className="py-3 px-4">Plan Tier & Cycle</th>
                    <th className="py-3 px-4">Amount Paid</th>
                    <th className="py-3 px-4">Payment Method / UTR</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {payment.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {payment.paymentDate}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{payment.supplierName}</div>
                        <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded">
                          Third-Party Supplier
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{payment.planName}</span>
                        <div className="text-[11px] text-slate-500 capitalize">{payment.billingCycle}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-800">
                        {payment.amount === 0 ? '₹0 (Free)' : formatINR(payment.amount)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{payment.paymentMethod}</div>
                        <div className="font-mono text-[11px] text-slate-500">{payment.referenceNumber}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="outline"
                          size="xs"
                          icon={Eye}
                          onClick={() => {
                            setSelectedReceipt(payment);
                            setReceiptModalOpen(true);
                          }}
                        >
                          View Receipt
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredPayments.length === 0 && (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-slate-400">
                        No supplier plan payments match the filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE EDIT PLAN MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit ${selectedPlan?.name || 'Subscription'} Plan`}
        subtitle="Update pricing, resource limits, features, and platform status"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-rose-600 font-semibold">{validationError}</div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="brand" onClick={handleSavePlan}>
                Save Plan Changes
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Modal Tab Switcher */}
          <div className="flex border-b border-slate-200 gap-2 pb-2">
            {[
              { id: 'general', label: 'Basic Info & Status' },
              { id: 'pricing', label: 'Pricing & Savings' },
              { id: 'limits', label: 'Resource Limits' },
              { id: 'features', label: `Features (${editFormData.features.length})` },
              { id: 'preview', label: 'Live Card Preview' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveModalTab(tab.id);
                  setValidationError('');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeModalTab === tab.id
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: BASIC INFO & STATUS */}
          {activeModalTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Plan Display Name"
                  name="name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="e.g. Starter, Professional, Enterprise"
                  required
                />
                <FormInput
                  label="Header Badge Text"
                  name="badge"
                  value={editFormData.badge}
                  onChange={(e) => setEditFormData({ ...editFormData, badge: e.target.value })}
                  placeholder="e.g. Essential, Most Popular"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Plan Platform Status</label>
                  <p className="text-[11px] text-slate-500">
                    Inactive plans will be hidden from public pricing and new signups.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                    <input
                      type="radio"
                      name="planStatus"
                      value="active"
                      checked={editFormData.status === 'active'}
                      onChange={() => setEditFormData({ ...editFormData, status: 'active' })}
                      className="text-emerald-700 focus:ring-emerald-600"
                    />
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Active
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                    <input
                      type="radio"
                      name="planStatus"
                      value="inactive"
                      checked={editFormData.status === 'inactive'}
                      onChange={() => setEditFormData({ ...editFormData, status: 'inactive' })}
                      className="text-amber-700 focus:ring-amber-600"
                    />
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                      Inactive
                    </span>
                  </label>
                </div>
              </div>

              <FormInput
                label="Target Audience & Plan Description"
                name="description"
                type="textarea"
                rows={2}
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="Brief summary of whom this plan is designed for..."
              />
            </div>
          )}

          {/* TAB 2: PRICING & SAVINGS */}
          {activeModalTab === 'pricing' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FormInput
                    label="Monthly Price (₹ INR)"
                    name="monthlyPrice"
                    type="number"
                    min="0"
                    value={editFormData.monthlyPrice}
                    onChange={(e) => setEditFormData({ ...editFormData, monthlyPrice: e.target.value })}
                    required
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Standard monthly billing rate</span>
                </div>

                <div>
                  <FormInput
                    label="Yearly / Annual Price (₹ INR)"
                    name="annualPrice"
                    type="number"
                    min="0"
                    value={editFormData.annualPrice}
                    onChange={(e) => setEditFormData({ ...editFormData, annualPrice: e.target.value })}
                    required
                  />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[11px] text-slate-400">Total upfront yearly charge</span>
                    <button
                      type="button"
                      onClick={handleAutoDiscount}
                      className="text-[11px] font-bold text-emerald-700 hover:underline"
                    >
                      Set 20% Discount
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Savings Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200/80 text-xs">
                <div className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  Live Dynamic Savings Calculation Preview:
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Annual Savings</span>
                    <span className="text-sm font-extrabold text-emerald-700">
                      {formatINR(editSavingsPreview.annualSavings)} / yr
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Discount %</span>
                    <span className="text-sm font-extrabold text-emerald-700">
                      {editSavingsPreview.savingsPercent}% OFF
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Effective Rate</span>
                    <span className="text-sm font-extrabold text-slate-900">
                      {formatINR(editSavingsPreview.effectiveMonthlyAnnual)} / mo
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 text-center">
                  Formula: 12 months &times; ₹{Number(editFormData.monthlyPrice) || 0} = ₹
                  {((Number(editFormData.monthlyPrice) || 0) * 12).toLocaleString('en-IN')}. Annual price is ₹
                  {Number(editFormData.annualPrice) || 0}.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: RESOURCE LIMITS */}
          {activeModalTab === 'limits' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <FormInput
                    label="Max Tracked Ingredients"
                    name="maxIngredients"
                    type="number"
                    min="10"
                    value={editFormData.maxIngredients}
                    onChange={(e) => setEditFormData({ ...editFormData, maxIngredients: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, maxIngredients: 9999 })}
                    className="text-[11px] text-emerald-700 font-bold hover:underline mt-0.5"
                  >
                    Set Unlimited (9999)
                  </button>
                </div>

                <div>
                  <FormInput
                    label="Max Staff Accounts"
                    name="maxStaff"
                    type="number"
                    min="1"
                    value={editFormData.maxStaff}
                    onChange={(e) => setEditFormData({ ...editFormData, maxStaff: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, maxStaff: 9999 })}
                    className="text-[11px] text-emerald-700 font-bold hover:underline mt-0.5"
                  >
                    Set Unlimited (9999)
                  </button>
                </div>

                <div>
                  <FormInput
                    label="Max Branches Allowed"
                    name="branches"
                    type="number"
                    min="1"
                    value={editFormData.branches}
                    onChange={(e) => setEditFormData({ ...editFormData, branches: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, branches: 999 })}
                    className="text-[11px] text-emerald-700 font-bold hover:underline mt-0.5"
                  >
                    Set Unlimited (999)
                  </button>
                </div>
              </div>

              <FormInput
                label="Support SLA Level"
                name="support"
                value={editFormData.support}
                onChange={(e) => setEditFormData({ ...editFormData, support: e.target.value })}
                placeholder="e.g. Standard Email (24h SLA), Priority Live Chat (2h SLA), 24/7 Dedicated CSM"
              />

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Tenant Protection:</strong> Changing these limits immediately updates active restaurants
                  subscribed to this plan, allowing staff seat expansion or higher ingredient thresholds.
                </span>
              </div>
            </div>
          )}

          {/* TAB 4: FEATURES MANAGER */}
          {activeModalTab === 'features' && (
            <div className="space-y-4">
              {/* Add New Feature */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFeatureText}
                  onChange={(e) => setNewFeatureText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                  placeholder="Enter a new feature description and press Add..."
                  className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
                <Button variant="brand" size="sm" icon={Plus} onClick={handleAddFeature}>
                  Add Feature
                </Button>
              </div>

              {/* Reorderable Feature List */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {editFormData.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors"
                  >
                    <span className="text-[10px] font-bold text-slate-400 w-4 text-center shrink-0">{idx + 1}</span>
                    <input
                      type="text"
                      value={feat}
                      onChange={(e) => handleUpdateFeature(idx, e.target.value)}
                      className="flex-1 text-xs bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-800"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveFeature(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveFeature(idx, 'down')}
                        disabled={idx === editFormData.features.length - 1}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="p-1 rounded text-rose-400 hover:text-rose-700 hover:bg-rose-50"
                        title="Delete Feature"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: LIVE CARD PREVIEW */}
          {activeModalTab === 'preview' && (
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Customer Plan Card Preview
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700">
                  {editFormData.badge || 'Standard Tier'}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black">{editFormData.name || 'Untitled Plan'}</h3>
                <p className="text-xs text-slate-400 mt-1">{editFormData.description}</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{formatINR(editFormData.monthlyPrice)}</span>
                <span className="text-xs text-slate-400">/ month (Annual: {formatINR(editFormData.annualPrice)}/yr)</span>
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold">
                Save {formatINR(editSavingsPreview.annualSavings)}/yr ({editSavingsPreview.savingsPercent}% OFF)
              </div>
              <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs text-slate-300">
                {editFormData.features.slice(0, 5).map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
                {editFormData.features.length > 5 && (
                  <div className="text-[11px] text-slate-500 italic pl-5">
                    + {editFormData.features.length - 5} more features included
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* RESET PLANS TO DEFAULTS CONFIRMATION MODAL */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Reset Subscription Plans to Platform Defaults"
        subtitle="Restore baseline pricing, limits, and feature sets for all tiers"
        footer={
          <>
            <Button variant="secondary" onClick={() => setResetModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmReset}>
              Yes, Reset All Plans
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs text-slate-700">
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Factory Reset Confirmation:</strong>
              This action will revert Starter (₹999/mo, ₹9,588/yr), Professional (₹2,499/mo, ₹23,988/yr), Enterprise (₹5,499/mo, ₹53,988/yr), and Custom (Tailored Scale) to their initial approved pricing and resource limits.
            </div>
          </div>
          <p className="text-slate-500">
            Tenant accounts currently assigned to these plans will have their ingredient and staff limits synchronized back to the factory defaults.
          </p>
        </div>
      </Modal>

      {/* ASSIGN PLAN TO RESTAURANT MODAL (Workflow D Step 5-6) */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Subscription Plan to Restaurant"
        subtitle="Upgrades or migrates a restaurant tenant to a different package"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="brand" onClick={handleAssignPlan}>
              Apply &amp; Update Subscription
            </Button>
          </>
        }
      >
        <form onSubmit={handleAssignPlan} className="space-y-4">
          <FormInput
            label="Select Restaurant"
            name="restaurantId"
            type="select"
            value={assignFormData.restaurantId}
            onChange={(e) => setAssignFormData({ ...assignFormData, restaurantId: e.target.value })}
            options={restaurants.map((r) => ({
              label: `${r.name} (Currently on ${r.planName})`,
              value: r.id,
            }))}
          />

          <FormInput
            label="Target Subscription Plan"
            name="planId"
            type="select"
            value={assignFormData.planId}
            onChange={(e) => setAssignFormData({ ...assignFormData, planId: e.target.value })}
            options={plans.map((p) => ({
              label: `${p.name} (${formatINR(p.monthlyPrice)}/mo)`,
              value: p.id,
            }))}
          />

          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
            <strong>Instant Provisioning:</strong> The tenant's limits for ingredient counts and allowed staff seats will be automatically updated immediately upon confirmation.
          </div>
        </form>
      </Modal>

      {/* SUPPLIER PLAN PAYMENT RECEIPT MODAL */}
      <Modal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        title={`Payment Receipt: ${selectedReceipt?.invoiceNumber || ''}`}
        subtitle="Official Platform Subscription Tax Receipt"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              size="sm"
              icon={Printer}
              onClick={() => window.print()}
            >
              Print Receipt
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setReceiptModalOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        {selectedReceipt && (
          <div className="space-y-4 p-2">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                  B2B Supplier Subscription
                </span>
                <h4 className="text-lg font-black">{selectedReceipt.planName} Tier</h4>
                <div className="text-xs text-slate-300 mt-0.5">
                  Invoice Ref: {selectedReceipt.invoiceNumber}
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {selectedReceipt.status}
                </span>
                <div className="text-xl font-black mt-2">
                  {selectedReceipt.amount === 0 ? '₹0' : formatINR(selectedReceipt.amount)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-500 block text-[11px]">Billed To (Supplier):</span>
                <strong className="text-slate-800 text-sm">{selectedReceipt.supplierName}</strong>
                <div className="text-slate-500 mt-0.5">Supplier ID: {selectedReceipt.supplierId}</div>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Billing Platform:</span>
                <strong className="text-slate-800 text-sm">StockMate SaaS Procurement</strong>
                <div className="text-slate-500 mt-0.5">GSTIN: 27AABCU9603R1ZM</div>
              </div>
            </div>

            <div className="space-y-2 text-xs border border-slate-200 rounded-xl p-3">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Payment Date:</span>
                <span className="font-semibold text-slate-800">{selectedReceipt.paymentDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono text-slate-800">{selectedReceipt.transactionId || 'TXN-98214'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">UTR / Reference:</span>
                <span className="font-mono text-emerald-700 font-bold">{selectedReceipt.referenceNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="font-semibold text-slate-800">{selectedReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Next Renewal Date:</span>
                <span className="font-semibold text-slate-800">{selectedReceipt.nextBillingDate || '2026-11-15'}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 1. ADD / EDIT CUSTOM MODULE MODAL */}
      <Modal
        isOpen={moduleModalOpen}
        onClose={() => setModuleModalOpen(false)}
        title={moduleModalMode === 'create' ? 'Add New Custom Plan Module' : `Edit Module: ${moduleFormData.name}`}
        subtitle="Manage modular capability pricing, category, and public configurator availability."
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="secondary" size="sm" onClick={() => setModuleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="brand" size="sm" onClick={handleSaveModule}>
              {moduleModalMode === 'create' ? 'Create Module' : 'Save Module Changes'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveModule} className="space-y-4">
          <FormInput
            label="Module Name"
            value={moduleFormData.name}
            onChange={(e) => setModuleFormData({ ...moduleFormData, name: e.target.value })}
            placeholder="e.g. Loyalty & Rewards Engine"
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description &amp; Operational Capability
            </label>
            <textarea
              value={moduleFormData.description}
              onChange={(e) => setModuleFormData({ ...moduleFormData, description: e.target.value })}
              rows={2}
              placeholder="Explain how this capability benefits restaurant kitchens..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Capability Category
              </label>
              <select
                value={moduleFormData.category}
                onChange={(e) => setModuleFormData({ ...moduleFormData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {STANDARD_MODULE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={Boolean(moduleFormData.isRequired || moduleFormData.isBaseModule)}
                  disabled={moduleFormData.isBaseModule || moduleFormData.id === 'pos_billing'}
                  onChange={(e) =>
                    setModuleFormData({ ...moduleFormData, isRequired: e.target.checked })
                  }
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Required Foundation Module
                </span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              label="Monthly Price (₹)"
              type="number"
              value={moduleFormData.monthlyPrice}
              onChange={(e) => {
                const val = Math.max(0, Number(e.target.value) || 0);
                setModuleFormData({
                  ...moduleFormData,
                  monthlyPrice: val,
                  annualPrice: Math.round(val * 12 * 0.8),
                });
              }}
              required
            />

            <FormInput
              label="Annual Total Price (₹)"
              type="number"
              value={moduleFormData.annualPrice}
              onChange={(e) =>
                setModuleFormData({
                  ...moduleFormData,
                  annualPrice: Math.max(0, Number(e.target.value) || 0),
                })
              }
              required
            />
          </div>

          {/* Pricing Preview Pill */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block">Effective Monthly Rate (on Annual):</span>
              <strong className="text-emerald-700 dark:text-emerald-400 font-mono text-sm font-black">
                {formatINR(Math.round((Number(moduleFormData.annualPrice) || 0) / 12))}/mo
              </strong>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-200">
              Save ~20% on Annual
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Configurator Availability Status
              </span>
              <span className="text-[11px] text-slate-500">
                When active, restaurants can select this module in the public Custom Plan Builder.
              </span>
            </div>

            <button
              type="button"
              disabled={moduleFormData.isBaseModule || moduleFormData.id === 'pos_billing'}
              onClick={() =>
                setModuleFormData({
                  ...moduleFormData,
                  status: moduleFormData.status === 'active' ? 'inactive' : 'active',
                })
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                moduleFormData.isBaseModule || moduleFormData.id === 'pos_billing'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 opacity-80 cursor-not-allowed'
                  : moduleFormData.status === 'active'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
              }`}
            >
              {moduleFormData.isBaseModule || moduleFormData.id === 'pos_billing'
                ? 'Required Base'
                : moduleFormData.status === 'active'
                  ? 'Active'
                  : 'Disabled'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. DELETE MODULE CONFIRMATION MODAL */}
      <Modal
        isOpen={deleteModuleModalOpen}
        onClose={() => setDeleteModuleModalOpen(false)}
        title="Remove Custom Plan Module"
        subtitle="Confirm deletion of optional module from the platform catalog"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="secondary" size="sm" onClick={() => setDeleteModuleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmDeleteModule}>
              Yes, Delete Module
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              Are you sure you want to delete module <strong>"{moduleToDelete?.name}"</strong>? This module will be removed from the public Custom Plan Builder.
            </div>
          </div>
        </div>
      </Modal>

      {/* 3. CONFIGURE BILLING RULES MODAL */}
      <Modal
        isOpen={ratesModalOpen}
        onClose={() => setRatesModalOpen(false)}
        title="Configure Custom Plan Billing Rules"
        subtitle="Global unit rates for hardware terminals, additional outlets, and statutory tax calculations"
        maxWidth="max-w-2xl"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="secondary" size="sm" onClick={() => setRatesModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="brand" size="sm" onClick={handleSaveRates}>
              Save Billing Rules
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveRates} className="space-y-4">
          {/* Interactive Preview Scenario Card */}
          <div className="p-4.5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs text-slate-900 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Live Scenario Preview
              </span>
              <span className="text-xs font-semibold text-slate-500">2 Outlets • 3 Terminals • 10 Staff</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div>
                <span className="text-slate-500 block text-[11px] font-medium">Monthly Gross:</span>
                <span className="font-mono font-black text-slate-900 text-base">
                  {formatINR(599 + (Number(ratesFormData.additionalOutletMonthly) || 499) + (2 * (Number(ratesFormData.additionalTerminalMonthly) || 250)) + (5 * (Number(ratesFormData.additionalStaffMonthly) || 99)))}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px] font-medium">With GST ({(Number(ratesFormData.gstRate || 0.18) * 100).toFixed(0)}%):</span>
                <span className="font-mono font-black text-emerald-600 text-base">
                  {formatINR(Math.round((599 + (Number(ratesFormData.additionalOutletMonthly) || 499) + (2 * (Number(ratesFormData.additionalTerminalMonthly) || 250)) + (5 * (Number(ratesFormData.additionalStaffMonthly) || 99))) * (1 + Number(ratesFormData.gstRate || 0.18))))}/mo
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-slate-500 block text-[11px] font-medium">Annual Discount:</span>
                <span className="font-mono font-black text-emerald-700 text-base">
                  {ratesFormData.annualDiscountPercent || 20}% off
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              label="Additional POS Terminal (Monthly ₹)"
              type="number"
              value={ratesFormData.additionalTerminalMonthly}
              onChange={(e) => {
                const val = Math.max(0, Number(e.target.value) || 0);
                setRatesFormData({
                  ...ratesFormData,
                  additionalTerminalMonthly: val,
                  additionalTerminalAnnual: Math.round(val * 12 * 0.8),
                });
              }}
              required
            />
            <FormInput
              label="Additional POS Terminal (Annual ₹)"
              type="number"
              value={ratesFormData.additionalTerminalAnnual}
              onChange={(e) =>
                setRatesFormData({ ...ratesFormData, additionalTerminalAnnual: Math.max(0, Number(e.target.value) || 0) })
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              label="Additional Outlet (Monthly ₹)"
              type="number"
              value={ratesFormData.additionalOutletMonthly}
              onChange={(e) => {
                const val = Math.max(0, Number(e.target.value) || 0);
                setRatesFormData({
                  ...ratesFormData,
                  additionalOutletMonthly: val,
                  additionalOutletAnnual: Math.round(val * 12 * 0.8),
                });
              }}
              required
            />
            <FormInput
              label="Additional Outlet (Annual ₹)"
              type="number"
              value={ratesFormData.additionalOutletAnnual}
              onChange={(e) =>
                setRatesFormData({ ...ratesFormData, additionalOutletAnnual: Math.max(0, Number(e.target.value) || 0) })
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              label="Additional Staff Seat (Monthly ₹)"
              type="number"
              value={ratesFormData.additionalStaffMonthly}
              onChange={(e) => {
                const val = Math.max(0, Number(e.target.value) || 0);
                setRatesFormData({
                  ...ratesFormData,
                  additionalStaffMonthly: val,
                  additionalStaffAnnual: Math.round(val * 12 * 0.8),
                });
              }}
              required
            />
            <FormInput
              label="Additional Staff Seat (Annual ₹)"
              type="number"
              value={ratesFormData.additionalStaffAnnual}
              onChange={(e) =>
                setRatesFormData({ ...ratesFormData, additionalStaffAnnual: Math.max(0, Number(e.target.value) || 0) })
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormInput
              label="Statutory GST Rate (e.g. 0.18)"
              type="number"
              step="0.01"
              value={ratesFormData.gstRate}
              onChange={(e) =>
                setRatesFormData({ ...ratesFormData, gstRate: Number(e.target.value) || 0.18 })
              }
              required
            />
            <FormInput
              label="Annual Discount (%)"
              type="number"
              value={ratesFormData.annualDiscountPercent}
              onChange={(e) =>
                setRatesFormData({ ...ratesFormData, annualDiscountPercent: Number(e.target.value) || 20 })
              }
              required
            />
            <FormInput
              label="Margin Floor Ratio (e.g. 0.70)"
              type="number"
              step="0.01"
              value={ratesFormData.minimumPriceMarginFloorRatio}
              onChange={(e) =>
                setRatesFormData({ ...ratesFormData, minimumPriceMarginFloorRatio: Number(e.target.value) || 0.70 })
              }
              required
            />
          </div>

          {/* Limits Row */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Automated Configuration Limits
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">POS Stations (Min / Max)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={ratesFormData.minTerminals}
                    onChange={(e) => setRatesFormData({ ...ratesFormData, minTerminals: Number(e.target.value) || 1 })}
                    className="w-1/2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-center font-bold"
                  />
                  <input
                    type="number"
                    value={ratesFormData.maxTerminals}
                    onChange={(e) => setRatesFormData({ ...ratesFormData, maxTerminals: Number(e.target.value) || 25 })}
                    className="w-1/2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-center font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">Outlets (Min / Max)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={ratesFormData.minOutlets}
                    onChange={(e) => setRatesFormData({ ...ratesFormData, minOutlets: Number(e.target.value) || 1 })}
                    className="w-1/2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-center font-bold"
                  />
                  <input
                    type="number"
                    value={ratesFormData.maxOutlets}
                    onChange={(e) => setRatesFormData({ ...ratesFormData, maxOutlets: Number(e.target.value) || 50 })}
                    className="w-1/2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-center font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">Staff Seats (Min / Max)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={ratesFormData.minStaff}
                    onChange={(e) => setRatesFormData({ ...ratesFormData, minStaff: Number(e.target.value) || 1 })}
                    className="w-1/2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-center font-bold"
                  />
                  <input
                    type="number"
                    value={ratesFormData.maxStaff}
                    onChange={(e) => setRatesFormData({ ...ratesFormData, maxStaff: Number(e.target.value) || 200 })}
                    className="w-1/2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-center font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* 4. INSPECT CUSTOMER CONFIGURATION MODAL */}
      <Modal
        isOpen={inspectModalOpen}
        onClose={() => setInspectModalOpen(false)}
        title={`Custom Configuration: ${inspectingTenant?.name || ''}`}
        subtitle="Detailed operational modules, terminal stations, and financial breakdown"
        maxWidth="max-w-2xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-slate-400">
              Account Status:{' '}
              <strong className="text-emerald-600 capitalize">{inspectingTenant?.status || 'Active'}</strong>
            </span>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setInspectModalOpen(false)}>
                Close
              </Button>
              {inspectingTenant?.rawRequest && inspectingTenant?.status === 'pending_review' && (
                <Button
                  variant="brand"
                  size="sm"
                  icon={FileCheck}
                  onClick={() => {
                    setInspectModalOpen(false);
                    handleOpenReviewQuote(inspectingTenant.rawRequest);
                  }}
                >
                  Review &amp; Quote
                </Button>
              )}
            </div>
          </div>
        }
      >
        {inspectingTenant && (
          <div className="space-y-4 text-xs">
            {/* Primary Details */}
            <div className="p-4.5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 tracking-wider">
                  Configured Tenant
                </span>
                <h4 className="text-base font-black text-slate-900 mt-1">{inspectingTenant.name}</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  {inspectingTenant.ownerName} &bull; {inspectingTenant.ownerEmail}
                </p>
                <p className="text-[11px] text-slate-400">{inspectingTenant.phone}</p>
              </div>

              <div className="sm:text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Subscription Value
                </span>
                <span className="text-2xl font-mono font-black text-emerald-600">
                  {formatINR(inspectingTenant.monthlyAmount)}
                  <span className="text-xs font-normal text-slate-500 ml-0.5">/mo</span>
                </span>
                <span className="text-[11px] text-slate-600 block font-medium">
                  {formatINR(inspectingTenant.annualAmount)}/yr ({inspectingTenant.billingCycle})
                </span>
              </div>
            </div>

            {/* Hardware & Capacity Summary */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-white border border-[#E5E7EB] shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Outlets</span>
                <span className="text-base font-black text-slate-900">
                  {inspectingTenant.outlets}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#E5E7EB] shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">POS Stations</span>
                <span className="text-base font-black text-slate-900">
                  {inspectingTenant.terminals}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#E5E7EB] shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Staff Accounts</span>
                <span className="text-base font-black text-slate-900">
                  {inspectingTenant.staffCount}
                </span>
              </div>
            </div>

            {/* Itemized Modules Breakdown */}
            <div className="space-y-2 border border-[#E5E7EB] rounded-2xl p-4 bg-white shadow-2xs">
              <span className="font-bold text-slate-900 block pb-2 border-b border-slate-100">
                Enabled Kitchen Capabilities &amp; Modules ({inspectingTenant.activeModules.length})
              </span>

              <div className="space-y-1.5 divide-y divide-slate-100">
                <div className="flex justify-between items-center py-1 text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Base POS &amp; Cloud Billing (Primary Station)</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">₹599/mo</span>
                </div>

                {inspectingTenant.activeModules
                  .filter((id) => id !== 'pos_billing')
                  .map((modId) => {
                    const mod = customPlanModules.find((m) => m.id === modId);
                    return (
                      <div key={modId} className="flex justify-between items-center py-1 text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{mod ? mod.name : modId}</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900">
                          +{formatINR(mod?.monthlyPrice || 400)}/mo
                        </span>
                      </div>
                    );
                  })}

                {inspectingTenant.terminals > 1 && (
                  <div className="flex justify-between items-center py-1 text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{inspectingTenant.terminals - 1} Additional POS Station(s)</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">
                      +{formatINR((inspectingTenant.terminals - 1) * (pricingUnitRates.additionalTerminalMonthly || 250))}/mo
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Inbound Request Reasons if Path C */}
            {inspectingTenant.rawRequest && inspectingTenant.rawRequest.reviewReasons && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-1">
                <strong className="block font-bold">Exceptions Requiring Review:</strong>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                  {inspectingTenant.rawRequest.reviewReasons.map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 5. REVIEW & QUOTE REQUEST MODAL */}
      <Modal
        isOpen={quoteReviewModalOpen}
        onClose={() => setQuoteReviewModalOpen(false)}
        title={`Review Custom Plan Quote: ${reviewingRequest?.restaurantName || ''}`}
        subtitle="Evaluate enterprise custom configuration, review reasons, and submit official quotation."
        maxWidth="max-w-2xl"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="secondary" size="sm" onClick={() => setQuoteReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={quoteDecision === 'reject' ? 'danger' : 'brand'}
              size="sm"
              onClick={handleSaveReviewDecision}
            >
              {quoteDecision === 'reject'
                ? 'Reject Request'
                : quoteDecision === 'quote'
                  ? 'Send Quotation'
                  : 'Approve Custom Plan'}
            </Button>
          </div>
        }
      >
        {reviewingRequest && (
          <form onSubmit={handleSaveReviewDecision} className="space-y-4 text-xs">
            {/* Request Summary Banner */}
            <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 uppercase tracking-wider inline-block mb-1">
                  Reference: {reviewingRequest.id}
                </span>
                <strong className="text-sm font-bold text-slate-900 block">{reviewingRequest.restaurantName}</strong>
                <span className="text-slate-600 block text-[11px]">
                  Owner: {reviewingRequest.ownerName} &bull; {reviewingRequest.ownerEmail}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">System Calculation</span>
                <span className="font-mono font-black text-emerald-600 text-lg">
                  {formatINR(reviewingRequest.systemCalculatedAmount || 25000)}/yr
                </span>
              </div>
            </div>

            {/* Decision Radio Group */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Super Admin Decision
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'approve', label: 'Approve Plan', desc: 'Accept calculated rates' },
                  { id: 'quote', label: 'Send Custom Quote', desc: 'Specify custom price' },
                  { id: 'reject', label: 'Reject Request', desc: 'Decline with reason' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setQuoteDecision(opt.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      quoteDecision === opt.id
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <strong className="block font-bold">{opt.label}</strong>
                    <span className="text-[10px] text-slate-500 block">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quoted Amount Field (if quote or approve) */}
            {quoteDecision !== 'reject' && (
              <FormInput
                label="Quoted Subscription Amount (Annual ₹)"
                type="number"
                value={quoteAmount}
                onChange={(e) => setQuoteAmount(e.target.value)}
                required
              />
            )}

            {/* Admin Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Admin Notes &amp; Commercial Terms
              </label>
              <textarea
                value={quoteAdminNotes}
                onChange={(e) => setQuoteAdminNotes(e.target.value)}
                rows={2}
                placeholder="Add internal notes, discount rationale, or custom SLA terms..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Rejection Reason (if reject) */}
            {quoteDecision === 'reject' && (
              <div>
                <label className="block text-xs font-semibold text-rose-700 mb-1">
                  Rejection Reason (Shared with Customer)
                </label>
                <textarea
                  value={quoteRejectionReason}
                  onChange={(e) => setQuoteRejectionReason(e.target.value)}
                  rows={2}
                  placeholder="Explain why this enterprise request cannot be fulfilled at this time..."
                  className="w-full rounded-xl border border-rose-300 p-2.5 text-xs bg-rose-50/30 text-rose-950 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  required
                />
              </div>
            )}
          </form>
        )}
      </Modal>

      {/* 6. ASSIGN CUSTOM PLAN TO RESTAURANT MODAL */}
      <Modal
        isOpen={assignCustomModalOpen}
        onClose={() => setAssignCustomModalOpen(false)}
        title="Assign Custom Plan to Restaurant"
        subtitle="Activate custom operational configuration directly onto a restaurant tenant."
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="secondary" size="sm" onClick={() => setAssignCustomModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="brand" size="sm" onClick={handleConfirmAssignCustom}>
              Confirm &amp; Assign Custom Plan
            </Button>
          </div>
        }
      >
        {assignCustomTenant && (
          <form onSubmit={handleConfirmAssignCustom} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Target Restaurant
              </label>
              <select
                value={assignTargetRestaurantId}
                onChange={(e) => setAssignTargetRestaurantId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.cuisine} • Currently on {r.planName})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-2">
              <span className="font-bold text-slate-900 block">
                Custom Configuration Summary:
              </span>
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-700">
                <span className="text-slate-500">Outlets &amp; POS Stations:</span>
                <span className="font-semibold text-slate-900">{assignCustomTenant.outlets} Outlets • {assignCustomTenant.terminals} Terminals</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-700">
                <span className="text-slate-500">Staff Accounts:</span>
                <span className="font-semibold text-slate-900">{assignCustomTenant.staffCount} Accounts</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-700">
                <span className="text-slate-500">Active Modules:</span>
                <span className="font-semibold text-slate-900">{assignCustomTenant.activeModules.length} Modules</span>
              </div>
              <div className="flex justify-between py-1 text-slate-700">
                <span className="text-slate-500">Subscription Rate:</span>
                <span className="font-mono font-bold text-emerald-600 text-sm">
                  {formatINR(assignCustomTenant.monthlyAmount)}/mo ({formatINR(assignCustomTenant.annualAmount)}/yr)
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Instant Provisioning:</strong> The tenant's limits, allowed terminals, and modular capabilities will update immediately.
              </span>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
export default SubscriptionPlans;
