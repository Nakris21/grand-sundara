/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Family, Resident, UserAccount, FamilyRelationship } from '../types';
import {
  Users,
  Home,
  Plus,
  Search,
  ShieldCheck,
  Phone,
  Briefcase,
  AlertCircle,
  X,
  Edit2,
  Eye,
  CheckCircle2,
  Filter,
  Database,
} from 'lucide-react';
import {
  getFamilies,
  saveFamily,
  getResidents,
  saveResident,
  getDataMode,
} from '../services/dataAdapter';
import { recordAuditLog } from '../services/firebase';

interface FamilyResidentsProps {
  currentUser: UserAccount;
}

export const FamilyResidents: React.FC<FamilyResidentsProps> = ({ currentUser }) => {
  const [families, setFamilies] = useState<Family[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const dataMode = getDataMode();

  // Load data via centralized data adapter on mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const fams = await getFamilies();
        const resps = await getResidents();
        setFamilies(fams);
        setResidents(resps);
      } catch (err) {
        console.error('Error loading families/residents:', err);
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

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [blockFilter, setBlockFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active');

  // Selected family detail modal
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Add/Edit Family Modal
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState<Family | null>(null);
  const [formBlock, setFormBlock] = useState('A');
  const [formHouseNumber, setFormHouseNumber] = useState('');
  const [formAddressNote, setFormAddressNote] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');

  // Add/Edit Resident Modal
  const [isResidentModalOpen, setIsResidentModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [targetFamilyId, setTargetFamilyId] = useState('');
  const [resFullName, setResFullName] = useState('');
  const [resBirthPlace, setResBirthPlace] = useState('');
  const [resBirthDate, setResBirthDate] = useState('');
  const [resOccupation, setResOccupation] = useState('');
  const [resPhone, setResPhone] = useState('');
  const [resRelationship, setResRelationship] = useState<FamilyRelationship>('Anak');

  const canManage = currentUser.role === 'super_admin' || currentUser.role === 'admin';
  const isResidentRole = currentUser.role === 'resident';

  const activeFamiliesCount = families.filter((f) => f.status === 'active').length;

  const filteredFamilies = families.filter((f) => {
    const matchesBlock = blockFilter === 'All' || f.block === blockFilter;
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;

    const famResidents = residents.filter((r) => r.familyId === f.id);
    const houseStr = `blok ${f.block.toLowerCase()} no ${f.houseNumber.toLowerCase()}`;
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      houseStr.includes(query) ||
      f.block.toLowerCase().includes(query) ||
      f.houseNumber.includes(query) ||
      famResidents.some((r) => r.fullName.toLowerCase().includes(query));

    return matchesBlock && matchesStatus && matchesSearch;
  });

  const handleOpenCreateFamily = () => {
    setEditingFamily(null);
    setFormBlock('A');
    setFormHouseNumber('');
    setFormAddressNote('');
    setFormStatus('active');
    setIsFamilyModalOpen(true);
  };

  const handleOpenEditFamily = (fam: Family) => {
    setEditingFamily(fam);
    setFormBlock(fam.block);
    setFormHouseNumber(fam.houseNumber);
    setFormAddressNote(fam.addressNote || '');
    setFormStatus(fam.status);
    setIsFamilyModalOpen(true);
  };

  const handleSaveFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formHouseNumber.trim()) {
      alert('Nomor rumah wajib diisi.');
      return;
    }

    const duplicate = families.find(
      (f) =>
        f.block.toUpperCase() === formBlock.toUpperCase() &&
        f.houseNumber.trim() === formHouseNumber.trim() &&
        (!editingFamily || f.id !== editingFamily.id)
    );

    if (duplicate) {
      alert(`Gagal: Rumah dengan Blok ${formBlock} Nomor ${formHouseNumber} sudah terdaftar.`);
      return;
    }

    try {
      if (editingFamily) {
        const updatedFam: Family = {
          ...editingFamily,
          block: formBlock.toUpperCase(),
          houseNumber: formHouseNumber.trim(),
          addressNote: formAddressNote.trim(),
          status: formStatus,
          updatedAt: new Date().toISOString(),
        };
        await saveFamily(updatedFam);
        setFamilies(families.map((f) => (f.id === updatedFam.id ? updatedFam : f)));
        await recordAuditLog(currentUser.id, 'UPDATE_FAMILY', 'family', updatedFam.id);
        showToast(`Berhasil memperbarui data keluarga (${dataMode.toUpperCase()})!`);
      } else {
        const newFam: Family = {
          id: 'fam_' + Date.now(),
          block: formBlock.toUpperCase(),
          houseNumber: formHouseNumber.trim(),
          addressNote: formAddressNote.trim(),
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await saveFamily(newFam);
        setFamilies([newFam, ...families]);
        await recordAuditLog(currentUser.id, 'CREATE_FAMILY', 'family', newFam.id);
        showToast(`Berhasil menyimpan keluarga baru (${dataMode.toUpperCase()})!`);
      }
      setIsFamilyModalOpen(false);
    } catch (err: any) {
      alert('Gagal menyimpan data keluarga: ' + (err.message || err));
    }
  };

  const handleOpenCreateResident = (famId: string) => {
    setEditingResident(null);
    setTargetFamilyId(famId);
    setResFullName('');
    setResBirthPlace('');
    setResBirthDate('');
    setResOccupation('');
    setResPhone('');
    setResRelationship('Anak');
    setIsResidentModalOpen(true);
  };

  const handleOpenEditResident = (res: Resident) => {
    setEditingResident(res);
    setTargetFamilyId(res.familyId);
    setResFullName(res.fullName);
    setResBirthPlace(res.birthPlace || '');
    setResBirthDate(res.birthDate || '');
    setResOccupation(res.occupation || '');
    setResPhone(res.phoneNumber || '');
    setResRelationship(res.familyRelationship);
    setIsResidentModalOpen(true);
  };

  const handleSaveResident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resFullName.trim()) {
      alert('Nama lengkap warga wajib diisi.');
      return;
    }

    if (resRelationship === 'Kepala Keluarga') {
      const existingKK = residents.find(
        (r) =>
          r.familyId === targetFamilyId &&
          r.familyRelationship === 'Kepala Keluarga' &&
          (!editingResident || r.id !== editingResident.id)
      );
      if (existingKK) {
        alert(
          `Validasi Gagal: Keluarga ini sudah memiliki Kepala Keluarga (${existingKK.fullName}). Setiap keluarga aktif hanya boleh memiliki satu Kepala Keluarga.`
        );
        return;
      }
    }

    try {
      if (editingResident) {
        if (isResidentRole && editingResident.linkedUserId !== currentUser.id && !canManage) {
          alert('Anda hanya diizinkan memperbarui profil milik Anda sendiri.');
          return;
        }

        const updatedRes: Resident = {
          ...editingResident,
          fullName: resFullName.trim(),
          birthPlace: resBirthPlace.trim() || undefined,
          birthDate: resBirthDate.trim() || undefined,
          occupation: resOccupation.trim() || undefined,
          phoneNumber: resPhone.trim() || undefined,
          familyRelationship: resRelationship,
          updatedAt: new Date().toISOString(),
        };
        await saveResident(updatedRes);
        setResidents(residents.map((r) => (r.id === updatedRes.id ? updatedRes : r)));
        await recordAuditLog(currentUser.id, 'UPDATE_RESIDENT', 'resident', updatedRes.id);
        showToast(`Berhasil memperbarui data warga (${dataMode.toUpperCase()})!`);
      } else {
        const newRes: Resident = {
          id: 'res_' + Date.now(),
          familyId: targetFamilyId,
          fullName: resFullName.trim(),
          birthPlace: resBirthPlace.trim() || undefined,
          birthDate: resBirthDate.trim() || undefined,
          occupation: resOccupation.trim() || undefined,
          phoneNumber: resPhone.trim() || undefined,
          familyRelationship: resRelationship,
          profileVisibility: { showPhone: true, showOccupation: true },
          verificationStatus: 'verified',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await saveResident(newRes);
        setResidents([...residents, newRes]);
        await recordAuditLog(currentUser.id, 'CREATE_RESIDENT', 'resident', newRes.id);
        showToast(`Berhasil menyimpan data warga baru (${dataMode.toUpperCase()})!`);
      }
      setIsResidentModalOpen(false);
    } catch (err: any) {
      alert('Gagal menyimpan data warga: ' + (err.message || err));
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500 text-sm">
        Memuat data keluarga dan warga dari adapter penyimpanan ({dataMode.toUpperCase()})...
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
            <Users className="w-6 h-6 text-emerald-600" />
            <span>Manajemen Data Keluarga & Warga</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Sumber Data Aktif: <strong className="text-emerald-700 uppercase">{dataMode}</strong>
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenCreateFamily}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Rumah / Keluarga Baru</span>
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs">
          <div className="text-xs font-semibold text-gray-500">Total Keluarga Aktif</div>
          <div className="text-2xl font-bold text-emerald-800 mt-1">{activeFamiliesCount} Keluarga</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs">
          <div className="text-xs font-semibold text-gray-500">Total Anggota Warga</div>
          <div className="text-2xl font-bold text-emerald-800 mt-1">{residents.length} Warga</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs">
          <div className="text-xs font-semibold text-emerald-700">Mode Penyimpanan</div>
          <div className="text-sm font-bold text-gray-900 mt-1 uppercase">{dataMode} Storage</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-gray-700 flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            <span>Blok:</span>
          </span>
          {['All', 'A', 'B', 'C', 'D'].map((b) => (
            <button
              key={b}
              onClick={() => setBlockFilter(b)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                blockFilter === b ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {b === 'All' ? 'Semua' : `Blok ${b}`}
            </button>
          ))}

          <span className="text-xs font-bold text-gray-700 ml-2">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1 text-xs text-gray-900"
          >
            <option value="active">Aktif</option>
            <option value="inactive">Tidak Aktif</option>
            <option value="all">Semua Status</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kepala keluarga atau blok..."
            className="w-full bg-transparent text-xs focus:outline-hidden text-gray-900"
          />
        </div>
      </div>

      {/* Families Table */}
      <div className="bg-white rounded-2xl border border-emerald-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-emerald-50/70 border-b border-emerald-100 text-[11px] font-bold text-emerald-900 uppercase">
                <th className="p-4">Rumah / Blok</th>
                <th className="p-4">Kepala Keluarga</th>
                <th className="p-4">Jumlah Warga</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
              {filteredFamilies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400 italic">
                    Tidak ada data keluarga yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredFamilies.map((fam) => {
                  const famResidents = residents.filter((r) => r.familyId === fam.id);
                  const kepalaKeluarga = famResidents.find((r) => r.familyRelationship === 'Kepala Keluarga');

                  return (
                    <tr key={fam.id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="p-4 font-bold text-gray-950 whitespace-nowrap">
                        Blok {fam.block} No. {fam.houseNumber}
                        {fam.addressNote && <div className="text-[11px] text-gray-500 font-normal">{fam.addressNote}</div>}
                      </td>
                      <td className="p-4 font-semibold text-gray-900">
                        {kepalaKeluarga ? kepalaKeluarga.fullName : <span className="text-amber-600 italic">Belum ada KK</span>}
                      </td>
                      <td className="p-4 text-gray-700 whitespace-nowrap">
                        <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-bold">
                          {famResidents.length} Orang
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            fam.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {fam.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap space-x-2">
                        <button
                          onClick={() => {
                            setSelectedFamily(fam);
                            setIsDetailModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold transition-colors inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>
                        {canManage && (
                          <button
                            onClick={() => handleOpenEditFamily(fam)}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors inline-flex items-center space-x-1"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail */}
      {isDetailModalOpen && selectedFamily && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-base sm:text-lg">
                  Detail Keluarga Blok {selectedFamily.block} No. {selectedFamily.houseNumber}
                </h3>
                {selectedFamily.addressNote && <p className="text-xs text-gray-500">{selectedFamily.addressNote}</p>}
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-800 text-sm">Daftar Anggota Warga</h4>
                {canManage && (
                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      handleOpenCreateResident(selectedFamily.id);
                    }}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Anggota</span>
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {residents
                  .filter((r) => r.familyId === selectedFamily.id)
                  .map((res) => (
                    <div key={res.id} className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-gray-900 text-sm">{res.fullName}</span>
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                            {res.familyRelationship}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
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

                      {(canManage || (isResidentRole && res.linkedUserId === currentUser.id)) && (
                        <button
                          onClick={() => {
                            setIsDetailModalOpen(false);
                            handleOpenEditResident(res);
                          }}
                          className="px-2.5 py-1 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
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

      {/* Modal Add/Edit Family */}
      {isFamilyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">
                {editingFamily ? 'Edit Data Rumah & Keluarga' : 'Tambah Rumah & Keluarga Baru'}
              </h3>
              <button onClick={() => setIsFamilyModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFamily} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Blok Rumah</label>
                  <select
                    value={formBlock}
                    onChange={(e) => setFormBlock(e.target.value)}
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
                    value={formHouseNumber}
                    onChange={(e) => setFormHouseNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                    placeholder="01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Catatan Alamat (Opsional)</label>
                <input
                  type="text"
                  value={formAddressNote}
                  onChange={(e) => setFormAddressNote(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                  placeholder="Contoh: Dekat taman utama"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Status Keluarga</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFamilyModalOpen(false)}
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

      {/* Modal Add/Edit Resident */}
      {isResidentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">
                {editingResident ? 'Edit Data Warga' : 'Tambah Anggota Warga'}
              </h3>
              <button onClick={() => setIsResidentModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResident} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={resFullName}
                  onChange={(e) => setResFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                  placeholder="Nama lengkap warga"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Hubungan Keluarga</label>
                <select
                  value={resRelationship}
                  onChange={(e) => setResRelationship(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                >
                  <option value="Kepala Keluarga">Kepala Keluarga</option>
                  <option value="Suami">Suami</option>
                  <option value="Istri">Istri</option>
                  <option value="Anak">Anak</option>
                  <option value="Ayah">Ayah</option>
                  <option value="Ibu">Ibu</option>
                  <option value="Cucu">Cucu</option>
                  <option value="Menantu">Menantu</option>
                  <option value="Mertua">Mertua</option>
                  <option value="Saudara">Saudara</option>
                  <option value="Famili Lainnya">Famili Lainnya</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={resBirthPlace}
                    onChange={(e) => setResBirthPlace(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                    placeholder="Kota kelahiran"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={resBirthDate}
                    onChange={(e) => setResBirthDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nomor HP (Opsional)</label>
                  <input
                    type="text"
                    value={resPhone}
                    onChange={(e) => setResPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                    placeholder="0812..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Pekerjaan</label>
                  <input
                    type="text"
                    value={resOccupation}
                    onChange={(e) => setResOccupation(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                    placeholder="Pekerjaan"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResidentModalOpen(false)}
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
