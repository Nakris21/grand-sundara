/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MOCK_CASH_TRANSACTIONS, MOCK_CASH_SETTINGS } from '../data/mockData';
import { CashTransaction, UserAccount } from '../types';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, Info, Search, X } from 'lucide-react';

interface CashManagementProps {
  currentUser: UserAccount;
}

export const CashManagement: React.FC<CashManagementProps> = ({ currentUser }) => {
  const [transactions, setTransactions] = useState<CashTransaction[]>(MOCK_CASH_TRANSACTIONS);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Add transaction modal state
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [txType, setTxType] = useState<'income' | 'expense'>('income');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txDesc, setTxDesc] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txNote, setTxNote] = useState('');

  const canManageCash = currentUser.role === 'super_admin' || currentUser.role === 'admin' || currentUser.role === 'bendahara';

  // Calculations
  const totalIncome = transactions.reduce((acc, t) => acc + t.amountIn, 0);
  const totalExpense = transactions.reduce((acc, t) => acc + t.amountOut, 0);
  const currentBalance = MOCK_CASH_SETTINGS.openingBalance + totalIncome - totalExpense;

  const filteredTransactions = transactions.filter((t) => {
    const matchType = filterType === 'all' || t.transactionType === filterType;
    const matchSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || (t.note && t.note.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchType && matchSearch;
  });

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(txAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Nominal harus berupa angka lebih besar dari 0');
      return;
    }

    const amountIn = txType === 'income' ? amountNum : 0;
    const amountOut = txType === 'expense' ? amountNum : 0;
    const latestBalance = transactions.length > 0 ? transactions[transactions.length - 1].balanceAfter : MOCK_CASH_SETTINGS.openingBalance;
    const balanceAfter = txType === 'income' ? latestBalance + amountNum : latestBalance - amountNum;

    const newTx: CashTransaction = {
      id: 'trx_' + Date.now(),
      transactionDate: txDate,
      transactionType: txType,
      description: txDesc,
      amountIn,
      amountOut,
      balanceAfter,
      note: txNote || undefined,
      status: 'published',
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTransactions([...transactions, newTx]);
    setIsOpenModal(false);
    setTxDesc('');
    setTxAmount('');
    setTxNote('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Wallet className="w-6 h-6 text-emerald-600" />
            <span>Kas Paguyuban Warga</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Transparansi keuangan dan pencatatan kas masuk & keluar Perumahan Grand Sundara Dukuhturi.
          </p>
        </div>

        {canManageCash && (
          <button
            onClick={() => setIsOpenModal(true)}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Transaksi Baru</span>
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs">
          <div className="text-xs font-semibold text-gray-500">Saldo Awal (01 Jan 2026)</div>
          <div className="text-xl font-bold text-gray-900 mt-1">
            Rp {MOCK_CASH_SETTINGS.openingBalance.toLocaleString('id-ID')}
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs">
          <div className="text-xs font-semibold text-emerald-700">Total Pemasukan</div>
          <div className="text-xl font-bold text-emerald-800 mt-1">
            + Rp {totalIncome.toLocaleString('id-ID')}
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs">
          <div className="text-xs font-semibold text-red-600">Total Pengeluaran</div>
          <div className="text-xl font-bold text-red-700 mt-1">
            - Rp {totalExpense.toLocaleString('id-ID')}
          </div>
        </div>
      </div>

      {/* Main Balance Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-900 text-white p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-yellow-300 font-bold">Saldo Akhir Kas</span>
          <div className="text-3xl font-extrabold mt-1">Rp {currentBalance.toLocaleString('id-ID')}</div>
          <p className="text-xs text-emerald-200 mt-1">Data kas transparan dan dapat diperiksa oleh seluruh warga terverifikasi.</p>
        </div>
        <div className="bg-emerald-950/60 px-4 py-2 rounded-xl border border-emerald-600/40 text-xs text-emerald-100">
          Status: <strong>Aktif & Terverifikasi Bendahara</strong>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'all' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'income' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pemasukan
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'expense' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pengeluaran
          </button>
        </div>

        <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari rincian transaksi..."
            className="w-full bg-transparent text-xs focus:outline-hidden text-gray-900"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-emerald-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-emerald-50/70 border-b border-emerald-100 text-[11px] font-bold text-emerald-900 uppercase">
                <th className="p-4">Tanggal</th>
                <th className="p-4">Jenis</th>
                <th className="p-4">Rincian Transaksi</th>
                <th className="p-4 text-right">Masuk (Rp)</th>
                <th className="p-4 text-right">Keluar (Rp)</th>
                <th className="p-4 text-right">Saldo (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
              {filteredTransactions.map((trx) => (
                <tr key={trx.id} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="p-4 font-medium text-gray-600 whitespace-nowrap">
                    {new Date(trx.transactionDate).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    {trx.transactionType === 'income' ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                        <span>Pemasukan</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>Pengeluaran</span>
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-semibold text-gray-900 max-w-xs">
                    <div>{trx.description}</div>
                    {trx.note && <div className="text-xs text-gray-500 font-normal mt-0.5">{trx.note}</div>}
                  </td>
                  <td className="p-4 text-right font-bold text-emerald-700 whitespace-nowrap">
                    {trx.amountIn > 0 ? `+ ${trx.amountIn.toLocaleString('id-ID')}` : '-'}
                  </td>
                  <td className="p-4 text-right font-bold text-red-600 whitespace-nowrap">
                    {trx.amountOut > 0 ? `- ${trx.amountOut.toLocaleString('id-ID')}` : '-'}
                  </td>
                  <td className="p-4 text-right font-extrabold text-gray-900 whitespace-nowrap">
                    Rp {trx.balanceAfter.toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Transaction */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">Catat Transaksi Kas Baru</h3>
              <button onClick={() => setIsOpenModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Jenis Transaksi</label>
                <select
                  value={txType}
                  onChange={(e) => setTxType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                >
                  <option value="income">Pemasukan Kas (Iuran / Sumbangan)</option>
                  <option value="expense">Pengeluaran Kas (Belanja / Perbaikan)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tanggal Transaksi</label>
                <input
                  type="date"
                  required
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Rincian / Keterangan</label>
                <input
                  type="text"
                  required
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                  placeholder="Contoh: Iuran Warga Blok C"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                  placeholder="Contoh: 50000"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Catatan Tambahan (Opsional)</label>
                <input
                  type="text"
                  value={txNote}
                  onChange={(e) => setTxNote(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                  placeholder="Keterangan tambahan"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpenModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
