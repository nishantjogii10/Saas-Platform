
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { ToastContainer } from '../common/Toast';
import { ProfileModal } from '../common/ProfileModal';

export const AppLayout = ({ children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-800 overflow-hidden">
      {/* Main Workspace: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Scrollable Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <TopNavbar
            onOpenMobile={() => setIsMobileSidebarOpen(true)}
          />

          <main className="flex-1 w-full max-w-none px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
        </div>
      </div>

      {/* Global Toast Notifications & Modals */}
      <ToastContainer />
      <ProfileModal />
    </div>
  );
};
