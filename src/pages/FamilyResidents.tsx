/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MOCK_FAMILIES, MOCK_RESIDENTS } from '../data/mockData';
import { Family, Resident, UserAccount } from '../types';
import { Users, Home, Plus, Search, ShieldCheck, Phone, Briefcase, AlertCircle, X, Edit2 } from 'lucide-react';

interface FamilyResidentsProps {
  currentUser: UserAccount;
}

export const FamilyResidents: React.FC<FamilyResidentsProps> = ({ currentUser }) => {
  const [families, setFamilies] = useState<Family[]>(MOCK_FAMILIES);
  const [residents, setResidents] = useState<Resident[]>(MOCK_RESIDENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);

  // Modal state
  const [isAddFamilyModalOpen, setIsAddFamilyModalOpen] = useState(false);
  const [newBlock, setNewBlock] = useState('B');
  const [newHouseNumber, setNewHouseNumber] = useState('10');
  const [newAddressNote, setNewAddressNote] = useState('');

  const [isAddResidentModalOpen, setIsAddResidentModalOpen] = useState(false);
  const [newResidentName, setNewResidentName] = useState('');
  const [newResidentRelation, setNewResidentRelation] = useState<'Kepala Keluarga' | 'Suami' | 'Istri' | 'Anak' | 'Saudara'>('Anak');
  const [newResidentPhone, setNewResidentPhone] = useState('');
  const [newResidentOccupation, setNewResidentOccupation] = useState('');

  const canManage = currentUser.role === 'super_admin' || currentUser.role === 'admin';

  const filteredFamilies = families.filter((f) => {
    const query = searchTerm.toLowerCase();
    const houseStr = `blok ${f.block.toLowerCase()} no ${f.houseNumber.toLowerCase()}`;
    const famResidents = residents.filter((r) => r.familyId === f.id);
    const hasResidentMatch = famResidents.some((r) => r.fullName.toLowerCase().includes(query));
    return houseStr.includes(query) || hasResidentMatch || f.block.toLowerCase().includes(query);
  });

  const handleCreateFamily = (e: React.FormEvent) => {
    e.preventDefault();
    const newFam: Family = {
      id: 'fam_' + Date.now(),
      block: newBlock,
      houseNumber: newHouseNumber,
      addressNote: newAddressNote,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setFamilies([newFam, ...families]);
    setIsAddFamilyModalOpen(false);
    setNewAddressNote('');
  };

  const handleCreateResident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFamilyId) return;

    // Validate Kepala Keluarga rule if relation is Kepala Keluarga
    if (newResidentRelation === 'Kepala Keluarga') {
      const existingKK = residents.some(
        (r) => r.familyId === selectedFamilyId && r.familyRelationship === 'Kepala Keluarga'
      );
      if (existingKK) {
        alert('Validasi Gagal: Keluarga ini sudah memiliki Kepala Keluarga. Setiap keluarga aktif harus memiliki tepat satu Kepala Keluarga.');
        return;
      }
    }

    const newRes: Resident = {
      id: 'res_' + Date.now(),
      familyId: selectedFamilyId,
      fullName: newResidentName,
      familyRelationship: newResidentRelation,
      phoneNumber: newResidentPhone || undefined,
      occupation: newResidentOccupation || undefined,
      profileVisibility: { showPhone: true, showOccupation: true },
      verificationStatus: 'verified',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setResidents([...residents, newRes]);
    setIsAddResidentModalOpen(false);
    setNewResidentName('');
    setNewResidentPhone('');
    setNewResidentOccupation('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Users className="w-6 h-6 text-emerald-600" />
            <span>Data Keluarga & Warga</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Pengelolaan data rumah, keluarga, dan anggota warga Perumahan Grand Sundara Dukuhturi.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsAddFamilyModalOpen(true)}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Data Rumah / Keluarga</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs flex items-center space-x-3">
        <Search className="w-5 h-5 text-gray-400 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari berdasarkan Blok (misal: A), Nomor Rumah (misal: 01), atau Nama Warga..."
          className="w-full bg-transparent text-sm focus:outline-hidden text-gray-900"
        />
      </div>

      {/* Families List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredFamilies.map((fam) => {
          const famResidents = residents.filter((r) => r.familyId === fam.id);
          const kepalaKeluarga = famResidents.find((r) => r.familyRelationship === 'Kepala Keluarga');

          return (
            <div
              key={fam.id}
              className="bg-white rounded-2xl border border-emerald-100 shadow-xs hover:border-emerald-300 transition-all overflow-hidden flex flex-col"
            >
              <div className="bg-emerald-50/80 px-5 py-3.5 border-b border-emerald-100 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    {fam.block}-{fam.houseNumber}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">
                      Blok {fam.block} No. {fam.houseNumber}
                    </h3>
                    {fam.addressNote && (
                      <p className="text-[11px] text-gray-500">{fam.addressNote}</p>
                    )}
                  </div>
                </div>
                <span className="bg-emerald-200/80 text-emerald-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  {famResidents.length} Anggota Warga
                </span>
              </div>

              <div className="p-5 flex-1 space-y-3">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Daftar Anggota Keluarga
                </div>

                <div className="space-y-2">
                  {famResidents.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">Belum ada anggota warga tercatat.</p>
                  ) : (
                    famResidents.map((res) => (
                      <div
                        key={res.id}
                        className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-start justify-between gap-2"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-gray-900 text-sm">{res.fullName}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                res.familyRelationship === 'Kepala Keluarga'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              {res.familyRelationship}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                            {res.occupation && (
                              <span className="flex items-center space-x-1">
                                <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                                <span>{res.occupation}</span>
                              </span>
                            )}
                            {res.phoneNumber && (
                              <span className="flex items-center space-x-1">
                                <Phone className="w-3.5 h-3.5 text-gray-400" />
                                <span>{res.phoneNumber}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded font-medium flex items-center space-x-1 shrink-0">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Terverifikasi</span>
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {canManage && (
                <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedFamilyId(fam.id);
                      setIsAddResidentModalOpen(true);
                    }}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Anggota Warga</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Add Family */}
      {isAddFamilyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">Tambah Rumah & Keluarga Baru</h3>
              <button
                onClick={() => setIsAddFamilyModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFamily} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Blok Rumah</label>
                  <select
                    value={newBlock}
                    onChange={(e) => setNewBlock(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                  >
                    <option value="A">Blok A</option>
                    <option value="B">Blok B</option>
                    <option value="C">Blok C</option>
                    <option value="D">Blok D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nomor Rumah</label>
                  <input
                    type="text"
                    required
                    value={newHouseNumber}
                    onChange={(e) => setNewHouseNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                    placeholder="01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Catatan Alamat (Opsional)</label>
                <input
                  type="text"
                  value={newAddressNote}
                  onChange={(e) => setNewAddressNote(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                  placeholder="Contoh: Dekat taman utama"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddFamilyModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md"
                >
                  Simpan Rumah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Resident */}
      {isAddResidentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">Tambah Anggota Warga</h3>
              <button
                onClick={() => setIsAddResidentModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateResident} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={newResidentName}
                  onChange={(e) => setNewResidentName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                  placeholder="Nama lengkap warga"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Hubungan Keluarga</label>
                <select
                  value={newResidentRelation}
                  onChange={(e) => setNewResidentRelation(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                >
                  <option value="Kepala Keluarga">Kepala Keluarga</option>
                  <option value="Suami">Suami</option>
                  <option value="Istri">Istri</option>
                  <option value="Anak">Anak</option>
                  <option value="Saudara">Saudara</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nomor HP (Opsional)</label>
                  <input
                    type="text"
                    value={newResidentPhone}
                    onChange={(e) => setNewResidentPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                    placeholder="0812..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Pekerjaan</label>
                  <input
                    type="text"
                    value={newResidentOccupation}
                    onChange={(e) => setNewResidentOccupation(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                    placeholder="Pekerjaan"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddResidentModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md"
                >
                  Simpan Warga
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
