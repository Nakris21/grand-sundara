/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserAccount, UserRole } from '../types';
import { Shield, User, LogOut, RefreshCw, Menu, Bell } from 'lucide-react';

interface NavbarProps {
  currentUser: UserAccount;
  onSwitchUser: (role: UserRole) => void;
  onLogout: () => void;
  onToggleMobileSidebar: () => void;
  onNavigateToSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchUser,
  onLogout,
  onToggleMobileSidebar,
  onNavigateToSettings,
}) => {
  const roleLabels: Record<UserRole, { label: string; bg: string; text: string }> = {
    super_admin: { label: 'Super Admin', bg: 'bg-emerald-100', text: 'text-emerald-800' },
    admin: { label: 'Admin Paguyuban', bg: 'bg-green-100', text: 'text-green-800' },
    bendahara: { label: 'Bendahara', bg: 'bg-amber-100', text: 'text-amber-800' },
    resident: { label: 'Warga Terverifikasi', bg: 'bg-sky-100', text: 'text-sky-800' },
  };

  return (
    <header className="bg-white border-b border-emerald-100 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-emerald-50 focus:outline-hidden"
            aria-label="Toggle Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              GS
            </div>
            <div>
              <span className="font-bold text-gray-900 text-base sm:text-lg tracking-tight block leading-tight">
                Grand Sundara Digital
              </span>
              <span className="text-xs text-emerald-700 font-medium block">
                Perumahan Grand Sundara Dukuhturi
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Role switcher for evaluation & demo */}
          <div className="hidden lg:flex items-center space-x-2 bg-emerald-50/80 border border-emerald-200 rounded-lg px-3 py-1.5 text-xs">
            <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin-slow" />
            <span className="text-emerald-900 font-medium">Simulasi Peran:</span>
            <select
              value={currentUser.role}
              onChange={(e) => onSwitchUser(e.target.value as UserRole)}
              className="bg-white border border-emerald-300 rounded px-2 py-0.5 text-xs text-emerald-900 font-semibold focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin Paguyuban</option>
              <option value="bendahara">Bendahara</option>
              <option value="resident">Warga Terverifikasi</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`hidden sm:inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                roleLabels[currentUser.role]?.bg || 'bg-gray-100'
              } ${roleLabels[currentUser.role]?.text || 'text-gray-800'}`}
            >
              {roleLabels[currentUser.role]?.label || currentUser.role}
            </span>

            <button
              onClick={onNavigateToSettings}
              className="flex items-center space-x-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-medium transition-colors"
              title="Pengaturan Akun"
            >
              <User className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline truncate max-w-[120px]">{currentUser.fullName}</span>
            </button>

            <button
              onClick={onLogout}
              className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              title="Keluar (Logout)"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
