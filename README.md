# StockMate — Restaurant Inventory Management SaaS Platform

A professional, modern, responsive B2B SaaS web application designed to help restaurants manage inventory, ingredients, batch expiry dates, suppliers, purchase orders, and stock movements with multi-tenant architecture and platform governance.

---

## 🌟 Key Highlights & Architecture

- **World-Class B2B SaaS Landing Page (Home)**: High-converting, interactive public landing page at `/` featuring live perspective switchers, interactive Food Spoilage & Savings ROI Calculator, 1-click persona test-drive launcher, multi-tenant architecture breakdown, and interactive monthly/annual pricing matrix.
- **Multi-Tenant Architecture**: Visual tenant isolation for multiple independent restaurants (**Spice Garden**, **Green Bowl Cafe**, **Urban Tandoor**) with distinct inventory, staff, suppliers, and purchase orders.
- **5 Distinct User Roles**:
  1. **Super Admin (Platform Owner)**: Global oversight, restaurant onboarding approvals, platform-wide user management, subscription pricing tiers, platform analytics, and audit logs.
  2. **Restaurant Owner / Admin**: Complete restaurant workspace control, inventory CRUD, staff provisioning, cost reports, and subscription management.
  3. **Inventory Manager**: Operational stock control, purchase order creation, batch expiry tracking, and stock receipt verification.
  4. **Kitchen Staff**: Rapid prep-line dashboard to record ingredient usage, log food spoilage/wastage, and report low stock.
  5. **Supplier Partner**: Vendor portal to view assigned purchase orders, accept/reject requisitions, and update fulfillment tracking (Dispatched ➔ Delivered).
- **Interactive State Workflows**: Fully reactive React Context state persisted to `localStorage` with a 1-click **Reset Demo Data** capability.
- **Role-Based Access Control**: Route guards and dynamic navigation bars prevent unauthorized access, displaying helpful access-denied screens when restricted routes are visited.
- **Modern Design System**: Tailored B2B SaaS aesthetic with deep forest green brand styling, Lucide icons, and interactive Recharts visualizations.

---

## 🛠️ Technology Stack

- **Framework**: React 19 with Vite 5 (Wasm Rollup runtime for zero-dependency portability)
- **Styling**: Tailwind CSS with custom forest green color palette
- **Icons**: Lucide React
- **Analytics & Visualizations**: Recharts (Area charts, Bar charts, Donut charts)
- **Routing**: React Router DOM (HashRouter for resilient SPA deep-linking)
- **State Management**: React Context API (`AppContext.jsx`) with automatic `localStorage` synchronization
- **Mock Data**: Rich multi-restaurant datasets for ingredients, suppliers, purchase orders, movements, and audit logs.

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Installation

```bash
# Clone or navigate to the project directory
cd "c:\Users\Pc\Desktop\Saas Platfrom"

# Install dependencies
npm install

# Ensure wasm rollup sync (runs automatically on postinstall)
npm run setup-wasm
```

### 3. Start Development Server

```bash
npm run dev
```

Visit **`http://localhost:5173/`** in your browser.

### 4. Production Build & Preview

