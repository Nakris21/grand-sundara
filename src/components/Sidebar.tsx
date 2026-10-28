/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ActivePage, UserRole } from '../types';
import {
  LayoutDashboard,
  Users,
  MapPin,
  Wallet,
  Store,
  Bell,
  Calendar,
  Settings,
  ShieldAlert,
  HeartHandshake,
} from 'lucide-react';

interface SidebarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  role: UserRole;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  role,
  isMobileOpen,
  onCloseMobile,
}) => {
  const menuItems: { id: ActivePage; label: string; icon: React.ReactNode; roles?: UserRole[] }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'families', label: 'Data Keluarga & Warga', icon: <Users className="w-5 h-5" /> },
    { id: 'siteplan', label: 'Siteplan Perumahan', icon: <MapPin className="w-5 h-5" /> },
    { id: 'cash', label: 'Kas Paguyuban', icon: <Wallet className="w-5 h-5" /> },
    { id: 'businesses', label: 'Direktori Usaha', icon: <Store className="w-5 h-5" /> },
    { id: 'announcements', label: 'Pengumuman', icon: <Bell className="w-5 h-5" /> },
    { id: 'events', label: 'Agenda Kegiatan', icon: <Calendar className="w-5 h-5" /> },
    { id: 'settings', label: 'Pengaturan Akun', icon: <Settings className="w-5 h-5" /> },
    {
      id: 'audit',
      label: 'Jejak Audit (Log)',
      icon: <ShieldAlert className="w-5 h-5" />,
      roles: ['super_admin', 'admin'],
    },
  ];

  const filteredItems = menuItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(role);
  });

  const content = (
    <div className="flex flex-col h-full bg-white border-r border-emerald-100">
      <div className="p-4 border-b border-emerald-100 flex items-center space-x-2 bg-emerald-800 text-white">
        <HeartHandshake className="w-6 h-6 text-yellow-300 shrink-0" />
        <div>
          <h2 className="font-bold text-sm tracking-wide">Portal Warga</h2>
          <p className="text-[11px] text-emerald-200">Gotong Royong & Seduluran</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {filteredItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                  : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-900'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-emerald-600'}>{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-emerald-100 bg-emerald-50/50">
        <div className="text-xs text-emerald-900 font-semibold">Grand Sundara Digital</div>
        <p className="text-[11px] text-gray-500 mt-0.5">Versi 1.0 (MVP Foundation)</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 h-[calc(100vh-4rem)] sticky top-16">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-xs h-full bg-white shadow-xl z-10 flex flex-col">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
