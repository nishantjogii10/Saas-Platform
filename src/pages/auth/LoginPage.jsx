import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getRoleLandingRoute } from '../../utils/permissions';
import {
  Boxes,
  Shield,
  Store,
  UserCheck,
  Truck,
  ChefHat,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  PackageCheck,
  Thermometer,
  Clock,
  Sparkles,
  Layers,
  Activity,
  Check,
  Utensils,
  ChevronRight,
  Info,
  Building2,
  FileText,
  TrendingUp
} from 'lucide-react';

// ============================================================================
// 6 DESIGNATED ROLES CONFIGURATION
// ============================================================================
export const ROLES_CONFIG = [
  {
    id: 'super_admin',
    authRole: 'super_admin',
    label: 'Super Admin',
    shortLabel: 'Super Admin',
    icon: Shield,
    defaultEmail: 'admin@stockmate.io',
    description: 'Platform governance, multi-tenant restaurant oversight, and tier plan review.',
    targetDashboard: '/admin/dashboard',
    spotlightBadge: 'Platform Governance Node',
    spotlightMetric: '48 Outlets • 100% Synced',
    spotlightDesc: 'Multi-tenant cloud architecture with global tenant isolation, commissary routing, and plan licensing.',
    accentColor: 'emerald',
  },
  {
    id: 'restaurant_owner',
    authRole: 'restaurant_owner',
    label: 'Restaurant Owner',
    shortLabel: 'Restaurant Owner',
    icon: Store,
    defaultEmail: 'rajesh@mangotree.com',
    description: 'Multi-branch operations, consolidated food-cost control, and subscription billing.',
    targetDashboard: '/dashboard',
    spotlightBadge: 'Executive Control Hub',
    spotlightMetric: '₹1,42,850 Stock Valuation',
    spotlightDesc: 'Consolidated profit margins (79.9%), multi-branch inventory transfers, and ledger accounting.',
    accentColor: 'emerald',
  },
  {
    id: 'restaurant_manager',
    authRole: 'restaurant_manager',
    label: 'Manager',
    shortLabel: 'Manager',
    icon: UserCheck,
    defaultEmail: 'vikram.mgr@spicegarden.com',
    description: 'Staff roster, station shift management, attendance, and branch station operations.',
    targetDashboard: '/workforce',
    spotlightBadge: 'Branch Operations Terminal',
    spotlightMetric: '14 Active Staff • 2 POS Stations',
    spotlightDesc: 'Station prep rosters, shift rotation, attendance verification, and floor stock buffers.',
    accentColor: 'teal',
  },
  {
    id: 'inventory_manager',
    authRole: 'inventory_manager',
    label: 'Inventory Manager',
    shortLabel: 'Inventory Manager',
    icon: Boxes,
    defaultEmail: 'amit.mgr@mangotree.com',
    description: 'Warehouse stock balance, Goods Received Notes (GRN), and automated FEFO expiry alerts.',
    targetDashboard: '/dashboard',
    spotlightBadge: 'Walk-In Warehouse Radar',
    spotlightMetric: '18 Active Batches • 100% GRN Match',
    spotlightDesc: 'First-Expired First-Out (FEFO) automated routing, cold-chain temperature telemetry, and safety buffers.',
    accentColor: 'emerald',
  },
  {
    id: 'kitchen_staff',
    authRole: 'kitchen_staff',
    label: 'Kitchen Staff',
    shortLabel: 'Kitchen Staff',
    icon: ChefHat,
    defaultEmail: 'anita.chef@spicegarden.com',
    description: 'Kitchen prep station terminal, recipe batch portions, stock usage, and waste reduction.',
    targetDashboard: '/kitchen',
    spotlightBadge: 'Kitchen Prep Line Terminal',
    spotlightMetric: '0.4% Spoilage • Prep Queue Active',
    spotlightDesc: 'Touchscreen batch deduction, burger recipe portion yields, and live prep line consumption logging.',
    accentColor: 'emerald',
  },
  {
    id: 'supplier',
    authRole: 'supplier',
    label: 'StockMate Supplier',
    shortLabel: 'StockMate Supplier',
    icon: Truck,
    defaultEmail: 'karan@goldencrustbakery.com',
    description: 'Direct restaurant procurement, fast-track dock receiving, PO orders, and invoice reconciliation.',
    targetDashboard: '/supplier',
    spotlightBadge: 'Direct Procurement Link',
    spotlightMetric: '12 Active POs • Direct Settlement',
    spotlightDesc: 'Direct-to-dock deliveries, instant GRN credit claims, and thermal label barcode generation.',
    accentColor: 'teal',
  },
];