```bash
# Compile optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 👥 Demo Personas & Quick Role Switcher

StockMate features a persistent **Demo Switcher Bar** across the top of every screen to let evaluators switch between roles and restaurant tenants in 1 click:

| Role | Demo Persona | Context / Workspace | Purpose / Permissions |
|---|---|---|---|
| **Super Admin** | Alexander Vance | Platform Global | Full SaaS platform oversight, approve signups, manage plans |
| **Restaurant Owner** | Priya Sharma | Spice Garden | Manage restaurant, inventory, staff, settings & plan |
| **Inventory Manager** | Rahul Verma | Spice Garden | Create POs, receive stock, manage suppliers & movements |
| **Kitchen Staff** | Chef Anita Rao | Spice Garden | Station dashboard, record usage & wastage, report low stock |
| **Supplier Partner** | David Miller | Metro Food Distributors | Accept/reject POs, mark dispatched & delivered |

> **Evaluator Tip**: You can also use the tenant selector dropdown in the top bar to switch between **Spice Garden**, **Green Bowl Cafe**, and **Urban Tandoor** to observe strict tenant data isolation.

---

## 🔄 End-to-End Interactive Workflows

### Workflow A: Restaurant Registration & Super Admin Approval

1. Navigate to `/signup` or click **"Sign up here (Workflow A)"** on the login screen.
2. Enter a new restaurant name (e.g., *Saffron Bistro & Lounge*), owner name, and email, and choose a subscription plan.
3. Submit the registration. The account is recorded in mock storage with status **Pending Approval**.
4. Click **"Switch to Super Admin & Approve Account"** (or use the top Demo Switcher to select Super Admin).
5. In **Restaurant Management** (`/admin/restaurants`), filter by **Pending** or click **Approve** on the new restaurant card.
6. The account status updates to **Active**, activating the tenant workspace and enabling owner login.

---

### Workflow B: Inventory Usage & Low-Stock Alerts

1. Switch to **Restaurant Owner** or **Inventory Manager** and open **Inventory Management** (`/inventory`).
2. Notice the current stock and minimum threshold for ingredients (e.g. *Farm-Fresh Chicken Breast* or *Roma Vine Tomatoes*).
3. Click **"Use"** on any ingredient to record kitchen usage (e.g. consume 4 kg).
4. Stock quantities instantly update, and the system recalculates the threshold.
5. If remaining quantity &le; threshold, the status turns to **Low Stock** (or **Out of Stock** if 0).
6. A high-priority alert is automatically triggered on the **Restaurant Dashboard** and the **Alerts & Notices** page (`/alerts`).

---

### Workflow C: Purchase Order Fulfillment & Supplier Verification

1. As **Inventory Manager** (or Owner), identify a low-stock ingredient and click **"Create Purchase Order"** on `/purchase-orders`.
2. Select **Metro Food Distributors** (David Miller), add items (e.g. Chicken Breast, Paneer), and submit.
3. The PO is created with status **Pending**.
4. In the top Demo Switcher, click **Supplier Partner** (David Miller @ Metro Foods) and navigate to `/supplier/orders`.
5. As the supplier, review the PO manifest and click **Accept Order**.
6. Click **Mark Dispatched**, then click **Mark Delivered**.
7. In the top Demo Switcher, switch back to **Restaurant Owner** or **Inventory Manager** and open `/purchase-orders`.
8. Locate the delivered PO and click **Verify & Receive Stock**.
9. In the verification dialog, verify quantities, assign a lot number (e.g., `BCH-REC-402`), and confirm.
10. **Result**: On-hand inventory increases *only after receipt is verified*, a corresponding entry is appended to the **Stock Movements** ledger, and the low-stock alert is automatically cleared!

---

### Workflow D: Super Admin Subscription Management

1. Switch to **Super Admin** and open **Subscription Plans** (`/admin/plans`).
2. Review the cards for **Starter**, **Professional**, and **Enterprise** tiers.
3. Click **Edit Plan Limits** on any plan to modify monthly pricing, SKU limits, or staff seats.
4. Click **"Assign Plan to Restaurant"** to reassign a demo restaurant (e.g. upgrade *Spice Garden* from Professional to Enterprise).
5. Switch to **Restaurant Owner** and open **Settings & Plan** (`/settings`) to confirm the updated plan, quota limits, and billing status are immediately reflected in the restaurant's workspace.

---

### Workflow E: Role-Based Access Control & Route Guarding

1. Switch to **Kitchen Staff** (Chef Anita Rao).
2. Attempt to navigate directly to `/suppliers`, `/settings`, or `/admin/dashboard`.
3. Notice that the application renders a clean **Access Restricted** screen with an explanation of role limitations and a return button.
4. In addition, privileged management actions (such as deleting inventory items or creating purchase orders) are hidden or restricted.
5. Click **Log Out** in the user menu or sidebar footer to return to the interactive login screen.

---

## 📁 Project Directory Structure

```
stockmate-saas/
├── index.html                     # HTML5 Shell with custom font & favicon
├── package.json                   # Dependencies, scripts, and wasm postinstall
├── vite.config.js                 # Vite config with manual vendor chunking
├── tailwind.config.js             # Tailwind design system with forest green colors
├── postcss.config.js              # PostCSS plugins
└── src/
    ├── main.jsx                   # React 19 application root entry
    ├── index.css                  # Global styles & custom scrollbars
    ├── App.jsx                    # Route hierarchy & RoleGuard wrapper
    ├── context/
    │   └── AppContext.jsx         # Global state, workflows, & localStorage sync
    ├── data/
    │   └── mockData.js            # Realistic multi-tenant mock datasets
    ├── components/
    │   ├── common/
    │   │   ├── Badge.jsx          # Color-coded status & role badges
    │   │   ├── Button.jsx         # Flexible button variants & loading states
    │   │   ├── Card.jsx           # Clean rounded card wrappers
    │   │   ├── ConfirmModal.jsx   # Accessible confirmation dialogs
    │   │   ├── DataTable.jsx      # Sortable, paginated data tables
    │   │   ├── EmptyState.jsx     # Friendly zero-data screens
    │   │   ├── FormInput.jsx      # Inputs, selects, and textareas
    │   │   ├── Modal.jsx          # Accessible dialog with ESC listener
    │   │   ├── PageHeader.jsx     # Standardized page headers & breadcrumbs
    │   │   ├── SearchBar.jsx      # Search with clear icon
    │   │   ├── StatCard.jsx       # Metric cards with change indicators
    │   │   └── Toast.jsx          # Global toast notification container
    │   └── layout/
    │       ├── AppLayout.jsx      # App shell with sidebar, topbar, & toasts
    │       ├── Sidebar.jsx        # Dynamic role-based navigation sidebar
    │       ├── TopNavbar.jsx      # Restaurant brand, role badge, notifications
    │       ├── DemoRoleSwitcher.jsx # 1-click evaluator role & tenant switcher
    │       └── AccessDenied.jsx   # Role guard access denied UI
    └── pages/
        ├── auth/                  # Login, Signup (Workflow A), Forgot Password
        ├── superAdmin/            # Platform oversight, Tenants, Users, Plans, Analytics
        ├── restaurant/            # Dashboard, Inventory, Expiry, Suppliers, POs, Ledgers
        ├── kitchen/               # Station Dashboard, Available Stock, Usage, Wastage
        └── supplier/              # Supplier Dashboard, Assigned POs, History, Profile
```

---

## 🛡️ Tenant Isolation Notice

In this frontend-only demonstration, multi-tenancy is simulated through application state and tenant-filtered queries (`restaurantId`). In an enterprise production deployment, tenant isolation must be strictly enforced server-side via database row-level security (RLS), tenant-scoped JWT claims, and network isolation.

---

## 📄 License

Built for demonstration and evaluation purposes. All sample company names and credentials are simulated mock data.
