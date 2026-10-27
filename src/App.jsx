import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { AccessDenied } from './components/layout/AccessDenied';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Landing Page (Home)
import { LandingPage } from './pages/LandingPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SetNewPasswordPage } from './pages/auth/SetNewPasswordPage';
import { MyProfilePage } from './pages/profile/MyProfilePage';
import { SignUpPage } from './pages/auth/SignUpPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Super Admin Pages
import { SuperAdminDashboard } from './pages/superAdmin/SuperAdminDashboard';
import { CommunicationCenterPage } from './pages/superAdmin/CommunicationCenterPage';
import { RestaurantManagement } from './pages/superAdmin/RestaurantManagement';
import { UserManagement } from './pages/superAdmin/UserManagement';
import { SubscriptionPlans } from './pages/superAdmin/SubscriptionPlans';
import { PlatformAnalytics } from './pages/superAdmin/PlatformAnalytics';
import { ActivityLogs } from './pages/superAdmin/ActivityLogs';
import { SupportSettings } from './pages/superAdmin/SupportSettings';
import { RoleMatrixPage } from './pages/superAdmin/RoleMatrixPage';
import { PaymentsDashboard } from './pages/superAdmin/PaymentsDashboard';
import { SubscriptionsPage } from './pages/superAdmin/SubscriptionsPage';
import { InvoicesPage } from './pages/superAdmin/InvoicesPage';
import { RevenueReportsPage } from './pages/superAdmin/RevenueReportsPage';
import { PlanReviewQueuePage } from './pages/superAdmin/PlanReviewQueuePage';
import { CustomPlanBuilderPage } from './pages/restaurant/CustomPlanBuilderPage';

// Restaurant Owner & Manager Pages
import { RestaurantDashboard } from './pages/restaurant/RestaurantDashboard';
import { OwnerInboxPage } from './pages/restaurant/OwnerInboxPage';
import { InventoryPage } from './pages/restaurant/InventoryPage';
import { ExpiryTrackingPage } from './pages/restaurant/ExpiryTrackingPage';
import { SuppliersPage } from './pages/restaurant/SuppliersPage';
import { PurchaseOrdersPage } from './pages/restaurant/PurchaseOrdersPage';
import { StockMovementsPage } from './pages/restaurant/StockMovementsPage';
import { AlertsPage } from './pages/restaurant/AlertsPage';
import { ReportsPage } from './pages/restaurant/ReportsPage';
import { StaffManagementPage } from './pages/restaurant/StaffManagementPage';
import { RestaurantSettingsPage } from './pages/restaurant/RestaurantSettingsPage';

// Smart Inventory, Supplier Billing, QR Tracking & Returns
import { GoodsReceivingPage } from './pages/restaurant/GoodsReceivingPage';
import { BatchTrackingPage } from './pages/restaurant/BatchTrackingPage';
import { SupplierReturnsPage } from './pages/restaurant/SupplierReturnsPage';
import { SupplierBillingPage } from './pages/restaurant/SupplierBillingPage';

// Multi-Branch Management, Branch Subscriptions, Staff Transfers & Notifications
import { CombinedBranchesPage } from './pages/restaurant/CombinedBranchesPage';
import { PlansAndBillingPage } from './pages/restaurant/PlansAndBillingPage';
import { BranchSubscriptionsPage } from './pages/restaurant/BranchSubscriptionsPage';
import { BranchPlansPage } from './pages/restaurant/BranchPlansPage';
import { WorkforcePage } from './pages/restaurant/WorkforcePage';
import { OwnerNotificationsPage } from './pages/restaurant/OwnerNotificationsPage';
import { OwnerBillingPage } from './pages/restaurant/OwnerBillingPage';

// Kitchen Staff Pages
import { KitchenDashboard } from './pages/kitchen/KitchenDashboard';
import { KitchenIngredientsPage } from './pages/kitchen/KitchenIngredientsPage';
import { RecordUsagePage } from './pages/kitchen/RecordUsagePage';
import { RecordWastagePage } from './pages/kitchen/RecordWastagePage';
import { ReportLowStockPage } from './pages/kitchen/ReportLowStockPage';

// Supplier Pages
import { SupplierDashboard } from './pages/supplier/SupplierDashboard';
import { SupplierOrdersPage } from './pages/supplier/SupplierOrdersPage';
import { SupplierHistoryPage } from './pages/supplier/SupplierHistoryPage';
import { SupplierProfilePage } from './pages/supplier/SupplierProfilePage';
import { SupplierInvoicesPage } from './pages/supplier/SupplierInvoicesPage';
import { SupplierReturnsPage as SupplierPortalReturnsPage } from './pages/supplier/SupplierReturnsPage';
import { getRoleLandingRoute } from './utils/permissions';

