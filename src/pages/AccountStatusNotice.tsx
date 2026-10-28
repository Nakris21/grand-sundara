/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogOut, Mail } from 'lucide-react';

export const AccountStatusNotice: React.FC = () => {
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-amber-200 text-center space-y-6">
        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-gray-900">Akses Akun Menunggu Verifikasi</h1>
          <p className="text-xs text-gray-600 leading-relaxed">
            Akun Anda dengan email <strong className="text-gray-900">{currentUser?.email}</strong> saat ini berstatus <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[11px]">{currentUser?.accountStatus || 'invited'}</span>. Akses penuh ke portal warga akan dibuka setelah diverifikasi oleh Admin Paguyuban.
          </p>
        </div>

        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 text-left space-y-1">
          <p className="font-bold">Langkah Selanjutnya:</p>
          <p>Silakan hubungi pengurus RT/RW atau Admin Paguyuban Perumahan Grand Sundara Dukuhturi untuk mengaktifkan akun Anda.</p>
        </div>

        <button
          onClick={logout}
          className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-md transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar dari Akun</span>
        </button>
      </div>
    </div>
  );
};
