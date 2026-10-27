import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  IndianRupee,
  PieChart as PieIcon,
  Download,
  Calendar,
  Layers,
  Sparkles,
  PackageCheck,
  RotateCcw,
  AlertTriangle,
  Receipt,
  CheckCircle2,
  Clock,
  History,
  FileText,
  Printer,
  Users,
  Search,
  Table,
  Filter,
  Check,
  ShieldCheck,
  Boxes,
} from 'lucide-react';
import { StaffReports } from './StaffReports';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatINR } from '../../data/inventoryBillingData';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { restaurantConsumptionTrends, restaurantCategoryValuation } from '../../data/mockData';

export const ReportsPage = () => {
  const {
    currentUser,
    currentRestaurant,
    restaurantIngredients,
    restaurantMovements,
    goodsReceivedNotes,
    supplierInvoices,
    supplierReturns,
    productBatches,
    addToast,
  } = useApp();

  // Route & Logic Guard: Restaurant Manager can ONLY see Staff Reports.
  // Stock data calculations and views are strictly bypassed.
  if (currentUser?.role === 'restaurant_manager') {
    return <StaffReports isEmbedded={false} />;
  }

  const isOwner = currentUser?.role === 'restaurant_owner';

  const [activeTab, setActiveTab] = useState('procurement_audit'); // 'procurement_audit' | 'inventory_analytics' | 'staff_reports'
  const [timeframe, setTimeframe] = useState('month');

  // Filter/Search states for tables
  const [batchSearchTerm, setBatchSearchTerm] = useState('');
  const [ingredientSearchTerm, setIngredientSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Enforce tab permissions: only Owner can access 'staff_reports'
  const currentTab = !isOwner && activeTab === 'staff_reports' ? 'procurement_audit' : activeTab;

  // Dynamic calculations
  const totalValuation = restaurantIngredients.reduce((acc, i) => acc + (i.quantity * i.costPerUnit), 0);

  const totalWastedItems = restaurantMovements.filter(m => m.type === 'wastage');
  const estimatedWastageCost = totalWastedItems.reduce((acc, m) => acc + Math.abs(m.quantity * 5.5), 0);

  // Supplier Audit Metrics
  const totalPurchased = (supplierInvoices || []).reduce((acc, inv) => acc + (inv.totalAmount || 0), 0);
  const totalAcceptedAmount = (supplierInvoices || []).reduce((acc, inv) => acc + (inv.acceptedAmount || inv.totalAmount || 0), 0);
  const totalDamageLosses = (supplierInvoices || []).reduce((acc, inv) => acc + (inv.damageDeduction || 0), 0);
  const totalUnsoldReturns = (supplierReturns || [])
    .filter(r => r.returnType === 'Unsold Fresh Goods Agreement')
    .reduce((acc, r) => acc + (r.totalLossAmount || 0), 0);
  const totalOutstandingDues = (supplierInvoices || []).reduce((acc, inv) => acc + (inv.outstandingBalance || 0), 0);

  const CATEGORY_COLORS = ['#0E5C38', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899'];

  // Tab 1: Structured Dock Damage Audit Data
  const damageReturns = useMemo(() => {
    const list = (supplierReturns || []).filter(
      r => r.returnType === 'Damaged on Delivery' || r.returnType?.toLowerCase().includes('damage')
    );
    if (list.length > 0) return list;
    return [
      {
        id: 'dmg-1',
        returnNumber: 'RET-2026-001',
        productName: 'Farm-Fresh Chicken Breast',
        supplierName: 'Metro Food Distributors',
        poNumber: 'PO-1040',
        grnNumber: 'GRN-2026-1040',
        returnQty: 2,
        unit: 'kg',
        unitCost: 280,
        totalLossAmount: 560,
        reason: 'Vacuum packaging breached & cold-chain break (>8°C)',
        status: 'Approved',
        settlementType: 'Credit Note Claimed',
      },
      {
        id: 'dmg-2',
        returnNumber: 'RET-2026-002',
        productName: 'Fresh Pav / Buns',
        supplierName: 'Golden Crust Artisan Bakery',
        poNumber: 'PO-1041',
        grnNumber: 'GRN-2026-1041',
        returnQty: 5,
        unit: 'packs (6 pcs)',
        unitCost: 25,
        totalLossAmount: 125,
        reason: 'Crushed during offloading from van at loading dock',
        status: 'Approved',
        settlementType: 'Credit Note Claimed',
      },
      {
        id: 'dmg-3',
        returnNumber: 'RET-2026-003',
        productName: 'Roma Vine Tomatoes',
        supplierName: 'FreshFarm Organics',
        poNumber: 'PO-1038',
        grnNumber: 'GRN-2026-1038',
        returnQty: 2,
        unit: 'kg',
        unitCost: 45,
        totalLossAmount: 90,
        reason: 'Crushed in bottom crate during transit, juice leakage',
        status: 'Approved',
        settlementType: 'Invoice Adjusted',
      },
      {
        id: 'dmg-4',
        returnNumber: 'RET-2026-004',
        productName: 'Full Cream Dairy Milk',
        supplierName: 'Amrit Dairy Farms & Products',
        poNumber: 'PO-1039',
        grnNumber: 'GRN-2026-1039',
        returnQty: 4,
        unit: 'L',
        unitCost: 60,
        totalLossAmount: 240,
        reason: 'Container seal ruptured on loading ramp during offload',
        status: 'Approved',
        settlementType: 'Vendor Credit Issued',
      },
    ];
  }, [supplierReturns]);

  // Tab 1: Fresh Bread & Perishables SLA Returns Data
  const freshSlaReturns = useMemo(() => {
    const list = (supplierReturns || []).filter(
      r => r.returnType === 'Unsold Fresh Goods Agreement' || r.returnType?.toLowerCase().includes('unsold')
    );
    if (list.length > 0) return list;
    return [
      {
        id: 'sla-1',
        returnNumber: 'RET-2026-SLA-01',
        creditNoteId: 'CRN-2026-002',
        productName: 'Artisanal Daily Pav / Buns',
        supplierName: 'Golden Crust Artisan Bakery',
        slaAgreement: '24h Pav Freshness SLA (20% Max Allowance)',
        requestDate: '2026-10-23',
        returnQty: 15,
        unit: 'packs',
        totalLossAmount: 375,
        status: 'Approved',
        reason: '15 unsold daily pav packs returned before 9:00 PM cutoff window',
        complianceStatus: '100% SLA Compliant',
      },
      {
        id: 'sla-2',
        returnNumber: 'RET-2026-SLA-02',
        creditNoteId: 'CRN-2026-003',
        productName: 'Handcrafted Sourdough Loaves',
        supplierName: 'Golden Crust Artisan Bakery',
        slaAgreement: '24h Daily Sourdough SLA (15% Allowance)',
        requestDate: '2026-10-24',
        returnQty: 3,
        unit: 'loaves',
        totalLossAmount: 180,
        status: 'Approved',
        reason: 'Returned 8:30 PM prior to evening bake transition cutoff',
        complianceStatus: '100% SLA Compliant',
      },
      {
        id: 'sla-3',
        returnNumber: 'RET-2026-SLA-03',
        creditNoteId: 'N/A (Utilized)',
        productName: 'Artisanal Malai Paneer Blocks',
        supplierName: 'Amrit Dairy Farms & Products',
        slaAgreement: '36h Fresh Paneer Utilization SLA',
        requestDate: '2026-10-24',
        returnQty: 0,
        unit: 'kg',
        totalLossAmount: 0,
        status: 'Completed',
        reason: 'Zero returns. 100% of batch consumed prior to 36h threshold',
        complianceStatus: 'Optimal (100% Utilized)',
      },
    ];
  }, [supplierReturns]);

  // Tab 1: Batch movements filter
  const allBatchMovements = useMemo(() => {
    return (productBatches || []).flatMap((b) =>
      (b.movements || []).map((m) => ({
        ...m,
        batchId: b.batchId,
        productName: b.productName,
        unit: b.unit,
      }))
    );
  }, [productBatches]);

  const filteredBatchMovements = useMemo(() => {
    if (!batchSearchTerm.trim()) return allBatchMovements;
    const query = batchSearchTerm.toLowerCase();
    return allBatchMovements.filter(
      (m) =>
        m.productName.toLowerCase().includes(query) ||
        m.batchId.toLowerCase().includes(query) ||
        m.reason?.toLowerCase().includes(query) ||
        m.by?.toLowerCase().includes(query)
    );
  }, [allBatchMovements, batchSearchTerm]);

  // Tab 2: Category Valuation enriched with totals and shares
  const categoryValuationSummary = useMemo(() => {
    const totalVal = restaurantCategoryValuation.reduce((acc, c) => acc + (c.value || 0), 0);
    const totalItems = restaurantCategoryValuation.reduce((acc, c) => acc + (c.items || 0), 0);

    const categoriesWithStats = restaurantCategoryValuation.map((c, idx) => {
      const share = totalVal > 0 ? ((c.value / totalVal) * 100).toFixed(1) : '0.0';
      const catName = c.category || c.name || 'Uncategorized';
      let velocity = 'Medium';
      let bufferHealth = 'Healthy (3-5 Days)';
      if (catName.includes('Meat') || catName.includes('Dairy')) {
        velocity = 'Fast (Daily / FEFO)';
        bufferHealth = 'Critical (1-2 Days Buffer)';
      } else if (catName.includes('Spices') || catName.includes('Grains')) {
        velocity = 'Slow / Bulk';
        bufferHealth = 'High Reserve (14+ Days)';
      }

      return {
        ...c,
        name: catName,
        share,
        velocity,
        bufferHealth,
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
      };
    });

    return { items: categoriesWithStats, totalVal, totalItems };
  }, [restaurantCategoryValuation, CATEGORY_COLORS]);

  // Tab 2: Daily Kitchen Consumption Trends Data with computed totals
  const dailyConsumptionTableData = useMemo(() => {
    const list = restaurantConsumptionTrends.map((row) => {
      const consumptionVal = row.consumption || row.consumed || 0;
      const wastageVal = row.wastage || 0;
      const purchaseVal = row.purchases || 0;
      const netDelta = purchaseVal - consumptionVal;
      const totalOutflow = consumptionVal + wastageVal;
      const efficiency = totalOutflow > 0 ? ((consumptionVal / totalOutflow) * 100).toFixed(1) : '100.0';

      return {
        ...row,
        consumptionVal,
        wastageVal,
        purchaseVal,
        netDelta,
        efficiency,
      };
    });

    const totalConsumption = list.reduce((acc, r) => acc + r.consumptionVal, 0);
    const totalWastage = list.reduce((acc, r) => acc + r.wastageVal, 0);
    const totalPurchases = list.reduce((acc, r) => acc + r.purchaseVal, 0);
    const avgEfficiency = (
      list.reduce((acc, r) => acc + parseFloat(r.efficiency), 0) / (list.length || 1)
    ).toFixed(1);

    return { list, totalConsumption, totalWastage, totalPurchases, avgEfficiency };
  }, [restaurantConsumptionTrends]);

  // Tab 2: High-Value & Spoilage-Sensitive Stock Table
  const filteredIngredients = useMemo(() => {
    return (restaurantIngredients || []).filter((item) => {
      const matchesSearch =
        !ingredientSearchTerm.trim() ||
        item.name.toLowerCase().includes(ingredientSearchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(ingredientSearchTerm.toLowerCase());

      const matchesCategory =
        selectedCategoryFilter === 'all' || item.category === selectedCategoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [restaurantIngredients, ingredientSearchTerm, selectedCategoryFilter]);

  const uniqueCategories = useMemo(() => {
    const set = new Set((restaurantIngredients || []).map((i) => i.category).filter(Boolean));
    return Array.from(set);
  }, [restaurantIngredients]);

  // Comprehensive Multi-Section CSV Export
  const handleExportReport = () => {
    try {
      const rows = [];
      const timestamp = new Date().toISOString().split('T')[0];

      if (currentTab === 'procurement_audit') {
        rows.push(['STOCKMATE SAAS - SUPPLIER PROCUREMENT & DOCK AUDIT REPORT']);
        rows.push(['Generated Date:', timestamp]);
        rows.push(['Reporting Timeframe:', timeframe.toUpperCase()]);
        rows.push([]);

        // Section 1
        rows.push(['--- GOODS PURCHASED VS ACCEPTED AUDIT ---']);
        rows.push(['PO Ref', 'GRN Ref', 'Supplier Partner', 'Invoice No', 'Billed Amount', 'Accepted Stock', 'Dock Damage Loss', 'Net Payable', 'Status']);
        (supplierInvoices || []).forEach((inv) => {
          rows.push([
            `"${inv.poNumber}"`,
            `"${inv.grnNumber}"`,
            `"${inv.supplierName}"`,
            `"${inv.invoiceNumber}"`,
            inv.totalAmount,
            inv.acceptedAmount || inv.totalAmount,
            inv.damageDeduction || 0,
            inv.netPayable,
            `"${inv.verificationStatus || 'Verified'}"`,
          ]);
        });
        rows.push([]);

        // Section 2
        rows.push(['--- DOCK DAMAGE LOSS WRITE-OFFS ---']);
        rows.push(['Return Ref', 'Item Name', 'Supplier Partner', 'PO Ref', 'Damaged Qty', 'Unit Cost', 'Loss Amount', 'Damage Cause', 'Settlement Status']);
        damageReturns.forEach((dmg) => {
          rows.push([
            `"${dmg.returnNumber}"`,
            `"${dmg.productName}"`,
            `"${dmg.supplierName}"`,
            `"${dmg.poNumber}"`,
            `"${dmg.returnQty} ${dmg.unit}"`,
            dmg.unitCost,
            dmg.totalLossAmount,
            `"${dmg.reason}"`,
            `"${dmg.settlementType || dmg.status}"`,
          ]);
        });
        rows.push([]);

        // Section 3
        rows.push(['--- FRESH GOODS & PERISHABLES SLA RETURNS ---']);
        rows.push(['Return Ref', 'Credit Note', 'Item Name', 'Supplier Partner', 'SLA Contract', 'Return Qty', 'Credit Value', 'Compliance Status']);
        freshSlaReturns.forEach((sla) => {
          rows.push([
            `"${sla.returnNumber}"`,
            `"${sla.creditNoteId}"`,
            `"${sla.productName}"`,
            `"${sla.supplierName}"`,
            `"${sla.slaAgreement}"`,
            `"${sla.returnQty} ${sla.unit}"`,
            sla.totalLossAmount,
            `"${sla.complianceStatus}"`,
          ]);
        });
      } else {
        rows.push(['STOCKMATE SAAS - KITCHEN INVENTORY VALUATION & SPOILAGE AUDIT']);
        rows.push(['Generated Date:', timestamp]);
        rows.push(['Total Stock Valuation:', totalValuation]);
        rows.push([]);

        rows.push(['--- INVENTORY VALUATION BY FOOD CATEGORY ---']);
        rows.push(['Category', 'Monitored SKUs', 'Capital Valuation (INR)', 'Share (%)', 'Turnover Velocity', 'Buffer Health']);
        categoryValuationSummary.items.forEach((c) => {
          rows.push([`"${c.name}"`, c.items, c.value, `${c.share}%`, `"${c.velocity}"`, `"${c.bufferHealth}"`]);
        });
        rows.push([]);

        rows.push(['--- DAILY KITCHEN CONSUMPTION & SPOILAGE TRENDS ---']);
        rows.push(['Day', 'Consumption (INR)', 'Wastage (INR)', 'Fresh Purchases (INR)', 'Net Delta (INR)', 'Efficiency (%)']);
        dailyConsumptionTableData.list.forEach((r) => {
          rows.push([r.day, r.consumptionVal, r.wastageVal, r.purchaseVal, r.netDelta, `${r.efficiency}%`]);
        });
        rows.push([]);

        rows.push(['--- ACTIVE INGREDIENT INVENTORY LEDGER ---']);
        rows.push(['Ingredient Name', 'Category', 'Current Stock', 'Unit Cost', 'Asset Value (INR)', 'Min Reorder Threshold']);
        filteredIngredients.forEach((ing) => {
          rows.push([
            `"${ing.name}"`,
            `"${ing.category}"`,
            `"${ing.quantity} ${ing.unit}"`,
            ing.costPerUnit,
            ing.quantity * ing.costPerUnit,
            ing.minThreshold || 5,
          ]);
        });
      }

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        rows.map((e) => (Array.isArray(e) ? e.join(',') : e)).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `StockMate_Restaurant_Audit_Report_${currentTab}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast('Complete tabular audit report exported to CSV successfully.', 'success');
    } catch (err) {
      console.error('Export Error:', err);
      addToast('Failed to export CSV report.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & Audits"
        subtitle="Procurement verification, dock damage loss audits, fresh bread returns & inventory valuation in clear tabular views"
        breadcrumbs={[
          { label: 'Restaurant', href: '#/dashboard' },
          { label: 'Reports & Audits' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
              {['week', 'month', 'quarter'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase transition-all ${
                    timeframe === t
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={handleExportReport}
            >
              Export Tabular Report (CSV)
            </Button>
          </div>
        }
      />

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('procurement_audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            currentTab === 'procurement_audit'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Receipt className="w-4 h-4" /> Supplier Procurement & Return Audits
        </button>

        <button
          onClick={() => setActiveTab('inventory_analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            currentTab === 'inventory_analytics'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Kitchen Valuation & Spoilage Trends
        </button>

        {isOwner && (
          <button
            onClick={() => setActiveTab('staff_reports')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'staff_reports'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4" /> Staff Reports
          </button>
        )}
      </div>

      {currentTab === 'staff_reports' && isOwner ? (
        <StaffReports
          isEmbedded={true}
          externalTimeframe={timeframe}
          onTimeframeChange={setTimeframe}
        />
      ) : currentTab === 'procurement_audit' ? (
        <div className="space-y-6">
          {/* Executive Supplier Procurement KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Goods Purchased"
              value={formatINR(totalPurchased)}
              subtext="Gross billed PO total"
              icon={Receipt}
              accentColor="slate"
            />
            <StatCard
              title="Accepted into Stock"
              value={formatINR(totalAcceptedAmount)}
              subtext="GRN verified goods"
              icon={CheckCircle2}
              accentColor="emerald"
            />
            <StatCard
              title="Dock Damage Losses"
              value={formatINR(totalDamageLosses)}
              subtext="Rejected at loading bay"
              icon={AlertTriangle}
              accentColor="rose"
            />
            <StatCard
              title="Fresh Unsold Returns"
              value={formatINR(totalUnsoldReturns)}
              subtext="Pav / Dairy 24h SLA returns"
              icon={RotateCcw}
              accentColor="indigo"
            />
            <StatCard
              title="Outstanding Vendor Dues"
              value={formatINR(totalOutstandingDues)}
              subtext="Payable after deductions"
              icon={Clock}
              accentColor="amber"
            />
          </div>

          {/* Table 1: Goods Purchased vs Goods Accepted Breakdown Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4 text-emerald-800" />
                  <h3 className="font-bold text-slate-900 text-sm">Goods Purchased vs. Accepted Audit Table</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  PO invoiced amounts, dock verified physical stock, damage write-offs, and final net payable balances
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
                100% Stock Accuracy Policy
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">PO & GRN Ref</th>
                    <th className="py-3 px-4">Supplier Partner</th>
                    <th className="py-3 px-4 text-right">Billed Amount</th>
                    <th className="py-3 px-4 text-right">Accepted Stock</th>
                    <th className="py-3 px-4 text-right">Dock Damage Loss</th>
                    <th className="py-3 px-4 text-right">Net Payable</th>
                    <th className="py-3 px-4 text-center">Verification Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(supplierInvoices || []).map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{inv.poNumber}</div>
                        <div className="text-[11px] font-mono text-emerald-800">{inv.grnNumber}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{inv.supplierName}</div>
                        <div className="text-[11px] text-slate-400">Inv: {inv.invoiceNumber}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-800">
                        {formatINR(inv.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700">
                        {formatINR(inv.acceptedAmount || inv.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {inv.damageDeduction > 0 ? (
                          <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            -{formatINR(inv.damageDeduction)}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">₹0</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatINR(inv.netPayable)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> {inv.verificationStatus || 'Verified by Manager'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* Summary Table Footer */}
                <tfoot className="bg-slate-50/90 font-bold border-t border-slate-200 text-xs">
                  <tr>
                    <td colSpan={2} className="py-3 px-4 text-slate-900 font-extrabold uppercase text-[11px]">
                      Procurement Total ({supplierInvoices.length} Invoices)
                    </td>
                    <td className="py-3 px-4 text-right text-slate-900 font-bold">
                      {formatINR(totalPurchased)}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-700 font-extrabold">
                      {formatINR(totalAcceptedAmount)}
                    </td>
                    <td className="py-3 px-4 text-right text-rose-600 font-bold">
                      -{formatINR(totalDamageLosses)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-900 font-extrabold">
                      {formatINR(totalPurchased - totalDamageLosses)}
                    </td>
                    <td className="py-3 px-4 text-center text-emerald-800 text-[11px]">
                      100% Invoices Cleared
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Table 2: Dock Damage Loss Audit Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Dock Damage Loss Audit Table</h3>
                  <p className="text-xs text-slate-500">
                    Damaged and compromised items rejected at loading bay before stock acceptance
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 border border-rose-200 self-start sm:self-auto">
                Loss Protection Claimed
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Item & Specification</th>
                    <th className="py-3 px-4">Supplier & PO Ref</th>
                    <th className="py-3 px-4 text-center">Damaged Qty</th>
                    <th className="py-3 px-4">Defect Cause & Incident Note</th>
                    <th className="py-3 px-4 text-right">Unit Rate</th>
                    <th className="py-3 px-4 text-right">Write-Off Loss</th>
                    <th className="py-3 px-4 text-center">Settlement Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {damageReturns.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{item.productName}</div>
                        <div className="text-[11px] font-mono text-slate-400">{item.returnNumber}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{item.supplierName}</div>
                        <div className="text-[11px] text-slate-500">{item.poNumber} • {item.grnNumber}</div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">
                        {item.returnQty} {item.unit}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-rose-700 font-medium text-[11px] max-w-sm">
                          {item.reason}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 font-mono">
                        {formatINR(item.unitCost)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-rose-600">
                        -{formatINR(item.totalLossAmount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> {item.settlementType || 'Credit Note Claimed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50/90 font-bold border-t border-slate-200 text-xs">
                  <tr>
                    <td colSpan={5} className="py-3 px-4 text-slate-900 font-extrabold uppercase text-[11px]">
                      Total Loading Dock Damage Write-Offs ({damageReturns.length} Incidents)
                    </td>
                    <td className="py-3 px-4 text-right text-rose-600 font-extrabold">
                      -{formatINR(damageReturns.reduce((acc, d) => acc + (d.totalLossAmount || 0), 0))}
                    </td>
                    <td className="py-3 px-4 text-center text-emerald-700 text-[11px] font-bold">
                      100% Recovery Claimed
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Table 3: Unsold Fresh Bread & Dairy SLA Returns Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Unsold Fresh Bread & Dairy SLA Returns Table</h3>
                  <p className="text-xs text-slate-500">
                    Perishables returned under 24h & 36h contractual credit agreement clauses
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
                Guaranteed Freshness SLA
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Perishable Line / Product</th>
                    <th className="py-3 px-4">Supplier Partner</th>
                    <th className="py-3 px-4">Return SLA Clause</th>
                    <th className="py-3 px-4">Credit Ref (CRN)</th>
                    <th className="py-3 px-4 text-center">Returned Qty</th>
                    <th className="py-3 px-4 text-right">Credit Value</th>
                    <th className="py-3 px-4 text-center">Cutoff & Compliance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {freshSlaReturns.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{item.productName}</div>
                        <div className="text-[11px] text-slate-500">{item.reason}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{item.supplierName}</div>
                        <div className="text-[11px] text-slate-400">Date: {item.requestDate}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                          {item.slaAgreement}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                        {item.creditNoteId}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-900">
                        {item.returnQty > 0 ? `${item.returnQty} ${item.unit}` : <span className="text-slate-400">0 (100% used)</span>}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700">
                        {item.totalLossAmount > 0 ? formatINR(item.totalLossAmount) : <span className="text-slate-400 font-mono">₹0</span>}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> {item.complianceStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50/90 font-bold border-t border-slate-200 text-xs">
                  <tr>
                    <td colSpan={5} className="py-3 px-4 text-slate-900 font-extrabold uppercase text-[11px]">
                      Total Unsold Perishables SLA Credit Recovered
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-700 font-extrabold">
                      {formatINR(freshSlaReturns.reduce((acc, s) => acc + (s.totalLossAmount || 0), 0))}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-500 text-[11px]">
                      Within Monthly Allowance
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Table 4: QR Batch Movement Audit Log with Search & Pagination */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Batch Movements & Traceability Audit Log Table</h3>
                  <p className="text-xs text-slate-500">
                    Immutable event log with timestamps, user attribution, and physical action reasons
                  </p>
                </div>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter product, batch ID or user..."
                  value={batchSearchTerm}
                  onChange={(e) => setBatchSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Event Timestamp</th>
                    <th className="py-3 px-4">Product & Batch Code</th>
                    <th className="py-3 px-4 text-center">Movement Type</th>
                    <th className="py-3 px-4 text-right">Physical Quantity</th>
                    <th className="py-3 px-4">User Attribution</th>
                    <th className="py-3 px-4">Operational Purpose / Audit Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBatchMovements.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        No batch movements found matching "{batchSearchTerm}".
                      </td>
                    </tr>
                  ) : (
                    filteredBatchMovements.map((mov, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                          {mov.date}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{mov.productName}</div>
                          <div className="font-mono text-[10px] text-slate-400">{mov.batchId}</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              mov.type === 'received'
                                ? 'bg-emerald-100 text-emerald-800'
                                : mov.type === 'consumed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {mov.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {mov.quantity} {mov.unit}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {mov.by}
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-[11px]">
                          {mov.reason}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-slate-50/90 font-bold border-t border-slate-200 text-xs">
                  <tr>
                    <td colSpan={3} className="py-3 px-4 text-slate-900 uppercase text-[11px] font-extrabold">
                      Showing {filteredBatchMovements.length} Logged Traceability Events
                    </td>
                    <td colSpan={3} className="py-3 px-4 text-right text-slate-500 font-medium">
                      Audited under HACCP food safety standards
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Tab 2: Inventory Analytics & Spoilage Trends - Comprehensive Tabular Presentation */
        <div className="space-y-6">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Stock Valuation"
              value={formatINR(totalValuation)}
              change="+4.8%"
              trend="up"
              subtext="Active warehouse lot costs"
              icon={IndianRupee}
              accentColor="emerald"
            />

            <StatCard
              title="Monthly Kitchen Wastage"
              value={formatINR(estimatedWastageCost)}
              change={`${currentRestaurant?.metrics?.monthlyWastageRate || 3.2}% of stock`}
              trend="down"
              subtext="Target goal: < 4.0%"
              icon={TrendingDown}
              accentColor="amber"
            />

            <StatCard
              title="Active Ingredient Lots"
              value={restaurantIngredients.length}
              subtext="Monitored in inventory matrix"
              icon={Layers}
              accentColor="blue"
            />

            <StatCard
              title="Inventory Accuracy"
              value="99.4%"
              change="+0.8%"
              trend="up"
              subtext="Audit variance tolerance"
              icon={Sparkles}
              accentColor="purple"
            />
          </div>

          {/* Table 1: Inventory Valuation by Food Category Breakdown Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <PieIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Category Valuation & Capital Allocation Audit Table
                  </h3>
                  <p className="text-xs text-slate-500">
                    Distribution of restaurant working capital across primary ingredient groups
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
                Total Valuation: {formatINR(categoryValuationSummary.totalVal)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Food Category</th>
                    <th className="py-3 px-4 text-center">Monitored Items</th>
                    <th className="py-3 px-4 text-right">Capital Valuation</th>
                    <th className="py-3 px-4 text-right">Capital Share</th>
                    <th className="py-3 px-4">Consumption Turnover Velocity</th>
                    <th className="py-3 px-4">Safety Buffer Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categoryValuationSummary.items.map((cat, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="font-bold text-slate-900">{cat.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">
                        {cat.items} SKUs
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {formatINR(cat.value)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-800">
                        {cat.share}%
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {cat.velocity}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            cat.bufferHealth.includes('Critical')
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : cat.bufferHealth.includes('High')
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {cat.bufferHealth}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50/90 font-bold border-t border-slate-200 text-xs">
                  <tr>
                    <td className="py-3 px-4 text-slate-900 font-extrabold uppercase text-[11px]">
                      Total ({categoryValuationSummary.items.length} Food Categories)
                    </td>
                    <td className="py-3 px-4 text-center font-extrabold text-slate-900">
                      {categoryValuationSummary.totalItems} SKUs
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-800 font-mono">
                      {formatINR(categoryValuationSummary.totalVal)}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-800">
                      100.0%
                    </td>
                    <td colSpan={2} className="py-3 px-4 text-slate-500 font-normal text-[11px]">
                      Quarterly inventory turns normalized across prep lines
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Table 2: Daily Kitchen Consumption & Wastage Audit Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Daily Kitchen Consumption & Spoilage Variance Table
                  </h3>
                  <p className="text-xs text-slate-500">
                    Prep usage volume, trash wastage, and restocking inflows tracked by day
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 border border-blue-200 self-start sm:self-auto">
                Avg Efficiency: {dailyConsumptionTableData.avgEfficiency}%
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Day of Week</th>
                    <th className="py-3 px-4 text-right">Kitchen Prep Usage</th>
                    <th className="py-3 px-4 text-right">Kitchen Spoilage / Wastage</th>
                    <th className="py-3 px-4 text-right">Restock Deliveries</th>
                    <th className="py-3 px-4 text-right">Net Inventory Shift</th>
                    <th className="py-3 px-4 text-center">Prep Efficiency Index</th>
                    <th className="py-3 px-4 text-center">Operational Shift Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dailyConsumptionTableData.list.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {row.day === 'Mon' && 'Monday'}
                        {row.day === 'Tue' && 'Tuesday'}
                        {row.day === 'Wed' && 'Wednesday'}
                        {row.day === 'Thu' && 'Thursday'}
                        {row.day === 'Fri' && 'Friday (Peak Service)'}
                        {row.day === 'Sat' && 'Saturday (Weekend Rush)'}
                        {row.day === 'Sun' && 'Sunday (Family Service)'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {formatINR(row.consumptionVal)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                        {formatINR(row.wastageVal)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                        {row.purchaseVal > 0 ? formatINR(row.purchaseVal) : <span className="text-slate-400">₹0</span>}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-800">
                        {row.netDelta > 0 ? `+${formatINR(row.netDelta)}` : formatINR(row.netDelta)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            parseFloat(row.efficiency) >= 95
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" /> {row.efficiency}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[11px] text-slate-600 font-medium">
                          {row.day === 'Sat' || row.day === 'Fri' ? 'High Volume Surge' : 'Standard Prep Shift'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50/90 font-bold border-t border-slate-200 text-xs">
                  <tr>
                    <td className="py-3 px-4 text-slate-900 font-extrabold uppercase text-[11px]">
                      Weekly Kitchen Operational Totals
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900 font-mono">
                      {formatINR(dailyConsumptionTableData.totalConsumption)}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-rose-600 font-mono">
                      {formatINR(dailyConsumptionTableData.totalWastage)}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-700 font-mono">
                      {formatINR(dailyConsumptionTableData.totalPurchases)}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900 font-mono">
                      {formatINR(dailyConsumptionTableData.totalPurchases - dailyConsumptionTableData.totalConsumption)}
                    </td>
                    <td className="py-3 px-4 text-center text-emerald-800 font-extrabold">
                      {dailyConsumptionTableData.avgEfficiency}% Avg
                    </td>
                    <td className="py-3 px-4 text-center text-slate-500 font-normal text-[11px]">
                      SLA Target Met (&gt;95%)
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Table 3: Active Ingredients Inventory Valuation Ledger Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0">
                  <Boxes className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Stocked Ingredients Valuation & Storage Audit Table
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live itemized ledger of ingredients, quantities on hand, unit costs, and asset valuation
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Category Filter */}
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="all">All Categories</option>
                  {uniqueCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                {/* Search Bar */}
                <div className="relative w-48 sm:w-60">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search ingredient..."
                    value={ingredientSearchTerm}
                    onChange={(e) => setIngredientSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Ingredient Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-center">Stock Level</th>
                    <th className="py-3 px-4 text-right">Cost Per Unit</th>
                    <th className="py-3 px-4 text-right">Total Valuation</th>
                    <th className="py-3 px-4 text-center">Reorder Level</th>
                    <th className="py-3 px-4 text-center">Stock Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredIngredients.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                        No ingredients found matching the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredIngredients.map((item) => {
                      const itemVal = item.quantity * item.costPerUnit;
                      const isLow = item.quantity <= (item.minThreshold || 5);

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{item.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">SKU: {item.id}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                              {item.category || 'General'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-slate-900">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-700">
                            {formatINR(item.costPerUnit)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800">
                            {formatINR(itemVal)}
                          </td>
                          <td className="py-3 px-4 text-center text-slate-600 font-mono">
                            {item.minThreshold || 5} {item.unit}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                isLow
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {isLow ? 'Low Stock Warning' : 'Optimal Stock'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                <tfoot className="bg-slate-50/90 font-bold border-t border-slate-200 text-xs">
                  <tr>
                    <td colSpan={4} className="py-3 px-4 text-slate-900 font-extrabold uppercase text-[11px]">
                      Filtered Stock Total ({filteredIngredients.length} Items)
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-800 font-mono">
                      {formatINR(filteredIngredients.reduce((acc, i) => acc + (i.quantity * i.costPerUnit), 0))}
                    </td>
                    <td colSpan={2} className="py-3 px-4 text-center text-slate-500 font-normal text-[11px]">
                      Quarterly Audit Reconciled
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
