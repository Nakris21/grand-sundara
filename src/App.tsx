/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ActivePage, UserRole } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';

// Pages
import { Login } from './pages/Login';
import { AccountStatusNotice } from './pages/AccountStatusNotice';
import { Dashboard } from './pages/Dashboard';
import { FamilyResidents } from './pages/FamilyResidents';
import { Siteplan } from './pages/Siteplan';
import { CashManagement } from './pages/CashManagement';
import { BusinessDirectory } from './pages/BusinessDirectory';
import { AnnouncementsEvents } from './pages/AnnouncementsEvents';
import { AccountSettings } from './pages/AccountSettings';
import { AuditLogPage } from './pages/AuditLogPage';
import { ChangePasswordModal } from './components/ChangePasswordModal';

function AppContent() {
  const { currentUser, logout, switchDemoRole, isLoading } = useAuth();
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-emerald-900 flex items-center justify-center text-white text-sm font-medium">
        Memuat sesi autentikasi Grand Sundara Digital...
      </div>
    );
  }

  if (!currentUser) {
    return <Login />;
  }

  // If forcePasswordChange is true, mandate password change
  if (currentUser.forcePasswordChange) {
    return <ChangePasswordModal />;
  }

  // Route Guard: if account is invited or suspended, show notice
  if (currentUser.accountStatus === 'invited' || currentUser.accountStatus === 'suspended') {
    return <AccountStatusNotice />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar
        currentUser={currentUser}
        onSwitchUser={switchDemoRole}
        onLogout={logout}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        onNavigateToSettings={() => setActivePage('settings')}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          activePage={activePage}
          onNavigate={setActivePage}
          role={currentUser.role}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {activePage === 'dashboard' && (
            <Dashboard currentUser={currentUser} onNavigate={setActivePage} />
          )}
          {activePage === 'families' && <FamilyResidents currentUser={currentUser} />}
          {activePage === 'siteplan' && <Siteplan currentUser={currentUser} />}
          {activePage === 'cash' && <CashManagement currentUser={currentUser} />}
          {activePage === 'businesses' && <BusinessDirectory currentUser={currentUser} />}
          {(activePage === 'announcements' || activePage === 'events') && (
            <AnnouncementsEvents currentUser={currentUser} />
          )}
          {activePage === 'settings' && <AccountSettings currentUser={currentUser} />}
          {activePage === 'audit' && <AuditLogPage />}
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