// ============================================================================
// ROLE-SPECIFIC DYNAMIC INTERACTIVE VISUALIZATIONS
// Tailored datasets, central hub telemetry, and satellite nodes for each of the 6 roles
// ============================================================================
export const ROLE_VISUALIZATIONS = {
  super_admin: {
    spotlightBadge: 'Platform Governance Node',
    spotlightMetric: '48 Outlets • 100% Synced',
    spotlightDesc: 'Multi-tenant cloud architecture with global tenant isolation, commissary routing, and plan licensing.',
    hub: {
      eyebrow: 'StockMate Platform',
      title: 'Governance Node',
      subtitle: 'Global Orchestration',
      badge: 'Super Admin Core',
      icon: Shield,
    },
    nodes: [
      {
        id: 'sa-tenants',
        name: 'Multi-Tenant Restaurant Groups',
        shortName: 'Restaurant Tenants',
        category: 'Tenant Network',
        tag: '48 Outlets',
        condition: 'healthy',
        metricValue: '16 Brands',
        metricUnit: '48 Outlets Synced',
        icon: Store,
        x: 18,
        y: 22,
        details: {
          label1: 'Active Outlets',
          value1: '48 Synced Across 6 Cities',
          label2: 'Multi-Tenant Isolation',
          value2: 'Row-Level DB Security (SOC2)',
          label3: 'Active Commissaries',
          value3: '8 Central Kitchens Online',
          label4: 'Tenant Uptime',
          value4: '99.98% High Availability',
        },
      },
      {
        id: 'sa-subs',
        name: 'Subscription & Tier Plan Licensing',
        shortName: 'Tier Plans',
        category: 'Commercial Licensing',
        tag: 'Enterprise Tier',
        condition: 'healthy',
        metricValue: '100% Paid',
        metricUnit: '16 Subscriptions',
        icon: Layers,
        x: 82,
        y: 20,
        details: {
          label1: 'Enterprise Tier',
          value1: '9 Restaurant Groups',
          label2: 'Multi-Branch Pro',
          value2: '7 Restaurant Groups',
          label3: 'Trial Conversions',
          value3: '94.2% Past 30 Days',
          label4: 'License Status',
          value4: 'All Tenants In Good Standing',
        },
      },
      {
        id: 'sa-security',
        name: 'Platform Security & RBAC Enforcement',
        shortName: 'Platform Security',
        category: 'Zero-Trust Access',
        tag: 'Strict Isolation',
        condition: 'healthy',
        metricValue: '256-bit',
        metricUnit: 'End-to-End Encrypted',
        icon: ShieldCheck,
        x: 16,
        y: 72,
        details: {
          label1: 'Role Isolation',
          value1: '7 Verified RBAC Levels',
          label2: '2FA Enforcement',
          value2: 'Active for All Super Admins',
          label3: 'Live Sessions',
          value3: '184 Verified Active Tokens',
          label4: 'Audit Logging',
          value4: 'Immutable Cryptographic Stream',
        },
      },
      {
        id: 'sa-billing',
        name: 'Platform-wide Revenue & Billing Status',
        shortName: 'Platform Revenue',
        category: 'Consolidated Billing',
        tag: 'Ledger Synced',
        condition: 'healthy',
        metricValue: '₹42.8L',
        metricUnit: 'Platform Q3 ARR',
        icon: Activity,
        x: 84,
        y: 70,
        details: {
          label1: 'Monthly Platform Volume',
          value1: '₹7,24,000 / month',
          label2: 'Payment Gateway',
          value2: 'Stripe & Razorpay Synced',
          label3: 'Settlement Ratio',
          value3: '99.8% Automated Settlement',
          label4: 'Dispute Volume',
          value4: '0 Active Payment Disputes',
        },
      },
      {
        id: 'sa-operations',
        name: 'Central Platform Cluster Telemetry',
        shortName: 'System Health',
        category: 'Core Microservices',
        tag: 'Operational',
        condition: 'healthy',
        metricValue: '42ms',
        metricUnit: 'Global Latency',
        icon: Sparkles,
        x: 50,
        y: 88,
        details: {
          label1: 'Cluster Health',
          value1: '12 / 12 Pods Healthy',
          label2: 'Sync Engine',
          value2: 'Sub-second FEFO Telemetry',
          label3: 'Database Latency',
          value3: '1.2ms p99 Read / Write',
          label4: 'Disaster Recovery',
          value4: 'Multi-Region Replication Ready',
        },
      },
    ],
  },
  restaurant_owner: {
    spotlightBadge: 'Restaurant Operations Hub',
    spotlightMetric: '₹1,42,850 Stock Valuation',
    spotlightDesc: 'Consolidated profit margins (79.9%), multi-branch inventory transfers, and ledger accounting.',
    hub: {
      eyebrow: 'Executive Suite',
      title: 'Operations Hub',
      subtitle: 'Multi-Branch Ledger',
      badge: 'Owner Control',
      icon: Store,
    },
    nodes: [
      {
        id: 'ro-valuation',
        name: 'Consolidated Inventory Valuation',
        shortName: 'Stock Valuation',
        category: 'Asset Valuation',
        tag: 'All Branches',
        condition: 'healthy',
        metricValue: '₹1,42,850',
        metricUnit: 'Live Capital Assets',
        icon: Activity,
        x: 18,
        y: 22,
        details: {
          label1: 'Total Tracked SKUs',
          value1: '142 Active Line Items',
          label2: 'Valuation Method',
          value2: 'Weighted Average Cost (WAC)',
          label3: 'Capital Buffer',
          value3: '4.2 Days Working Reserve',
          label4: 'Variance vs Target',
          value4: '+1.8% Efficient Capital',
        },
      },
      {
        id: 'ro-branches',
        name: 'Multi-Branch Stock Balance',
        shortName: 'Branch Health',
        category: 'Outlet Telemetry',
        tag: '3 Outlets Synced',
        condition: 'healthy',
        metricValue: '98.2%',
        metricUnit: 'Par Fill Rate',
        icon: Building2,
        x: 82,
        y: 20,
        details: {
          label1: 'Pune Central (HQ)',
          value1: '₹82,400 (Optimal Par)',
          label2: 'Hinjawadi Cloud Hub',
          value2: '₹38,200 (Active Rush)',
          label3: 'Mumbai Bandra West',
          value3: '₹22,250 (100% Stocked)',
          label4: 'Network Health',
          value4: 'Zero Stockouts Reported',
        },
      },
      {
        id: 'ro-foodcost',
        name: 'Real-Time Food-Cost Percentage',
        shortName: 'Food Costing',
        category: 'Cost Control',
        tag: 'Target: 28%',
        condition: 'healthy',
        metricValue: '26.8%',
        metricUnit: 'Consolidated Margin',
        icon: TrendingUp,
        x: 16,
        y: 72,
        details: {
          label1: 'Gross Profit Margin',
          value1: '73.2% Across All Outlets',
          label2: 'Food Cost Target',
          value2: '28.0% (Current: 26.8%)',
          label3: 'Monthly Savings',
          value3: '₹18,400 via FEFO Enforcement',
          label4: 'Largest Cost Group',
          value4: 'Poultry & Dairy (42%)',
        },
      },
      {
        id: 'ro-transfers',
        name: 'Inter-Branch Stock Transfers',
        shortName: 'Stock Transfers',
        category: 'Commissary Logistics',
        tag: 'In Transit',
        condition: 'info',
        metricValue: '4 Transfers',
        metricUnit: 'Dispatched Today',
        icon: Truck,
        x: 84,
        y: 70,
        details: {
          label1: 'Active Dispatch #TR-108',
          value1: 'Commissary → Hinjawadi',
          label2: 'Cargo Manifest',
          value2: 'Marinated Cutlets & Buns',
          label3: 'Cold-Chain Telemetry',
          value3: '-1.8°C Monitored En Route',
          label4: 'Estimated Arrival',
          value4: '45 Mins (Driver: Mahesh S.)',
        },
      },
      {
        id: 'ro-expiry',
        name: 'Executive Expiry & Spoilage Monitor',
        shortName: 'Expiry Alerts',
        category: 'Waste Prevention',
        tag: 'FEFO Guard',
        condition: 'warning',
        metricValue: '0.4%',
        metricUnit: 'Spoilage Rate',
        icon: Clock,
        x: 50,
        y: 88,
        details: {
          label1: 'Expiring Within 24h',
          value1: '2 Batches (Cutlets, Cream)',
          label2: 'Kitchen Action',
          value2: 'Special Chef Dish Promoted',
          label3: 'Prevented Spoilage',
          value3: '₹14,200 Recovered This Month',
          label4: 'Loss Risk Level',
          value4: 'Protected by FEFO Workflows',
        },
      },
    ],
  },
  restaurant_manager: {
    spotlightBadge: 'Branch Operations Radar',
    spotlightMetric: '14 Active Staff • 2 POS Stations',
    spotlightDesc: 'Station prep rosters, shift rotation, attendance verification, and floor stock buffers.',
    hub: {
      eyebrow: 'Branch Terminal',
      title: 'Branch Radar',
      subtitle: 'Pune Central Kitchen',
      badge: 'Manager Station',
      icon: Building2,
    },
    nodes: [
      {
        id: 'rm-stock',
        name: 'Branch Walk-In & Floor Stock Status',
        shortName: 'Branch Stock',
        category: 'Floor Inventory',
        tag: 'Pune Central',
        condition: 'healthy',
        metricValue: '₹82,400',
        metricUnit: 'Floor Valuation',
        icon: Boxes,
        x: 18,
        y: 22,
        details: {
          label1: 'Branch Location',
          value1: 'Pune Central (HQ & Commissary)',
          label2: 'Active SKUs on Floor',
          value2: '88 Verified Ingredients',
          label3: 'Par Level Compliance',
          value3: '96% Stock Level Adequate',
          label4: 'Working Stock Days',
          value4: '2.5 Days Safe Operating Buffer',
        },
      },
      {
        id: 'rm-dock',
        name: "Today's Receiving Dock & Inbound Shipments",
        shortName: "Today's Receiving",
        category: 'Inbound Logistics',
        tag: '3 POs Received',
        condition: 'healthy',
        metricValue: '100%',
        metricUnit: 'Dock GRN Match',
        icon: PackageCheck,
        x: 82,
        y: 20,
        details: {
          label1: 'Latest Delivery Note',
          value1: 'GRN-2026-1048 (Golden Crust)',
          label2: 'Checked Quantities',
          value2: '48 Buns & 14kg Dairy',
          label3: 'Damage / Spoilage',
          value3: '0 Items Rejected at Dock',
          label4: 'Ledger Processing',
          value4: 'Instantly Matched to PO-1048',
        },
      },
      {
        id: 'rm-shortages',
        name: 'Low-Stock Ingredient Shortage Warnings',
        shortName: 'Low-Stock Alerts',
        category: 'Par Warning',
        tag: 'Restock Required',
        condition: 'critical',
        metricValue: '2 Items',
        metricUnit: 'Below Par Limit',
        icon: AlertCircle,
        x: 16,
        y: 72,
        details: {
          label1: 'Aged Cheddar Cheese',
          value1: '4.2 kg (Branch Par: 8.0 kg)',
          label2: 'Cooking Heavy Cream',
          value2: '3.0 L (Branch Par: 6.0 L)',
          label3: 'Auto-Order Generated',
          value3: 'Draft PO Sent to Supplier',
          label4: 'Rush Service Impact',
          value4: 'Buffered for Next 4 Hours',
        },
      },
      {
        id: 'rm-pos',
        name: 'Pending Purchase Orders & Dispatches',
        shortName: 'Pending POs',
        category: 'Procurement Tracking',
        tag: '2 POs Pending',
        condition: 'warning',
        metricValue: '₹24,800',
        metricUnit: 'En Route to Dock',
        icon: Clock,
        x: 84,
        y: 70,
        details: {
          label1: 'Order #PO-1052',
          value1: 'Prime Poultry Cold-Chain Bay',
          label2: 'Order #PO-1053',
          value2: 'FreshLeaf Hydroponic Greens',
          label3: 'Estimated Docking',
          value3: '17:30 IST (Dock Bay #1)',
          label4: 'Quality Inspection',
          value4: 'Digital Thermometer Required',
        },
      },
      {
        id: 'rm-shift',
        name: 'Branch Roster & Kitchen Terminal Shift',
        shortName: 'Shift Operations',
        category: 'Workforce Status',
        tag: 'Prep Shift Active',
        condition: 'healthy',
        metricValue: '14 Staff',
        metricUnit: '2 POS Live',
        icon: UserCheck,
        x: 50,
        y: 88,
        details: {
          label1: 'Active Prep Roster',
          value1: '14 Kitchen & Floor Staff',
          label2: 'Touch Terminals',
          value2: 'Grill Station & Cold Assembly',
          label3: 'Attendance Check',
          value3: '100% Shift Attendance Verified',
          label4: 'Station Readiness',
          value4: 'Calibrated for Evening Rush',
        },
      },
    ],
  },
  inventory_manager: {
    spotlightBadge: 'Walk-In Radar',
    spotlightMetric: '18 Active Batches • 100% GRN Match',
    spotlightDesc: 'First-Expired First-Out (FEFO) automated routing, cold-chain temperature telemetry, and safety buffers.',
    hub: {
      eyebrow: 'StockMate Core',
      title: 'Walk-In Radar',
      subtitle: 'FEFO Live Engine',
      badge: 'Inventory View',
      icon: Boxes,
    },
    nodes: [
      {
        id: 'im-chicken',
        name: 'Prime Grilled Chicken Cutlets',
        shortName: 'Prime Chicken',
        category: 'Poultry / Cold-Chain',
        tag: 'FEFO Priority',
        condition: 'warning',
        metricValue: '14.2 kg',
        metricUnit: '-1.2°C Chiller',
        image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&auto=format&fit=crop&q=80',
        x: 18,
        y: 22,
        details: {
          label1: 'Batch LOT Number',
          value1: 'LOT-CHK-550',
          label2: 'Expiry Status',
          value2: '18h Left (Prioritize Tonight)',
          label3: 'Storage Location',
          value3: 'Walk-In Chiller #1 (Shelf 2B)',
          label4: 'Supplier & Origin',
          value4: 'Prime Poultry Cold Chain (#V-120)',
        },
      },
      {
        id: 'im-greens',
        name: 'Hydroponic Greens & Fresh Basil',
        shortName: 'Fresh Greens',
        category: 'Crisper Bay #2',
        tag: 'Optimal Stock',
        condition: 'healthy',
        metricValue: '8.4 kg',
        metricUnit: '4.1°C Crisper',
        image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400&auto=format&fit=crop&q=80',
        x: 82,
        y: 20,
        details: {
          label1: 'Batch LOT Number',
          value1: 'LOT-LET-410',
          label2: 'Expiry Status',
          value2: '3 Days Safe Operating Buffer',
          label3: 'Storage Location',
          value3: 'Crisper Unit A (Bin 4)',
          label4: 'Supplier & Origin',
          value4: 'GreenLeaf Hydroponics (#V-108)',
        },
      },
      {
        id: 'im-cheese',
        name: 'Aged Swiss & Cheddar Cheese',
        shortName: 'Aged Cheese',
        category: 'Dairy Walk-In',
        tag: 'Low Stock Alert',
        condition: 'critical',
        metricValue: '4.2 kg',
        metricUnit: '2.4°C Dairy Bay',
        image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&auto=format&fit=crop&q=80',
        x: 16,
        y: 72,
        details: {
          label1: 'Batch LOT Number',
          value1: 'LOT-CHS-740',
          label2: 'Expiry Status',
          value2: '8 Days Left (Sound Freshness)',
          label3: 'Storage Location',
          value3: 'Dairy Bay (Chiller Shelf 1)',
          label4: 'Supplier & Origin',
          value4: 'Dairy Direct Logistics (#V-105)',
        },
      },
      {
        id: 'im-buns',
        name: 'Artisan Brioche Burger Buns',
        shortName: 'Brioche Buns',
        category: 'Bakery Dry Stores',
        tag: 'Fresh Daily',
        condition: 'healthy',
        metricValue: '48 pcs',
        metricUnit: '21.0°C Dry Shelf',
        image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&auto=format&fit=crop&q=80',
        x: 84,
        y: 70,
        details: {
          label1: 'Batch LOT Number',
          value1: 'LOT-BUN-104',
          label2: 'Expiry Status',
          value2: '4 Days (Daily Baked Fresh)',
          label3: 'Storage Location',
          value3: 'Bakery Dry Storage (Rack A)',
          label4: 'Supplier & Origin',
          value4: 'Golden Crust Artisan Bakery (#V-101)',
        },
      },
      {
        id: 'im-grn',
        name: 'Receiving Dock Barcode GRN Scan',
        shortName: 'Dock GRN Verified',
        category: 'Receiving Bay Scan',
        tag: '100% Matched',
        condition: 'healthy',
        metricValue: '100%',
        metricUnit: 'Verified Clean',
        icon: PackageCheck,
        x: 50,
        y: 88,
        details: {
          label1: 'GRN Audit Lot',
          value1: 'GRN-2026-1048',
          label2: 'Purchase Order Match',
          value2: 'PO-1048 Cleared with Zero Discrepancy',
          label3: 'Receiving Dock Bay',
          value3: 'Dock Receiving Bay #1',
          label4: 'Supplier Ledger Note',
          value4: 'Golden Crust & Dairy Direct',
        },
      },
    ],
  },
  kitchen_staff: {
    spotlightBadge: 'Kitchen Stock Radar',
    spotlightMetric: '0.4% Spoilage • Prep Queue Active',
    spotlightDesc: 'Touchscreen batch deduction, burger recipe portion yields, and live prep line consumption logging.',
    hub: {
      eyebrow: 'Kitchen Terminal',
      title: 'Kitchen Stock Radar',
      subtitle: 'Prep Line Queue',
      badge: 'Chef Station',
      icon: ChefHat,
    },
    nodes: [
      {
        id: 'ks-patty',
        name: 'Prime Ground Beef & Chicken Patties',
        shortName: 'Burger Patties',
        category: 'Grill Prep Line',
        tag: 'Portions Ready',
        condition: 'healthy',
        metricValue: '36 Patties',
        metricUnit: 'Prepped & Weighed',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80',
        x: 18,
        y: 22,
        details: {
          label1: 'Recipe Requirement',
          value1: 'Classic Smash Burger (150g portion)',
          label2: 'Available Prep Stock',
          value2: '36 Portions Ready in Cold Drawer',
          label3: 'Expected Service Need',
          value3: '30 Portions for Evening Service',
          label4: 'Prep Station Line',
          value4: 'Grill Station #1 (Chef Anita)',
        },
      },
      {
        id: 'ks-buns',
        name: 'Artisan Brioche Toasting Station',
        shortName: 'Brioche Buns',
        category: 'Toaster Line',
        tag: 'Fresh Toast Line',
        condition: 'healthy',
        metricValue: '48 Buns',
        metricUnit: 'Prepped on Line',
        image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&auto=format&fit=crop&q=80',
        x: 82,
        y: 20,
        details: {
          label1: 'Recipe Requirement',
          value1: 'Brioche Bun + Garlic Butter Glaze',
          label2: 'Available Prep Stock',
          value2: '48 Fresh Buns Staged at Counter',
          label3: 'Consumption Velocity',
          value3: '12 Buns / Hour Peak Pace',
          label4: 'Holding Conditions',
          value4: 'Room Temp Ambient Bread Bin',
        },
      },
      {
        id: 'ks-cheese',
        name: 'Sharp Cheddar Slices Prep Tray',
        shortName: 'Cheese Slices',
        category: 'Burger Melt Station',
        tag: 'Low Prep Buffer',
        condition: 'warning',
        metricValue: '14 Slices',
        metricUnit: 'Pull from Bay',
        image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&auto=format&fit=crop&q=80',
        x: 16,
        y: 72,
        details: {
          label1: 'Recipe Requirement',
          value1: '2 Slices per Double Melt Burger',
          label2: 'Available Prep Stock',
          value2: '14 Slices Remaining on Line',
          label3: 'Prep Line Warning',
          value3: 'Restock Needed before 19:00 Rush',
          label4: 'Restock Source',
          value4: 'Pull Block LOT-CHS-740 from Chiller',
        },
      },
      {
        id: 'ks-greens',
        name: 'Hydroponic Crisp Lettuce & Herbs',
        shortName: 'Garnish & Greens',
        category: 'Cold Prep Assembly',
        tag: 'Washed & Prepped',
        condition: 'healthy',
        metricValue: '24 Portions',
        metricUnit: 'Chilled at 3.8°C',
        image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400&auto=format&fit=crop&q=80',
        x: 84,
        y: 70,
        details: {
          label1: 'Recipe Requirement',
          value1: '30g Crisp Green per Gourmet Burger',
          label2: 'Available Prep Stock',
          value2: '24 Pre-portioned Bags in Chiller',
          label3: 'Freshness Indicator',
          value3: 'Crisp & Washed (LOT-LET-410)',
          label4: 'Assembly Line',
          value4: 'Cold Garnish Station #2',
        },
      },
      {
        id: 'ks-waste',
        name: 'Kitchen Spoilage & Trimming Logger',
        shortName: 'Waste Reduction',
        category: 'Touch Terminal Log',
        tag: '0.4% Low Spoilage',
        condition: 'healthy',
        metricValue: '1-Tap',
        metricUnit: 'Batch Deduction',
        icon: CheckCircle2,
        x: 50,
        y: 88,
        details: {
          label1: 'Today Logged Waste',
          value1: '0.12 kg Trimmings Recorded',
          label2: 'Shift Waste Ratio',
          value2: '0.4% (Well Under 1.5% Par Limit)',
          label3: 'Recipe Deduction',
          value3: 'Auto-Deducted from Master Inventory',
          label4: 'Shift Supervisor',
          value4: 'Chef Anita Rao (Station PIN: 4421)',
        },
      },
    ],
  },
  supplier: {
    spotlightBadge: 'Supplier Dispatch Radar',
    spotlightMetric: '12 Active POs • Direct Settlement',
    spotlightDesc: 'Direct-to-dock deliveries, instant GRN credit claims, and thermal label barcode generation.',
    hub: {
      eyebrow: 'Procurement Hub',
      title: 'Supplier Dispatch Radar',
      subtitle: 'Direct Vendor Link',
      badge: 'Supplier Portal',
      icon: Truck,
    },
    nodes: [
      {
        id: 'sup-incoming',
        name: 'Incoming Restaurant Purchase Orders',
        shortName: 'Incoming POs',
        category: 'Procurement Orders',
        tag: '4 New Orders',
        condition: 'healthy',
        metricValue: '4 POs',
        metricUnit: '₹48,200 Total',
        icon: PackageCheck,
        x: 18,
        y: 22,
        details: {
          label1: 'Latest PO Inbound',
          value1: 'PO-2026-1055 (Mango Tree Kitchen)',
          label2: 'Requested Line Items',
          value2: '80kg Artisan Flour, 120 Brioche Buns',
          label3: 'Delivery Deadline',
          value3: 'Tomorrow 08:30 IST (Morning Dock)',
          label4: 'Commercial Terms',
          value4: 'StockMate Contract Rate (#V-101)',
        },
      },
      {
        id: 'sup-confirm',
        name: 'Orders Awaiting Supplier Confirmation',
        shortName: 'Awaiting Confirm',
        category: 'Commercial Review',
        tag: 'Action Required',
        condition: 'warning',
        metricValue: '2 POs',
        metricUnit: 'Awaiting Approval',
        icon: Clock,
        x: 82,
        y: 20,
        details: {
          label1: 'PO-1053 Pending Action',
          value1: 'Spice Garden (Pune Central HQ)',
          label2: 'Stock Availability Check',
          value2: 'LOT-BUN-109 Baked & Available',
          label3: 'Contract Price Lock',
          value3: '₹42 / kg (Standard Agreement)',
          label4: 'Confirmation Timer',
          value4: 'Expires in 3h 15m',
        },
      },
      {
        id: 'sup-dispatch',
        name: 'Active Fleet Dispatch Tracking',
        shortName: 'Dispatch Status',
        category: 'Fleet Logistics',
        tag: 'En Route',
        condition: 'info',
        metricValue: 'Van #MH-12',
        metricUnit: 'Out for Delivery',
        icon: Truck,
        x: 16,
        y: 72,
        details: {
          label1: 'Dispatched Delivery Vehicle',
          value1: 'Van MH-12-CQ-9921',
          label2: 'Assigned Driver',
          value2: 'Mahesh Sawant (+91 98221 44551)',
          label3: 'Consignment Cargo',
          value3: 'Bakery Batch (LOT-BUN-104)',
          label4: 'Target Delivery Dock',
          value4: 'Hinjawadi IT Hub Dock #1',
        },
      },
      {
        id: 'sup-schedules',
        name: 'Scheduled Dock Drop Windows',
        shortName: 'Delivery Windows',
        category: 'Dock Scheduling',
        tag: '3 Drops Today',
        condition: 'healthy',
        metricValue: 'Slot #2',
        metricUnit: '16:30 - 17:30 IST',
        icon: Layers,
        x: 84,
        y: 70,
        details: {
          label1: 'Today Dock Slot #2',
          value1: '16:30 - 17:30 IST (Dock Bay 2)',
          label2: 'Destination Branch',
          value2: 'Mango Tree Kitchen (Lower Parel)',
          label3: 'Barcode Labeling',
          value3: 'StockMate Standard Thermal QR',
          label4: 'Offloading Crew',
          value4: 'Receiving Dock Team Ready',
        },
      },
      {
        id: 'sup-grn',
        name: 'Digital GRN Verification & Settlement',
        shortName: 'GRN Settlement',
        category: 'Invoice Clearance',
        tag: '100% Cleared',
        condition: 'healthy',
        metricValue: '₹94,500',
        metricUnit: 'Settled Credit',
        icon: ShieldCheck,
        x: 50,
        y: 88,
        details: {
          label1: 'Reconciled Delivery Note',
          value1: 'GRN-2026-1048 (100% Matched)',
          label2: 'Damage Deductions',
          value2: '₹0 Disputed (All Items Accepted)',
          label3: 'Settlement Terms',
          value3: 'Direct Ledger Credit (Net 15 Days)',
          label4: 'Supplier Rating',
          value4: '99.4% On-Time Fulfillment Score',
        },
      },
    ],
  },
};

