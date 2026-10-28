/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MOCK_CASH_SETTINGS } from '../data/mockData';
import { CashTransaction, UserAccount } from '../types';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Info,
  Search,
  X,
  CheckCircle2,
  Calendar,
  Filter,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { getCashTransactions, saveCashTransaction, getDataMode } from '../services/dataAdapter';
import { recordAuditLog } from '../services/firebase';

interface CashManagementProps {
  currentUser: UserAccount;
}

export const CashManagement: React.FC<CashManagementProps> = ({ currentUser }) => {
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters & Period
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'this_month' | 'last_month' | 'this_year'>('this_month');
  const [searchTerm, setSearchTerm] = useState('');

  // Add transaction modal state
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [txType, setTxType] = useState<'income' | 'expense'>('income');
  const [txCategory, setTxCategory] = useState('Iuran warga');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txDesc, setTxDesc] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txNote, setTxNote] = useState('');

  const dataMode = getDataMode();
  const canManageCash = currentUser.role === 'super_admin' || currentUser.role === 'admin' || currentUser.role === 'bendahara';

  const incomeCategories = [
    'Iuran warga',
    'Sumbangan',
    'Pengembalian dana',
    'Pendapatan kegiatan',
    'Pemasukan lainnya',
  ];

  const expenseCategories = [
    'Kebersihan',
    'Keamanan',
    'Perawatan lingkungan',
    'Kegiatan warga',
    'Operasional paguyuban',
    'Pengeluaran lainnya',
  ];

  useEffect(() => {
    async function loadTransactions() {
      setIsLoading(true);
      try {
        const txs = await getCashTransactions();
        setTransactions(txs);
      } catch (err) {
        console.error('Error loading cash transactions:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTransactions();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter by Period
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const periodFilteredTxs = transactions.filter((t) => {
    if (t.status === 'voided') return false; // Exclude voided transactions from active totals
    const d = new Date(t.transactionDate);
    const m = d.getMonth();
    const y = d.getFullYear();

    if (periodFilter === 'this_month') {
      return m === currentMonth && y === currentYear;
    }
    if (periodFilter === 'last_month') {
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return m === lastMonth && y === lastMonthYear;
    }
    if (periodFilter === 'this_year') {
      return y === currentYear;
    }
    return true;
  });

  const totalIncome = periodFilteredTxs.reduce((acc, t) => acc + t.amountIn, 0);
  const totalExpense = periodFilteredTxs.reduce((acc, t) => acc + t.amountOut, 0);
  
  // Overall running balance calculation from all published transactions
  const publishedAll = transactions.filter((t) => t.status !== 'voided');
  const overallIncome = publishedAll.reduce((acc, t) => acc + t.amountIn, 0);
  const overallExpense = publishedAll.reduce((acc, t) => acc + t.amountOut, 0);
  const currentBalance = MOCK_CASH_SETTINGS.openingBalance + overallIncome - overallExpense;

  const filteredTransactions = transactions.filter((t) => {
    const matchType = filterType === 'all' || t.transactionType === filterType;
    const matchSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.note && t.note.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchType && matchSearch;
  });

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(txAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Nominal harus berupa angka positif lebih besar dari 0.');
      return;
    }

    setIsSubmitting(true);
    const amountIn = txType === 'income' ? amountNum : 0;
    const amountOut = txType === 'expense' ? amountNum : 0;
    const latestBalance =
      transactions.length > 0 ? transactions[transactions.length - 1].balanceAfter : MOCK_CASH_SETTINGS.openingBalance;
    const balanceAfter = txType === 'income' ? latestBalance + amountNum : latestBalance - amountNum;

    const newTx: CashTransaction = {
      id: 'trx_' + Date.now(),
      transactionDate: txDate,
      transactionType: txType,
      description: `[${txCategory}] ${txDesc}`,
      amountIn,
      amountOut,
      balanceAfter,
      note: txNote || undefined,
      status: 'published',
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveCashTransaction(newTx);
      await recordAuditLog(currentUser.id, 'CREATE_TRANSACTION', 'cash_transaction', newTx.id, {
        type: txType,
        category: txCategory,
        amount: amountNum,
      });
      setTransactions([...transactions, newTx]);
      setIsOpenModal(false);
      setTxDesc('');
      setTxAmount('');
      setTxNote('');
      showToast('Transaksi kas berhasil dicatat dan disimpan secara permanen!');
    } catch (err: any) {
      alert('Gagal menyimpan transaksi: ' + (err.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoidTransaction = async (trx: CashTransaction) => {
    if (!canManageCash) return;
    if (window.confirm(`Batalkan (Void) transaksi: "${trx.description}"? Transaksi yang dibatalkan tidak akan dihitung dalam saldo aktif.`)) {
      try {
        const voidedTx: CashTransaction = { ...trx, status: 'voided', updatedAt: new Date().toISOString() };
        await saveCashTransaction(voidedTx);
        await recordAuditLog(currentUser.id, 'VOID_TRANSACTION', 'cash_transaction', trx.id);
        setTransactions(transactions.map((t) => (t.id === trx.id ? voidedTx : t)));
        showToast('Transaksi berhasil dibatalkan (void).');
      } catch (err: any) {
        alert('Gagal membatalkan transaksi: ' + (err.message || err));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500 text-sm">
        Memuat data kas paguyuban ({dataMode.toUpperCase()})...
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-800 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border border-emerald-600 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-yellow-300 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Wallet className="w-6 h-6 text-emerald-600" />
            <span>Kas Paguyuban Warga Grand Sundara</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Transparansi keuangan dan pencatatan kas masuk & keluar. Sumber Data: <strong className="uppercase text-emerald-700">{dataMode}</strong>
          </p>
        </div>

        {canManageCash && (
          <button
            onClick={() => {
              setTxCategory(txType === 'income' ? incomeCategories[0] : expenseCategories[0]);
              setIsOpenModal(true);
            }}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Transaksi Kas</span>
          </button>
        )}
      </div>

      {/* Period Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold text-gray-700">Periode Ringkasan:</span>
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value as any)}
            className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-900"
          >
            <option value="this_month">Bulan Ini</option>
            <option value="last_month">Bulan Sebelumnya</option>
            <option value="this_year">Tahun Ini</option>
            <option value="all">Semua Waktu</option>
          </select>
        </div>

        <div className="text-xs text-gray-500 font-medium">
          Menampilkan ringkasan dari <span className="font-bold text-gray-900">{periodFilteredTxs.length} transaksi</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs">
          <div className="text-xs font-semibold text-gray-500">Saldo Akhir Keseluruhan</div>
          <div className="text-xl font-bold text-gray-900 mt-1">
            Rp {currentBalance.toLocaleString('id-ID')}
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs">
          <div className="text-xs font-semibold text-emerald-700">Total Pemasukan (Periode Ini)</div>
          <div className="text-xl font-bold text-emerald-800 mt-1">
            + Rp {totalIncome.toLocaleString('id-ID')}
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs">
          <div className="text-xs font-semibold text-red-600">Total Pengeluaran (Periode Ini)</div>
          <div className="text-xl font-bold text-red-700 mt-1">
            - Rp {totalExpense.toLocaleString('id-ID')}
          </div>
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
                {canManageCash && <th className="p-4 text-center">Status / Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 italic">
                    Belum ada riwayat transaksi kas yang tercatat.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((trx) => {
                  const isVoided = trx.status === 'voided';
                  return (
                    <tr
                      key={trx.id}
                      className={`hover:bg-emerald-50/30 transition-colors ${isVoided ? 'opacity-50 bg-gray-50 line-through' : ''}`}
                    >
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
                        {!isVoided && trx.amountIn > 0 ? `+ Rp ${trx.amountIn.toLocaleString('id-ID')}` : '-'}
                      </td>
                      <td className="p-4 text-right font-bold text-red-600 whitespace-nowrap">
                        {!isVoided && trx.amountOut > 0 ? `- Rp ${trx.amountOut.toLocaleString('id-ID')}` : '-'}
                      </td>
                      <td className="p-4 text-right font-extrabold text-gray-900 whitespace-nowrap">
                        Rp {trx.balanceAfter.toLocaleString('id-ID')}
                      </td>
                      {canManageCash && (
                        <td className="p-4 text-center whitespace-nowrap">
                          {isVoided ? (
                            <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">Dibatalkan</span>
                          ) : (
                            <button
                              onClick={() => handleVoidTransaction(trx)}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold"
                            >
                              Batalkan
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
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
                  onChange={(e) => {
                    const t = e.target.value as 'income' | 'expense';
                    setTxType(t);
                    setTxCategory(t === 'income' ? incomeCategories[0] : expenseCategories[0]);
                  }}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                >
                  <option value="income">Pemasukan Kas</option>
                  <option value="expense">Pengeluaran Kas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Kategori Transaksi</label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                >
                  {txType === 'income'
                    ? incomeCategories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))
                    : expenseCategories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
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
                  placeholder="Contoh: Iuran Warga Blok C05"
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
                  placeholder="Catatan tambahan"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsOpenModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
