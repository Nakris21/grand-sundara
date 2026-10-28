/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, AlertCircle, CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';

export const ChangePasswordModal: React.FC = () => {
  const { currentUser, updatePasswordAndClearForceChange, logout } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('Kata sandi baru minimal harus 8 karakter.');
      return;
    }

    if (currentUser && newPassword.toLowerCase() === currentUser.username.toLowerCase()) {
      setError('Kata sandi tidak boleh sama dengan username.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePasswordAndClearForceChange(newPassword);
    } catch (err: any) {
      setError(err?.message || 'Gagal memperbarui kata sandi. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-emerald-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-emerald-100">
        <div className="bg-emerald-800 p-6 text-white text-center">
          <div className="w-14 h-14 bg-emerald-700 rounded-2xl mx-auto flex items-center justify-center text-yellow-300 mb-3 shadow-md">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold">Wajib Ganti Kata Sandi</h2>
          <p className="text-xs text-emerald-200 mt-1">
            Demi keamanan akun Anda, silakan ubah kata sandi sementara Anda sebelum mengakses aplikasi.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 space-y-1">
            <p className="font-semibold">Ketentuan Kata Sandi Baru:</p>
            <ul className="list-disc list-inside text-emerald-800 space-y-0.5">
              <li>Minimal 8 karakter.</li>
              <li>Tidak boleh sama dengan username Anda ({currentUser?.username}).</li>
            </ul>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Kata Sandi Baru</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Konfirmasi Kata Sandi Baru</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi kata sandi baru"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2 flex space-x-3">
            <button
              type="button"
              onClick={logout}
              className="w-1/3 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition-colors"
            >
              Keluar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-2/3 flex items-center justify-center space-x-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan & Lanjutkan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