// Role Guard Component
const RoleGuard = ({ allowedRoles, children }) => {
  const { currentUser } = useApp();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Intercept users who must set a new password on first login
  if (currentUser.mustChangePassword && location.pathname !== '/set-new-password') {
    return <Navigate to="/set-new-password" replace />;
  }

  // Super Admin has master platform access to audit and view all tenant modules
  if (currentUser.role === 'super_admin') {
    return children;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return <AccessDenied requiredRoles={allowedRoles} currentRole={currentUser.role} />;
  }

  return children;
};

// Root Redirector based on user role
const RootRedirect = () => {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;

  if (currentUser.mustChangePassword) {
    return <Navigate to="/set-new-password" replace />;
  }

  return <Navigate to={getRoleLandingRoute(currentUser.role)} replace />;
};

// Universal Dashboard Route: Dispatches to role-specific dashboard seamlessly
const DashboardDispatcher = () => {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;

  switch (currentUser.role) {
    case 'super_admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'supplier':
      return <Navigate to="/supplier" replace />;
    case 'kitchen_staff':
      return <Navigate to="/kitchen" replace />;
    case 'restaurant_manager':
      return <Navigate to="/workforce" replace />;
    case 'inventory_manager':
    case 'restaurant_owner':
    default:
      return <RestaurantDashboard />;
  }
};

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/set-new-password" element={<SetNewPasswordPage />} />
          <Route
            path="/profile"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['kitchen_staff', 'inventory_manager', 'restaurant_manager', 'restaurant_owner']}>
                  <MyProfilePage />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/my-profile"
            element={<Navigate to="/profile" replace />}
          />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Super Admin Module */}
          <Route
            path="/admin/dashboard"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['super_admin']}>
                  <SuperAdminDashboard />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/admin/communication"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['super_admin']}>
                  <CommunicationCenterPage />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/admin/restaurants"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['super_admin']}>
                  <RestaurantManagement />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['super_admin']}>
                  <UserManagement />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/admin/plans"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['super_admin']}>
                  <SubscriptionPlans />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['super_admin']}>
                  <PlatformAnalytics />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/admin/logs"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['super_admin']}>
                  <ActivityLogs />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/admin/support"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['super_admin']}>
                  <SupportSettings />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/admin/role-matrix"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['super_admin']}>
                  <RoleMatrixPage />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/admin/roles"
            element={<Navigate to="/admin/role-matrix" replace />}
          />

          {/* Platform Finance Module */}
          <Route
            path="/admin/finance/payments"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['super_admin']}>
                  <PaymentsDashboard />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/admin/payments"
            element={<Navigate to="/admin/finance/payments" replace />}
          />

          <Route
            path="/admin/finance/subscriptions"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['super_admin']}>
                  <SubscriptionsPage />
                </RoleGuard>
              </AppLayout>
            }
          />

          {/* Custom Plan Review Queue (Path C Manual Review) */}
          <Route
            path="/admin/custom-plan-requests"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['super_admin']}>
                  <PlanReviewQueuePage />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route path="/admin/plan-approvals" element={<Navigate to="/admin/custom-plan-requests" replace />} />
          <Route path="/admin/plan-review" element={<Navigate to="/admin/custom-plan-requests" replace />} />
          <Route
            path="/admin/subscriptions"
            element={<Navigate to="/admin/finance/subscriptions" replace />}
          />

          <Route
            path="/admin/finance/invoices"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['super_admin']}>
                  <InvoicesPage />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/admin/invoices"
            element={<Navigate to="/admin/finance/invoices" replace />}
          />

          <Route
            path="/admin/finance/revenue"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['super_admin']}>
                  <RevenueReportsPage />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/admin/revenue"
            element={<Navigate to="/admin/finance/revenue" replace />}
          />

          {/* Universal Dashboard Dispatcher */}
          <Route
            path="/dashboard"
            element={
              <AppLayout>
                <DashboardDispatcher />
              </AppLayout>
            }
          />

          {/* Restaurant Owner Inbox & Communication Center */}
          <Route
            path="/inbox"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['restaurant_owner']}>
                  <OwnerInboxPage />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/inventory"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['restaurant_owner', 'inventory_manager']}>
                  <InventoryPage />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/expiry-tracking"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['restaurant_owner', 'inventory_manager']}>
                  <ExpiryTrackingPage />
                </RoleGuard>   
              </AppLayout>
            }
          />
          <Route
            path="/suppliers"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['restaurant_owner', 'inventory_manager']}>
                  <SuppliersPage />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/purchase-orders"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['restaurant_owner', 'inventory_manager']}>
                  <PurchaseOrdersPage />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/goods-receiving"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['restaurant_owner', 'inventory_manager']}>
                  <GoodsReceivingPage />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/batch-tracking"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['restaurant_owner', 'inventory_manager']}>
                  <BatchTrackingPage />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/batch tracking"
            element={<Navigate to="/batch-tracking" replace />}
          />
          <Route
            path="/batches"
            element={<Navigate to="/batch-tracking" replace />}
          />
          <Route
            path="/supplier-returns"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['restaurant_owner', 'inventory_manager']}>
                  <SupplierReturnsPage />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/supplier-billing"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['restaurant_owner', 'inventory_manager']}>
                  <SupplierBillingPage />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/stock-movements"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['restaurant_owner', 'inventory_manager']}>
                  <StockMovementsPage />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/alerts"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['restaurant_owner', 'inventory_manager', 'restaurant_manager']}>
                  <AlertsPage />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/reports"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['restaurant_owner', 'inventory_manager', 'restaurant_manager']}>
                  <ReportsPage />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/staff"
            element={<Navigate to="/branch-staff" replace />}
          />
          <Route
            path="/staff-legacy"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['restaurant_owner']}>
                  <StaffManagementPage />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/settings"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['restaurant_owner']}>
                  <RestaurantSettingsPage />
                </RoleGuard>
              </AppLayout>
            }
          />

          {/* Restaurant Owner: Branch & Plan Management Module */}
          <Route
            path="/branches"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['restaurant_owner']}>
                  <CombinedBranchesPage />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/branches/overview"
            element={<Navigate to="/branches" replace />}
          />
          <Route
            path="/branch-overview"
            element={<Navigate to="/branches" replace />}
          />
          <Route
            path="/branch"
            element={<Navigate to="/branches" replace />}
          />
          <Route
            path="/plans-billing"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['restaurant_owner']}>
                  <PlansAndBillingPage />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/branch-subscriptions"
            element={<Navigate to="/plans-billing?tab=subscriptions" replace />}
          />
          <Route
            path="/branches/subscriptions"
            element={<Navigate to="/plans-billing?tab=subscriptions" replace />}
          />
          <Route
            path="/branch-plans"
            element={<Navigate to="/plans-billing?tab=comparison" replace />}
          />
          <Route
            path="/branches/plans"
            element={<Navigate to="/plans-billing?tab=comparison" replace />}
          />
          <Route
            path="/custom-plan"
            element={<Navigate to="/plans-billing?tab=custom" replace />}
          />
          <Route path="/plan-builder" element={<Navigate to="/plans-billing?tab=custom" replace />} />
          <Route path="/custom-plans" element={<Navigate to="/plans-billing?tab=custom" replace />} />
          <Route
            path="/workforce"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['restaurant_owner', 'restaurant_manager']}>
                  <WorkforcePage />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/branch-staff"
            element={<Navigate to="/workforce" replace />}
          />
          <Route
            path="/staff-transfers"
            element={<Navigate to="/workforce?tab=transfers" replace />}
          />
          <Route
            path="/transfers"
            element={<Navigate to="/workforce?tab=transfers" replace />}
          />
          <Route
            path="/notifications"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['restaurant_owner']}>
                  <OwnerNotificationsPage />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/billing"
            element={<Navigate to="/plans-billing?tab=invoices" replace />}
          />

          {/* Kitchen Staff Module */}
          <Route
            path="/kitchen"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['kitchen_staff']}>
                  <KitchenDashboard />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/kitchen/ingredients"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['kitchen_staff']}>
                  <KitchenIngredientsPage />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/kitchen/usage"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['kitchen_staff']}>
                  <RecordUsagePage />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/kitchen/wastage"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['kitchen_staff']}>
                  <RecordWastagePage />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/kitchen/report-stock"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['kitchen_staff']}>
                  <ReportLowStockPage />
                </RoleGuard>
              </AppLayout>
            }
          />

          {/* Supplier Module */}
          <Route
            path="/supplier"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['supplier']}>
                  <SupplierDashboard />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/supplier/orders"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['supplier']}>
                  <SupplierOrdersPage />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/supplier/invoices"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['supplier']}>
                  <SupplierInvoicesPage />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/supplier/returns"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['supplier']}>
                  <SupplierPortalReturnsPage />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/supplier/history"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['supplier']}>
                  <SupplierHistoryPage />
                </RoleGuard>
              </AppLayout>
            }
          />
          <Route
            path="/supplier/profile"
            element={
              <AppLayout>
                <RoleGuard allowedRoles={['supplier']}>
                  <SupplierProfilePage />
                </RoleGuard>
              </AppLayout>
            }
          />

          {/* Public SaaS Landing / Home Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/app" element={<RootRedirect />} />

          {/* Default Fallback Route */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </Router>
    </AppProvider>
  </ErrorBoundary>
  );
}


export default App;

