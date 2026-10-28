/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  MOCK_FAMILIES,
  MOCK_RESIDENTS,
  MOCK_CASH_TRANSACTIONS,
  MOCK_CASH_SETTINGS,
  MOCK_ANNOUNCEMENTS,
  MOCK_EVENTS,
  MOCK_BUSINESS_LISTINGS,
} from '../data/mockData';
import { ActivePage, UserAccount } from '../types';
import {
  Home,
  Users,
  Wallet,
  Calendar,
  Bell,
  Store,
  ArrowRight,
  Info,
  CheckCircle2,
  MapPin,
  ExternalLink,
} from 'lucide-react';

interface DashboardProps {
  currentUser: UserAccount;
  onNavigate: (page: ActivePage) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ currentUser, onNavigate }) => {
  // Calculate total balance
  const totalIncome = MOCK_CASH_TRANSACTIONS.reduce((acc, t) => acc + t.amountIn, 0);
  const totalExpense = MOCK_CASH_TRANSACTIONS.reduce((acc, t) => acc + t.amountOut, 0);
  const currentBalance = MOCK_CASH_SETTINGS.openingBalance + totalIncome - totalExpense;

  const publishedAnnouncements = MOCK_ANNOUNCEMENTS.filter((a) => a.status === 'published');
  const upcomingEvents = MOCK_EVENTS.filter((e) => e.status === 'published');
  const approvedBusinesses = MOCK_BUSINESS_LISTINGS.filter((b) => b.status === 'approved');

  return (
    <div className="space-y-6">
      {/* Banner Data Contoh */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3 text-amber-900 shadow-xs">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm">
          <span className="font-bold">Informasi Data Contoh:</span> Anda sedang melihat portal <strong className="font-semibold">Grand Sundara Digital</strong> menggunakan <em>Data Contoh</em> warga Perumahan Grand Sundara Dukuhturi. Belum tersimpan di database produksi Firebase sebelum integrasi diaktifkan.
        </div>
      </div>

      {/* Welcome Hero */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-green-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-600/20 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <span className="bg-emerald-600/60 text-yellow-300 px-3 py-1 rounded-full text-xs font-semibold inline-block mb-3 border border-emerald-500/40">
            Selamat Datang, {currentUser.fullName}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Portal Warga Grand Sundara Dukuhturi
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base mt-2 max-w-2xl">
            Menyatukan warga dalam semangat gotong royong, guyub rukun, dan seduluran. Pantau kas, data keluarga, direktori usaha, dan kegiatan warga dengan mudah.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => onNavigate('siteplan')}
              className="bg-yellow-400 hover:bg-yellow-500 text-emerald-950 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center space-x-2"
            >
              <MapPin className="w-4 h-4" />
              <span>Lihat Siteplan Perumahan</span>
            </button>
            <button
              onClick={() => onNavigate('cash')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center space-x-2 border border-emerald-500"
            >
              <Wallet className="w-4 h-4" />
              <span>Periksa Kas Paguyuban</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('families')}
          className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Home className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Data Contoh
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">{MOCK_FAMILIES.length} Rumah</div>
            <p className="text-xs text-gray-500 mt-0.5">Keluarga terdaftar</p>
          </div>
        </div>

        <div
          onClick={() => onNavigate('families')}
          className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
              Data Contoh
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">{MOCK_RESIDENTS.length} Warga</div>
            <p className="text-xs text-gray-500 mt-0.5">Anggota keluarga aktif</p>
          </div>
        </div>

        <div
          onClick={() => onNavigate('cash')}
          className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              Transparan
            </span>
          </div>
          <div className="mt-4">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">
              Rp {currentBalance.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Saldo Kas Paguyuban</p>
          </div>
        </div>

        <div
          onClick={() => onNavigate('businesses')}
          className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <Store className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
              UMKM Warga
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">{approvedBusinesses.length} Usaha</div>
            <p className="text-xs text-gray-500 mt-0.5">Direktori terdaftar</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Announcements & Events */}
        <div className="lg:col-span-2 space-y-6">
          {/* Announcements */}
          <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center space-x-2">
                <Bell className="w-5 h-5 text-emerald-600" />
                <span>Pengumuman Terbaru</span>
              </h2>
              <button
                onClick={() => onNavigate('announcements')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {publishedAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 hover:bg-emerald-50 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span className="font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      Pengumuman Resmi
                    </span>
                    <span>{new Date(ann.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1">{ann.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{ann.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <span>Agenda Kegiatan Terdekat</span>
              </h2>
              <button
                onClick={() => onNavigate('events')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {upcomingEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-300 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block">
                      {new Date(ev.eventDate).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm">{ev.title}</h3>
                    <p className="text-xs text-gray-500">{ev.location}</p>
                  </div>
                  {ev.instagramUrl && (
                    <a
                      href={ev.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-lg text-xs font-semibold transition-colors shrink-0"
                    >
                      <span>Dokumentasi IG</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Quick Links & Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-xs">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Modul & Navigasi Cepat</span>
            </h2>

            <div className="space-y-2">
              <button
                onClick={() => onNavigate('families')}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-emerald-50 text-gray-700 text-xs sm:text-sm font-medium transition-colors border border-gray-100"
              >
                <div className="flex items-center space-x-2.5">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Data Keluarga & Warga</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={() => onNavigate('siteplan')}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-emerald-50 text-gray-700 text-xs sm:text-sm font-medium transition-colors border border-gray-100"
              >
                <div className="flex items-center space-x-2.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Siteplan Perumahan</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={() => onNavigate('cash')}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-emerald-50 text-gray-700 text-xs sm:text-sm font-medium transition-colors border border-gray-100"
              >
                <div className="flex items-center space-x-2.5">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  <span>Kas Paguyuban</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={() => onNavigate('businesses')}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-emerald-50 text-gray-700 text-xs sm:text-sm font-medium transition-colors border border-gray-100"
              >
                <div className="flex items-center space-x-2.5">
                  <Store className="w-4 h-4 text-emerald-600" />
                  <span>Direktori Usaha Warga</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="bg-emerald-900 rounded-2xl p-6 text-white shadow-md">
            <h3 className="font-bold text-sm tracking-wide mb-2 text-yellow-300">
              Nilai Luhur Warga
            </h3>
            <p className="text-xs text-emerald-100 leading-relaxed">
              &ldquo;Gotong royong meringankan yang berat, guyub rukun mendamaikan hati, seduluran menyatukan langkah kita di Grand Sundara.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
