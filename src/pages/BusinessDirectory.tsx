/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MOCK_BUSINESS_LISTINGS } from '../data/mockData';
import { BusinessListing, UserAccount } from '../types';
import { Store, Search, Plus, MessageSquare, ExternalLink, ShieldCheck, X } from 'lucide-react';

interface BusinessDirectoryProps {
  currentUser: UserAccount;
}

export const BusinessDirectory: React.FC<BusinessDirectoryProps> = ({ currentUser }) => {
  const [businesses, setBusinesses] = useState<BusinessListing[]>(MOCK_BUSINESS_LISTINGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Add modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bizName, setBizName] = useState('');
  const [bizCategory, setBizCategory] = useState('Kuliner');
  const [bizDesc, setBizDesc] = useState('');
  const [bizWa, setBizWa] = useState('');
  const [bizSocial, setBizSocial] = useState('');

  const categories = ['All', 'Kuliner', 'Jasa', 'Teknisi / Jasa', 'Retail'];

  const filteredBusinesses = businesses.filter((b) => {
    const matchCat = selectedCategory === 'All' || b.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchSearch = b.businessName.toLowerCase().includes(searchTerm.toLowerCase()) || (b.description && b.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const isVisible = b.status === 'approved' || currentUser.role === 'super_admin' || currentUser.role === 'admin';
    return matchCat && matchSearch && isVisible;
  });

  const handleAddBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    const newBiz: BusinessListing = {
      id: 'biz_' + Date.now(),
      ownerResidentId: currentUser.residentId || 'res_1',
      businessName: bizName,
      category: bizCategory,
      description: bizDesc,
      whatsappNumber: bizWa || undefined,
      socialUrl: bizSocial || undefined,
      status: 'pending', // Requires admin approval per FRD
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setBusinesses([newBiz, ...businesses]);
    setIsModalOpen(false);
    setBizName('');
    setBizDesc('');
    setBizWa('');
    setBizSocial('');
    alert('Pengajuan usaha berhasil dikirim dan menunggu persetujuan (moderasi) admin.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Store className="w-6 h-6 text-emerald-600" />
            <span>Direktori Usaha Warga (UMKM)</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Dukung usaha tetangga kita di Perumahan Grand Sundara Dukuhturi. Mari tumbuh dan maju bersama.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Daftarkan Usaha Saya</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat === 'All' ? 'Semua Kategori' : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama usaha..."
            className="w-full bg-transparent text-xs focus:outline-hidden text-gray-900"
          />
        </div>
      </div>

      {/* Business Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBusinesses.map((biz) => (
          <div
            key={biz.id}
            className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  {biz.category}
                </span>
                {biz.status === 'pending' && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                    Menunggu Moderasi
                  </span>
                )}
                {biz.status === 'approved' && (
                  <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Terverifikasi</span>
                  </span>
                )}
              </div>

              <h3 className="font-bold text-gray-900 text-base">{biz.businessName}</h3>
              <p className="text-xs text-gray-600 line-clamp-3">{biz.description}</p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center space-x-2">
              {biz.whatsappNumber && (
                <a
                  href={`https://wa.me/${biz.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              )}
              {biz.socialUrl && (
                <a
                  href={biz.socialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                  title="Media Sosial"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Business */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">Daftarkan Usaha Warga</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBusiness} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Usaha</label>
                <input
                  type="text"
                  required
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                  placeholder="Contoh: Dapur Sundara"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Kategori</label>
                <select
                  value={bizCategory}
                  onChange={(e) => setBizCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                >
                  <option value="Kuliner">Kuliner</option>
                  <option value="Jasa">Jasa</option>
                  <option value="Teknisi / Jasa">Teknisi / Jasa</option>
                  <option value="Retail">Retail</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  required
                  rows={3}
                  value={bizDesc}
                  onChange={(e) => setBizDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                  placeholder="Jelaskan produk atau layanan usaha Anda..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nomor WhatsApp (Format: 628...)</label>
                <input
                  type="text"
                  value={bizWa}
                  onChange={(e) => setBizWa(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                  placeholder="628123456789"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tautan Media Sosial / Instagram (Opsional)</label>
                <input
                  type="url"
                  value={bizSocial}
                  onChange={(e) => setBizSocial(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                  placeholder="https://instagram.com/namausaha"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md"
                >
                  Ajukan Pendaftaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
