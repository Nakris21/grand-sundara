/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Lock, User, ArrowRight, HeartHandshake, CheckCircle2, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, switchDemoRole, isLoading, error, clearError } = useAuth();
  const [username, setUsername] = useState('admin_fauzi');
  const [password, setPassword] = useState('password123');

  const handleRoleQuickLogin = (role: UserRole) => {
    switchDemoRole(role);
    if (role === 'super_admin') setUsername('superadmin');
    else if (role === 'admin') setUsername('admin_fauzi');
    else if (role === 'bendahara') setUsername('bendahara_siti');
    else if (role === 'resident') setUsername('warga_c12');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(username, password);
    } catch (err) {
      // Error handled in AuthContext
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
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 space-y-2">
            <p className="font-semibold flex items-center space-x-1 text-emerald-950">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Pilih Peran untuk Uji Cepat:</span>
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleRoleQuickLogin('super_admin')}
                className="text-left bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg p-2 transition-colors"
              >
                <div className="font-bold text-emerald-900 text-xs">Super Admin</div>
                <div className="text-[10px] text-gray-600">username: superadmin</div>
              </button>
              <button
                type="button"
                onClick={() => handleRoleQuickLogin('admin')}
                className="text-left bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg p-2 transition-colors"
              >
                <div className="font-bold text-emerald-900 text-xs">Admin Paguyuban</div>
                <div className="text-[10px] text-gray-600">username: admin_fauzi</div>
              </button>
              <button
                type="button"
                onClick={() => handleRoleQuickLogin('bendahara')}
                className="text-left bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg p-2 transition-colors"
              >
                <div className="font-bold text-emerald-900 text-xs">Bendahara</div>
                <div className="text-[10px] text-gray-600">username: bendahara_siti</div>
              </button>
              <button
                type="button"
                onClick={() => handleRoleQuickLogin('resident')}
                className="text-left bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg p-2 transition-colors"
              >
                <div className="font-bold text-emerald-900 text-xs">Warga</div>
                <div className="text-[10px] text-gray-600">username: warga_c12</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Username Akun</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                  placeholder="Masukkan username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md transition-all text-sm disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses Masuk...</span>
                </>
              ) : (
                <>
                  <span>Masuk Portal Warga</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400">
            Autentikasi berbasis Username & Password aman terintegrasi dengan Firebase Auth.
          </p>
        </div>
      </div>
    </div>
  );
};
