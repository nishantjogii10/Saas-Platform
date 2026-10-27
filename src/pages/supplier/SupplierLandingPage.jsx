import React from 'react';
import { SupplierLoginPage } from './SupplierLoginPage';

// Re-export SupplierLoginPage as SupplierLandingPage for backwards compatibility
export const SupplierLandingPage = () => {
  return <SupplierLoginPage />;
};

export default SupplierLandingPage;
