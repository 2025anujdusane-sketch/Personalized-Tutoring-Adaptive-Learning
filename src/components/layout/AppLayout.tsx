import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { SourceDrawer } from '../tutor/SourceDrawer';
import { ToastContainer } from '../ui/Toast';

export const AppLayout: React.FC = () => {
  const { user } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Protected route check
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-bg text-main flex">
      {/* Skip to main content accessibility link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-accent-fg focus:rounded-md focus:shadow-md"
      >
        Skip to main content
      </a>

      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main app body */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <TopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Citation preview drawer */}
      <SourceDrawer />

      {/* Global toast notifications */}
      <ToastContainer />
    </div>
  );
};
