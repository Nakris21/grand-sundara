/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserAccount } from '../types';
import { Settings, Shield, User, Mail, CheckCircle2, Lock } from 'lucide-react';

interface AccountSettingsProps {
  currentUser: UserAccount;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({ currentUser }) => {
  const roleDescriptions: Record<string, string> = {
    super_admin: 'Super Admin: Mengelola seluruh konfigurasi sistem, akun pengurus, verifikasi warga, dan jejak audit.',
    admin: 'Admin Paguyuban: Mengelola data keluarga, warga, pengumuman, agenda, dan moderasi direktori usaha.',
    bendahara: 'Bendahara: Membuat dan mencatat transaksi kas masuk & keluar serta melihat laporan saldo.',
    resident: 'Warga Terverifikasi: Melihat informasi kas, direktori usaha, pengumuman, dan agenda warga.',
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <Settings className="w-6 h-6 text-emerald-600" />
          <span>Pengaturan Akun & Profil Warga</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Informasi akun login Anda dan hak akses peran pada portal Grand Sundara Digital.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-xs space-y-6">
        <div className="flex items-center space-x-4 border-b border-gray-100 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white font-bold text-2xl flex items-center justify-center shadow-md">
            {currentUser.fullName.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{currentUser.fullName}</h2>
            <p className="text-xs text-gray-500 flex items-center space-x-1 mt-0.5">
              <Mail className="w-3.5 h-3.5 text-emerald-600" />
              <span>{currentUser.email}</span>
            </p>
            <div className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <Shield className="w-3.5 h-3.5" />
              <span>Peran: {currentUser.role}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-gray-900 text-sm">Informasi Hak Akses Peran</h3>
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-2">
            <p className="font-semibold flex items-center space-x-1 text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{roleDescriptions[currentUser.role]}</span>
            </p>
            <p className="text-gray-600">
              Sistem keamanan membatasi operasi administratif dan transaksi kas agar integritas data warga dan keuangan paguyuban tetap terjaga.
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <h3 className="font-bold text-gray-900 text-sm">Keamanan & Autentikasi</h3>
          <div className="p-4 rounded-xl border border-gray-200 text-xs text-gray-600 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-semibold text-gray-900">Autentikasi Firebase & Firestore</div>
              <p>Fondasi siap dihubungkan dengan Firebase Auth dan Cloud Firestore sesuai panduan teknis.</p>
            </div>
            <Lock className="w-5 h-5 text-emerald-600 shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
};
