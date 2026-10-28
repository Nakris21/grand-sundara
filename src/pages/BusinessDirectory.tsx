/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BusinessListing, UserAccount } from '../types';
import {
  Store,
  Search,
  Plus,
  MessageSquare,
  ExternalLink,
  ShieldCheck,
  X,
  CheckCircle2,
  Clock,
  Eye,
  Check,
  Ban,
  Filter,
} from 'lucide-react';
import { getBusinessListings, saveBusinessListing, getDataMode } from '../services/dataAdapter';
import { recordAuditLog } from '../services/firebase';

interface BusinessDirectoryProps {
  currentUser: UserAccount;
}

export const BusinessDirectory: React.FC<BusinessDirectoryProps> = ({ currentUser }) => {
  const [businesses, setBusinesses] = useState<BusinessListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState<'directory' | 'moderation'>('directory');

  // Detail modal state
  const [selectedBiz, setSelectedBiz] = useState<BusinessListing | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Add modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bizName, setBizName] = useState('');
  const [bizCategory, setBizCategory] = useState('Makanan dan Minuman');
  const [bizDesc, setBizDesc] = useState('');
  const [bizProducts, setBizProducts] = useState('');
  const [bizWa, setBizWa] = useState('');
  const [bizSocial, setBizSocial] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);

  const dataMode = getDataMode();
  const isAdminOrSuper = currentUser.role === 'super_admin' || currentUser.role === 'admin';

  const categories = [
    'All',
    'Makanan dan Minuman',
    'Kue dan Camilan',
    'Fashion dan Pakaian',
    'Jasa dan Keterampilan',
    'Kesehatan dan Kecantikan',
    'Perdagangan',
    'Pendidikan dan Kursus',
    'Kerajinan',
    'Pertanian dan Peternakan',
    'Lainnya',
  ];

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const items = await getBusinessListings();
        setBusinesses(items);
      } catch (err) {
        console.error('Error loading business listings:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredBusinesses = businesses.filter((b) => {
    const matchCat = selectedCategory === 'All' || b.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchSearch =
      b.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.description && b.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // For residents, only show published status (or approved for backward compatibility)
    const isPublished = b.status === 'published' || b.status === 'approved';
    const isVisible = isPublished || isAdminOrSuper;

    return matchCat && matchSearch && isVisible;
  });

  const pendingBusinesses = businesses.filter((b) => b.status === 'pending' || b.status === 'pending_review');

  const handleAddBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentChecked) {
      alert('Anda harus menyetujui publikasi informasi usaha kepada warga.');
      return;
    }

    const newBiz: BusinessListing = {
      id: 'biz_' + Date.now(),
      ownerResidentId: currentUser.residentId || 'res_1',
      businessName: bizName.trim(),
      category: bizCategory,
      description: bizDesc.trim(),
      whatsappNumber: bizWa.trim() || undefined,
      socialUrl: bizSocial.trim() || undefined,
      status: 'pending', // pending review
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveBusinessListing(newBiz);
      await recordAuditLog(currentUser.id, 'CREATE_BUSINESS', 'business_listing', newBiz.id, {
        businessName: bizName,
      });
      setBusinesses([newBiz, ...businesses]);
      setIsModalOpen(false);
      setBizName('');
      setBizDesc('');
      setBizProducts('');
      setBizWa('');
      setBizSocial('');
      setConsentChecked(false);
      showToast('Pendaftaran usaha berhasil diajukan dan menunggu persetujuan (moderasi) admin.');
    } catch (err: any) {
      alert('Gagal mengajukan usaha: ' + (err.message || err));
    }
  };

  const handleUpdateStatus = async (biz: BusinessListing, newStatus: 'published' | 'rejected' | 'archived') => {
    try {
      const updated: BusinessListing = {
        ...biz,
        status: newStatus === 'published' ? 'approved' : newStatus, // support 'approved' mapping
        updatedAt: new Date().toISOString(),
      };
      await saveBusinessListing(updated);
      await recordAuditLog(currentUser.id, 'MODERATE_BUSINESS', 'business_listing', biz.id, {
        status: newStatus,
      });
      setBusinesses(businesses.map((b) => (b.id === biz.id ? updated : b)));
      showToast(`Status usaha berhasil diubah menjadi: ${newStatus}`);
    } catch (err: any) {
      alert('Gagal memoderasi usaha: ' + (err.message || err));
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500 text-sm">
        Memuat direktori usaha warga ({dataMode.toUpperCase()})...
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
            <Store className="w-6 h-6 text-emerald-600" />
            <span>Direktori Usaha Warga (UMKM)</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Dukung usaha tetangga kita di Perumahan Grand Sundara Dukuhturi. Sumber Data: <strong className="uppercase text-emerald-700">{dataMode}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {isAdminOrSuper && pendingBusinesses.length > 0 && (
            <button
              onClick={() => setActiveTab(activeTab === 'moderation' ? 'directory' : 'moderation')}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md transition-all"
            >
              <Clock className="w-4 h-4" />
              <span>Moderasi ({pendingBusinesses.length})</span>
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Daftarkan Usaha Saya</span>
          </button>
        </div>
      </div>

      {/* Tabs for Admin Moderation */}
      {isAdminOrSuper && (
        <div className="flex items-center space-x-3 border-b border-gray-200 pb-2">
          <button
            onClick={() => setActiveTab('directory')}
            className={`pb-2 px-4 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'directory'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Direktori Publik ({filteredBusinesses.length})
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className={`pb-2 px-4 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'moderation'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Menunggu Persetujuan ({pendingBusinesses.length})
          </button>
        </div>
      )}

      {activeTab === 'directory' ? (
        <>
          {/* Filter & Search */}
          <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-bold text-gray-700 flex items-center space-x-1 shrink-0">
                <Filter className="w-3.5 h-3.5 text-emerald-600" />
                <span>Kategori:</span>
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    selectedCategory === cat ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'All' ? 'Semua Kategori' : cat}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 w-full sm:w-72 shrink-0">
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
            {filteredBusinesses.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-400 italic">
                Belum ada usaha warga yang terdaftar atau disetujui dalam kategori ini.
              </div>
            ) : (
              filteredBusinesses.map((biz) => {
                const isApproved = biz.status === 'approved' || biz.status === 'published';
                return (
                  <div
                    key={biz.id}
                    className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          {biz.category}
                        </span>
                        {(biz.status === 'pending' || biz.status === 'pending_review') && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                            Menunggu Moderasi
                          </span>
                        )}
                        {isApproved && (
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
                      <button
                        onClick={() => {
                          setSelectedBiz(biz);
                          setIsDetailModalOpen(true);
                        }}
                        className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold transition-colors inline-flex items-center space-x-1.5"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Detail</span>
                      </button>

                      {isApproved && biz.whatsappNumber && (
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
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        /* Admin Moderation Tab */
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-xs overflow-hidden">
          <div className="p-4 bg-emerald-50 border-b border-emerald-100 font-bold text-xs text-emerald-900 uppercase">
            Pendaftaran Usaha Menunggu Persetujuan ({pendingBusinesses.length})
          </div>
          <div className="divide-y divide-gray-100">
            {pendingBusinesses.length === 0 ? (
              <div className="p-8 text-center text-gray-400 italic text-sm">
                Tidak ada pendaftaran usaha yang menunggu moderasi.
              </div>
            ) : (
              pendingBusinesses.map((biz) => (
                <div key={biz.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-900 text-base">{biz.businessName}</span>
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                        {biz.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{biz.description}</p>
                    {biz.whatsappNumber && <p className="text-xs text-gray-500">Kontak WA: {biz.whatsappNumber}</p>}
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleUpdateStatus(biz, 'published')}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Setujui & Terbitkan</span>
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(biz, 'rejected')}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-semibold"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Tolak</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal Detail Business */}
      {isDetailModalOpen && selectedBiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  {selectedBiz.category}
                </span>
                <h3 className="font-bold text-gray-900 text-lg mt-1">{selectedBiz.businessName}</h3>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-gray-700">
              <div>
                <span className="font-bold text-gray-900 block mb-1">Deskripsi Usaha:</span>
                <p className="leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">{selectedBiz.description}</p>
              </div>

              {selectedBiz.whatsappNumber && (
                <div>
                  <span className="font-bold text-gray-900 block mb-1">Kontak WhatsApp:</span>
                  <a
                    href={`https://wa.me/${selectedBiz.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Hubungi via WhatsApp ({selectedBiz.whatsappNumber})</span>
                  </a>
                </div>
              )}

              {selectedBiz.socialUrl && (
                <div>
                  <span className="font-bold text-gray-900 block mb-1">Tautan Media Sosial / Katalog:</span>
                  <a
                    href={selectedBiz.socialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 hover:underline inline-flex items-center space-x-1 break-all"
                  >
                    <span>{selectedBiz.socialUrl}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Business */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">Daftarkan Usaha Warga</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBusiness} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Usaha *</label>
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Kategori Usaha *</label>
                <select
                  value={bizCategory}
                  onChange={(e) => setBizCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                >
                  {categories
                    .filter((c) => c !== 'All')
                    .map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Deskripsi Singkat *</label>
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nomor WhatsApp (Opsional)</label>
                <input
                  type="text"
                  value={bizWa}
                  onChange={(e) => setBizWa(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                  placeholder="628123456789"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tautan Media Sosial / Katalog (Opsional)</label>
                <input
                  type="url"
                  value={bizSocial}
                  onChange={(e) => setBizSocial(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                  placeholder="https://instagram.com/namausaha"
                />
              </div>

              <div className="flex items-start space-x-2 pt-2">
                <input
                  type="checkbox"
                  required
                  id="consent"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="consent" className="text-xs text-gray-600 leading-tight">
                  Saya menyetujui informasi usaha ini ditampilkan kepada warga Perumahan Grand Sundara setelah disetujui admin.
                </label>
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
