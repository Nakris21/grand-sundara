/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserRole, UserAccount } from '../types';
import { MOCK_USERS } from '../data/mockData';
import { Shield, Lock, Mail, ArrowRight, HeartHandshake, CheckCircle2 } from 'lucide-react';

interface LoginProps {
  onLogin: (user: UserAccount) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('pengurus@grandsundara.id');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [error, setError] = useState('');

  const handleRoleQuickLogin = (role: UserRole) => {
    const user = MOCK_USERS.find((u) => u.role === role);
    if (user) {
      onLogin(user);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      onLogin(found);
    } else {
      // Create temporary session based on selected role
      const tempUser: UserAccount = {
        id: 'usr_custom_' + Date.now(),
        email: email,
        fullName: email.split('@')[0],
        role: selectedRole,
        accountStatus: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onLogin(tempUser);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-800 via-emerald-900 to-green-950 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-emerald-100">
        <div className="bg-gradient-to-r from-emerald-700 to-green-800 p-6 sm:p-8 text-white text-center relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-600/30 rounded-full blur-xl pointer-events-none" />
          <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center text-emerald-800 font-bold text-2xl shadow-lg mb-3">
            GS
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Grand Sundara Digital</h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            Portal Warga Perumahan Grand Sundara Dukuhturi
          </p>
          <div className="inline-flex items-center space-x-1.5 mt-3 bg-emerald-900/60 px-3 py-1 rounded-full text-xs text-emerald-200 border border-emerald-600/50">
            <HeartHandshake className="w-3.5 h-3.5 text-yellow-300" />
            <span>Gotong Royong • Guyub Rukun • Seduluran</span>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 space-y-2">
            <p className="font-semibold flex items-center space-x-1 text-emerald-950">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Pilih Peran Demo untuk Pengujian Cepat:</span>
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleRoleQuickLogin('super_admin')}
                className="text-left bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg p-2 transition-colors"
              >
                <div className="font-bold text-emerald-900">Super Admin</div>
                <div className="text-[10px] text-gray-600">Akses penuh sistem</div>
              </button>
              <button
                type="button"
                onClick={() => handleRoleQuickLogin('admin')}
                className="text-left bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg p-2 transition-colors"
              >
                <div className="font-bold text-emerald-900">Admin Paguyuban</div>
                <div className="text-[10px] text-gray-600">Kelola warga & kegiatan</div>
              </button>
              <button
                type="button"
                onClick={() => handleRoleQuickLogin('bendahara')}
                className="text-left bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg p-2 transition-colors"
              >
                <div className="font-bold text-emerald-900">Bendahara</div>
                <div className="text-[10px] text-gray-600">Pencatatan kas</div>
              </button>
              <button
                type="button"
                onClick={() => handleRoleQuickLogin('resident')}
                className="text-left bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg p-2 transition-colors"
              >
                <div className="font-bold text-emerald-900">Warga</div>
                <div className="text-[10px] text-gray-600">Lihat kas, info & direktori</div>
              </button>
            </div>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="grow border-t border-gray-200"></div>
            <span className="shrink mx-4 text-xs text-gray-400 uppercase tracking-wider">Atau masuk manual</span>
            <div className="grow border-t border-gray-200"></div>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Warga / Pengurus</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  placeholder="nama@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Pilih Peran Akun</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin Paguyuban</option>
                <option value="bendahara">Bendahara</option>
                <option value="resident">Warga Terverifikasi</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md transition-all text-sm"
            >
              <span>Masuk ke Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-gray-400">
            Integrasi Firebase Auth & Firestore disiapkan untuk tahap berikutnya.
          </p>
        </div>
      </div>
    </div>
  );
};