// Backwards compatibility alias
export const INVENTORY_ECOSYSTEM_NODES = ROLE_VISUALIZATIONS.inventory_manager.nodes;

// Fallback culinary image component
const CulinaryImage = ({ src, alt, className = '', fallbackIcon: FallbackIcon = Utensils }) => {
  const [hasError, setHasError] = useState(false);
  if (hasError || !src) {
    return (
      <div className={`flex items-center justify-center bg-slate-900 border border-emerald-500/20 text-emerald-400 ${className}`}>
        <FallbackIcon className="w-5 h-5 opacity-80" />
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setHasError(true)} className={`object-cover ${className}`} />;
};

export const LoginPage = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectDestination = location.state?.from;

  // Selected Role State
  const [selectedRole, setSelectedRole] = useState(() => {
    const searchParams = new URLSearchParams(location.search);
    const queryRole = searchParams.get('role');
    if (queryRole && ROLES_CONFIG.some((r) => r.id === queryRole)) {
      return queryRole;
    }
    if (location.state?.role && ROLES_CONFIG.some((r) => r.id === location.state.role)) {
      return location.state.role;
    }
    if (location.state?.from && location.state.from.startsWith('/supplier')) {
      return 'supplier';
    }
    if (location.state?.from && location.state.from.startsWith('/kitchen')) {
      return 'kitchen_staff';
    }
    if (location.state?.from && location.state.from.startsWith('/admin')) {
      return 'super_admin';
    }
    return 'restaurant_owner';
  });

  // Active role configuration object
  const currentRoleConfig = useMemo(() => {
    return ROLES_CONFIG.find((r) => r.id === selectedRole) || ROLES_CONFIG[1];
  }, [selectedRole]);

  // Form states
  const [email, setEmail] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('stockmate_remembered_email');
      if (saved) return saved;
    }
    return '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});
  const [authError, setAuthError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 2FA state
  const [twoFactorPending, setTwoFactorPending] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorError, setTwoFactorError] = useState(null);

  // Active role visualization dataset
  const currentVisual = useMemo(() => {
    return ROLE_VISUALIZATIONS[selectedRole] || ROLE_VISUALIZATIONS.restaurant_owner;
  }, [selectedRole]);

  // Selected Node State within current role (stores node id)
  const [selectedNodeId, setSelectedNodeId] = useState(() => {
    const visual = ROLE_VISUALIZATIONS[selectedRole] || ROLE_VISUALIZATIONS.restaurant_owner;
    return visual.nodes[0]?.id || 'node-1';
  });

  // When selectedRole changes, reset active node to first node of new role
  useEffect(() => {
    const visual = ROLE_VISUALIZATIONS[selectedRole] || ROLE_VISUALIZATIONS.restaurant_owner;
    if (visual && visual.nodes.length > 0) {
      setSelectedNodeId(visual.nodes[0].id);
    }
  }, [selectedRole]);

  const activeNode = useMemo(() => {
    return currentVisual.nodes.find((n) => n.id === selectedNodeId) || currentVisual.nodes[0];
  }, [currentVisual, selectedNodeId]);

  const [hoveredNodeId, setHoveredNodeId] = useState(null);

  // Policy Modal state
  const [policyModal, setPolicyModal] = useState(null); // 'terms' | 'privacy' | null

  // Route directly to the authenticated role's target dashboard
  const routeToUserDashboard = (role) => {
    const targetDashboard = getRoleLandingRoute(role);

    if (
      role === 'restaurant_manager' ||
      role === 'kitchen_staff' ||
      role === 'inventory_manager' ||
      role === 'supplier' ||
      !redirectDestination ||
      redirectDestination === '/notifications' ||
      redirectDestination === '/dashboard' ||
      redirectDestination === '/login' ||
      redirectDestination === '/'
    ) {
      navigate(targetDashboard, { replace: true });
      return;
    }

    navigate(redirectDestination, { replace: true });
  };

  const validateForm = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Work email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;
    setAuthError(null);

    if (!validateForm()) return;

    if (rememberMe) {
      try {
        localStorage.setItem('stockmate_remembered_email', email.trim());
      } catch (err) {}
    } else {
      try {
        localStorage.removeItem('stockmate_remembered_email');
      } catch (err) {}
    }

    setIsLoading(true);

    setTimeout(() => {
      // Authenticate using the selected role's authRole
      const backendRequestedRole = currentRoleConfig.authRole;
      const result = login(email, password, backendRequestedRole, null, 'unified_auth_portal');
      setIsLoading(false);

      if (!result.success) {
        if (result.require2FA) {
          setTwoFactorPending(result.tempUser);
        } else {
          setAuthError(result);
        }
      } else {
        if (result.user?.mustChangePassword) {
          navigate('/set-new-password');
        } else {
          routeToUserDashboard(result.user.role);
        }
      }
    }, 320);
  };

  const handleTwoFactorSubmit = (e) => {
    if (e) e.preventDefault();
    if (!twoFactorCode.trim()) {
      setTwoFactorError('Please enter your 6-digit verification code.');
      return;
    }
    setIsLoading(true);
    setTwoFactorError(null);

    setTimeout(() => {
      const backendRequestedRole = currentRoleConfig.authRole;
      const result = login(email, password, backendRequestedRole, twoFactorCode, 'unified_auth_portal');
      setIsLoading(false);

      if (!result.success) {
        setTwoFactorError(result.error || 'Invalid authentication code. Please check and try again.');
      } else {
        if (result.user?.mustChangePassword) {
          navigate('/set-new-password');
        } else {
          routeToUserDashboard(result.user.role);
        }
      }
    }, 320);
  };

  // Quick autofill for demo / tester evaluation
  const handleQuickAutofill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setFieldErrors({});
    setAuthError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 relative flex items-center justify-center p-3 sm:p-5 lg:p-8 overflow-x-hidden">
      {/* Ambient Landing-Page Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-64 right-10 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[600px] h-[600px] bg-indigo-500/8 rounded-full blur-[150px] pointer-events-none" />

      {/* 🌟 LARGE SPLIT-SCREEN OUTER FRAME 🌟 */}
      <div className="relative w-full max-w-6xl rounded-[28px] sm:rounded-[36px] bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950/95 border border-white/15 shadow-2xl shadow-slate-950/80 p-2 sm:p-3 overflow-hidden backdrop-blur-2xl">
        
        {/* Split Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 rounded-[24px] sm:rounded-[30px] border border-white/10 overflow-hidden">

          {/* ================================================================ */}
          {/* 🌟 LEFT PANEL (lg:col-span-5): UNIFIED MULTI-ROLE LOGIN FORM 🌟 */}
          {/* ================================================================ */}
          <div className="lg:col-span-5 bg-slate-900/95 p-5 sm:p-7 lg:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 relative z-20 backdrop-blur-2xl">
            <div>
              {/* Header: Brand Mark & Home Navigation */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <Link to="/" className="flex items-center gap-2.5 group">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
                    <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                      <Boxes className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-black tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                      StockMate
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono -mt-0.5">
                      SaaS Platform
                    </span>
                  </div>
                </Link>

                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-emerald-400 transition-colors bg-slate-950/80 hover:bg-slate-800 px-2.5 py-1 rounded-xl border border-white/10 shadow-xs"
                  title="Return to Landing Page"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Home</span>
                </Link>
              </div>

              {/* Title & Subtext */}
              <div className="mb-5">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Welcome to StockMate
                </h1>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Sign in to access your authorized workspace and live inventory operations.
                </p>
              </div>

              {/* 2FA Sub-screen (when enforced) */}
              {twoFactorPending ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs shadow-inner">
                    <div className="flex items-center gap-2 mb-1.5 font-bold text-white text-sm">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <span>Two-Factor Authentication Enforced</span>
                    </div>
                    <p className="text-slate-300">
                      User: <strong className="text-white">{twoFactorPending.name}</strong> ({twoFactorPending.email})
                    </p>
                    <p className="text-slate-400 mt-1">
                      Enter the 6-digit verification code from your authenticator app to access your workspace.
                    </p>
                  </div>

                  {twoFactorError && (
                    <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{twoFactorError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider font-mono">
                      6-Digit Authenticator Code
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      value={twoFactorCode}
                      onChange={(e) => {
                        setTwoFactorCode(e.target.value);
                        if (twoFactorError) setTwoFactorError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleTwoFactorSubmit(e);
                      }}
                      placeholder="000 000"
                      className="w-full text-center font-mono tracking-widest text-lg font-bold px-3 py-2.5 bg-slate-950/80 border border-white/15 rounded-xl text-white placeholder-slate-600 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      autoFocus
                    />
                  </div>

                  <div className="flex flex-col gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleTwoFactorSubmit}
                      disabled={isLoading}
                      className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <span>Verify &amp; Continue</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTwoFactorPending(null);
                        setTwoFactorCode('');
                        setTwoFactorError(null);
                      }}
                      className="w-full py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                    >
                      Cancel &amp; Return
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* 🌟 6-ROLE SELECTION CONTROLLER 🌟 */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                        Select Authorized Workspace / Role
                      </label>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                        {currentRoleConfig.shortLabel}
                      </span>
                    </div>

                    {/* Compact 6-Role Balanced Grid (2x3 on mobile/lg, 3x2 on sm/xl) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-1.5">
                      {ROLES_CONFIG.map((roleOpt) => {
                        const isSelected = selectedRole === roleOpt.id;
                        const Icon = roleOpt.icon;

                        return (
                          <button
                            key={roleOpt.id}
                            type="button"
                            onClick={() => {
                              setSelectedRole(roleOpt.id);
                              setAuthError(null);
                            }}
                            title={roleOpt.label}
                            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 text-left border ${
                              isSelected
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/70 shadow-xs shadow-emerald-500/20 ring-1 ring-emerald-400/40'
                                : 'bg-slate-950/60 text-slate-400 border-white/10 hover:text-slate-200 hover:border-white/20 hover:bg-slate-900/80'
                            }`}
                          >
                            <Icon
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isSelected ? 'text-emerald-400' : 'text-slate-500'
                              }`}
                            />
                            <span className="truncate">{roleOpt.shortLabel}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Role Description & Demo Quick-Fill Bar */}
                    <div className="mt-2.5 p-2.5 rounded-xl bg-slate-950/70 border border-white/10 flex flex-col gap-1.5">
                      <div className="flex items-start gap-1.5 text-[11px] text-slate-300 leading-snug">
                        <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{currentRoleConfig.description}</span>
                      </div>

                      {/* 1-Click Demo Fill for Convenience */}
                      <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
                        <span className="text-slate-400">Test Account:</span>
                        <button
                          type="button"
                          onClick={() => handleQuickAutofill(currentRoleConfig.defaultEmail)}
                          className="font-mono text-emerald-400 hover:text-emerald-300 underline font-semibold transition-colors"
                          title="Click to autofill sample credentials"
                        >
                          Fill {currentRoleConfig.defaultEmail} &rarr;
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Authentication Error Banner */}
                  {authError && (
                    <div className="p-3.5 rounded-2xl mb-4 bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-start gap-2.5 shadow-md animate-fadeIn">
                      <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <strong className="block text-white font-bold">
                          {authError.code === 'ROLE_MISMATCH'
                            ? 'Role Verification Failed'
                            : 'Authentication Error'}
                        </strong>
                        <span className="opacity-90 block mt-0.5 leading-relaxed">
                          {authError.error || authError.message}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 🌟 LOGIN FORM 🌟 */}
                  <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                    {/* Work Email Field */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider font-mono">
                        Work Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="email"
                          value={email}
                          disabled={isLoading}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null });
                          }}
                          placeholder={currentRoleConfig.defaultEmail}
                          className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-950/80 border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 transition-all ${
                            fieldErrors.email
                              ? 'border-rose-500'
                              : 'border-white/10 focus:border-emerald-500'
                          }`}
                          required
                        />
                      </div>
                      {fieldErrors.email && (
                        <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {fieldErrors.email}
                        </p>
                      )}
                    </div>

                    {/* Password Field */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                          Password
                        </label>
                        <Link
                          to="/forgot-password"
                          className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          disabled={isLoading}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: null });
                          }}
                          placeholder="Enter your account password"
                          className={`w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 transition-all ${
                            fieldErrors.password
                              ? 'border-rose-500'
                              : 'border-white/10 focus:border-emerald-500'
                          }`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                          tabIndex={-1}
                          title={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {fieldErrors.password && (
                        <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {fieldErrors.password}
                        </p>
                      )}
                    </div>

                    {/* Remember Me Checkbox */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <input
                        id="remember-me-checkbox"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded bg-slate-950 border-white/20 text-emerald-500 focus:ring-emerald-500/30 focus:ring-offset-0 cursor-pointer"
                      />
                      <label htmlFor="remember-me-checkbox" className="text-xs text-slate-400 select-none cursor-pointer">
                        Remember this workstation
                      </label>
                    </div>

                    {/* Primary Button: "Continue as [Role]" */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/40 active:scale-[0.99] flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Verifying {currentRoleConfig.label}...</span>
                        </div>
                      ) : (
                        <>
                          <span>Continue as {currentRoleConfig.label}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Bottom Footer Actions & Policy Links */}
            <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-slate-400 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span>New restaurant owner?</span>
                <Link to="/signup" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                  Register &amp; Start Free Trial &rarr;
                </Link>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span>Wholesale supplier?</span>
                <Link to="/supplier-portal" className="font-bold text-teal-400 hover:text-teal-300 transition-colors">
                  Supplier Portal Access &rarr;
                </Link>
              </div>

              <div className="pt-2 flex items-center justify-center gap-4 text-[10px] text-slate-500">
                <button
                  type="button"
                  onClick={() => setPolicyModal('terms')}
                  className="hover:text-slate-300 underline transition-colors"
                >
                  Terms of Service
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setPolicyModal('privacy')}
                  className="hover:text-slate-300 underline transition-colors"
                >
                  Privacy Policy
                </button>
                <span>•</span>
                <span>StockMate SaaS v2.5</span>
              </div>
            </div>
          </div>

          {/* =========================================================================== */}
          {/* 🌟 RIGHT PANEL (lg:col-span-7): ROLE-SPECIFIC INTERACTIVE VISUALIZATION 🌟 */}
          {/* =========================================================================== */}
          <div
            key={selectedRole}
            className="lg:col-span-7 bg-slate-950/75 p-5 sm:p-7 lg:p-8 flex flex-col justify-between relative overflow-hidden backdrop-blur-xl animate-fadeIn"
          >
            {/* Ambient canvas grid background */}
            <div className="absolute inset-0 bg-radial-gradient from-emerald-500/8 via-transparent to-transparent pointer-events-none" />

            {/* Top Bar: Role-Specific Operational Spotlight */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-xl backdrop-blur-xl">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    {currentVisual.spotlightBadge}
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                    Demo Data
                  </span>
                </div>
                <div className="text-sm font-extrabold text-emerald-300 mt-0.5">
                  {currentVisual.spotlightMetric}
                </div>
              </div>

              <div className="text-[11px] text-slate-400 sm:text-right max-w-xs leading-snug">
                {currentVisual.spotlightDesc}
              </div>
            </div>

            {/* Main Interactive Inventory Ecosystem Stage */}
            <div className="relative w-full h-[360px] sm:h-[400px] lg:h-[420px] my-4 flex items-center justify-center select-none">
              
              {/* SVG Connecting Telemetry Laser Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="ecosystemBeam" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.25" />
                  </linearGradient>
                </defs>
                {currentVisual.nodes.map((node) => {
                  const isHovered = hoveredNodeId === node.id || selectedNodeId === node.id;
                  return (
                    <g key={`beam-${node.id}`}>
                      <line
                        x1="50"
                        y1="50"
                        x2={node.x}
                        y2={node.y}
                        stroke="#10b981"
                        strokeOpacity={isHovered ? '0.75' : '0.22'}
                        strokeWidth={isHovered ? '0.5' : '0.25'}
                        strokeDasharray={isHovered ? '1.5 1' : '0.8 1.2'}
                        className={isHovered ? 'animate-pulse' : ''}
                      />
                      {isHovered && (
                        <circle cx={node.x} cy={node.y} r="0.9" fill="#10b981" className="animate-ping" />
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Central Dynamic Hub Node */}
              <div className="relative z-20 w-36 sm:w-44 h-36 sm:h-44 rounded-full p-2 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 border-2 border-emerald-500/40 shadow-2xl shadow-emerald-950/40 flex flex-col items-center justify-center text-center backdrop-blur-2xl">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-live-beacon mb-1" />
                <div className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider truncate max-w-[90%]">
                  {currentVisual.hub.eyebrow}
                </div>
                <div className="text-sm sm:text-base font-black text-white leading-tight mt-0.5 px-1 truncate max-w-full">
                  {currentVisual.hub.title}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 truncate max-w-full px-1">
                  {currentVisual.hub.subtitle}
                </div>
                <div className="mt-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] font-mono text-slate-300">
                  {currentVisual.hub.badge}
                </div>
              </div>

              {/* Interactive Floating Workflow Nodes */}
              {currentVisual.nodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                const isHovered = hoveredNodeId === node.id;
                const NodeIcon = node.icon;

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 z-30 group"
                    style={{
                      left: `${node.x}%`,
                      top: `${node.y}%`,
                      transform: `translate(-50%, -50%) scale(${isSelected ? 1.08 : isHovered ? 1.04 : 1})`,
                    }}
                  >
                    <div
                      className={`relative w-28 sm:w-34 p-2 rounded-2xl border transition-all duration-200 backdrop-blur-xl shadow-lg ${
                        isSelected
                          ? 'bg-slate-900 border-emerald-400 ring-2 ring-emerald-500/40 shadow-xl shadow-emerald-950/50'
                          : 'bg-slate-900/90 border-white/10 hover:border-emerald-500/40 hover:bg-slate-800/90 shadow-lg'
                      }`}
                    >
                      {/* Node Pill */}
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span
                          className={`text-[8px] font-extrabold uppercase px-1 py-0.5 rounded truncate ${
                            node.condition === 'warning'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : node.condition === 'critical'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : node.condition === 'info'
                              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {node.tag}
                        </span>
                        <span className="text-[8px] font-mono text-slate-400 truncate">
                          {node.metricValue}
                        </span>
                      </div>

                      {/* Photo Thumbnail or Vector Icon Box */}
                      <div className="relative h-11 sm:h-14 rounded-xl overflow-hidden mb-1 border border-white/10 flex items-center justify-center bg-slate-950">
                        {node.image ? (
                          <CulinaryImage src={node.image} alt={node.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-emerald-400 bg-slate-950/90">
                            <NodeIcon className="w-5 h-5 sm:w-6 sm:h-6 opacity-90 group-hover:scale-110 transition-transform" />
                          </div>
                        )}
                        <div className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-slate-950/85 text-[8px] font-bold text-white border border-white/10">
                          {node.metricUnit}
                        </div>
                      </div>

                      <div className="text-[10px] font-bold text-white truncate leading-tight group-hover:text-emerald-300">
                        {node.shortName}
                      </div>
                      <div className="text-[8px] font-mono text-slate-400 truncate mt-0.5">
                        {node.category}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Compact Telemetry Information Card */}
            {activeNode && (
              <div key={activeNode.id} className="relative z-20 p-3.5 rounded-2xl bg-slate-900/95 border border-emerald-500/30 shadow-2xl backdrop-blur-xl animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white">{activeNode.name}</span>
                    <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                      Demo Data
                    </span>
                  </div>
                  <div className="text-xs font-mono font-bold text-emerald-300">
                    {activeNode.metricValue} • {activeNode.metricUnit}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-[10px]">
                  <div>
                    <span className="text-slate-400 block truncate">{activeNode.details.label1}:</span>
                    <strong className="text-white font-mono truncate block">{activeNode.details.value1}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block truncate">{activeNode.details.label2}:</span>
                    <strong className="text-emerald-300 truncate block">{activeNode.details.value2}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block truncate">{activeNode.details.label3}:</span>
                    <strong className="text-white truncate block">{activeNode.details.value3}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block truncate">{activeNode.details.label4}:</span>
                    <strong className="text-white truncate block">{activeNode.details.value4}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Terms & Privacy Policy Modal */}
      {policyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-white/15 shadow-2xl p-6 text-slate-200">
            <h3 className="text-lg font-black text-white mb-2">
              {policyModal === 'terms' ? 'StockMate Terms of Service' : 'StockMate Privacy Policy'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {policyModal === 'terms'
                ? 'StockMate SaaS provides restaurant inventory management, multi-branch stock transfers, dock Goods Received Notes (GRN), and automated FEFO expiry alerts. Authorized platform access requires valid commercial subscription licensing.'
                : 'StockMate protects tenant data with granular Role-Based Access Control (RBAC), multi-tenant isolation, and encrypted sessions. Inventory and billing data remains strictly isolated by restaurant organization.'}
            </p>
            <button
              type="button"
              onClick={() => setPolicyModal(null)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-colors shadow-lg shadow-emerald-600/25"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
