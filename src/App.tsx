/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ActivePage, UserAccount, UserRole } from './types';
import { MOCK_USERS } from './data/mockData';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { FamilyResidents } from './pages/FamilyResidents';
import { Siteplan } from './pages/Siteplan';
import { CashManagement } from './pages/CashManagement';
import { BusinessDirectory } from './pages/BusinessDirectory';
import { AnnouncementsEvents } from './pages/AnnouncementsEvents';
import { AccountSettings } from './pages/AccountSettings';
import { AuditLogPage } from './pages/AuditLogPage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(MOCK_USERS[1]); // Default to admin for evaluation
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleSwitchUserRole = (role: UserRole) => {
    const found = MOCK_USERS.find((u) => u.role === role);
    if (found) {
      setCurrentUser(found);
    } else {
      setCurrentUser({
        id: 'usr_custom_' + Date.now(),
        email: `${role}@grandsundara.id`,
        fullName: `Pengguna ${role}`,
        role: role,
        accountStatus: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar
        currentUser={currentUser}
        onSwitchUser={handleSwitchUserRole}
        onLogout={handleLogout}
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
          {activePage === 'siteplan' && <Siteplan />}
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
