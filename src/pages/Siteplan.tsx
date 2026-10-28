/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MOCK_FAMILIES, MOCK_RESIDENTS } from '../data/mockData';
import { Family } from '../types';
import { MapPin, Home, Users, Info, CheckCircle2 } from 'lucide-react';

export const Siteplan: React.FC = () => {
  const [selectedBlock, setSelectedBlock] = useState<string>('All');
  const [activeFamily, setActiveFamily] = useState<Family | null>(MOCK_FAMILIES[0]);

  const blocks = ['All', 'A', 'B', 'C', 'D'];

  const filteredFamilies = selectedBlock === 'All'
    ? MOCK_FAMILIES
    : MOCK_FAMILIES.filter((f) => f.block === selectedBlock);

  const selectedResidents = activeFamily
    ? MOCK_RESIDENTS.filter((r) => r.familyId === activeFamily.id)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <MapPin className="w-6 h-6 text-emerald-600" />
          <span>Siteplan Perumahan Grand Sundara Dukuhturi</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Peta interaktif blok dan rumah warga. Klik salah satu rumah untuk melihat detail informasi keluarga.
        </p>
      </div>

      {/* Block Filter */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        <span className="text-xs font-bold text-gray-700">Filter Blok:</span>
        {blocks.map((b) => (
          <button
            key={b}
            onClick={() => setSelectedBlock(b)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedBlock === b
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white border border-emerald-200 text-gray-700 hover:bg-emerald-50'
            }`}
          >
            {b === 'All' ? 'Semua Blok' : `Blok ${b}`}
          </button>
        ))}
      </div>

      {/* Siteplan Grid & Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: House Map Cards */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-emerald-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="font-bold text-gray-900 text-sm sm:text-base flex items-center space-x-2">
              <Home className="w-5 h-5 text-emerald-600" />
              <span>Denah Kavling & Rumah Warga</span>
            </h2>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold">
              Interaktif
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredFamilies.map((fam) => {
              const isSelected = activeFamily?.id === fam.id;
              const famResidents = MOCK_RESIDENTS.filter((r) => r.familyId === fam.id);
              const kk = famResidents.find((r) => r.familyRelationship === 'Kepala Keluarga');

              return (
                <div
                  key={fam.id}
                  onClick={() => setActiveFamily(fam)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400'
                      : 'bg-emerald-50/50 hover:bg-emerald-50 border-emerald-200 text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                        isSelected ? 'bg-emerald-700 text-yellow-300' : 'bg-emerald-200 text-emerald-900'
                      }`}
                    >
                      Blok {fam.block}-{fam.houseNumber}
                    </span>
                    <span className="text-[10px] opacity-80">{famResidents.length} Warga</span>
                  </div>
                  <div className={`font-bold text-sm truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                    {kk ? kk.fullName : 'Rumah Warga'}
                  </div>
                  <div className={`text-[11px] mt-1 truncate ${isSelected ? 'text-emerald-100' : 'text-gray-500'}`}>
                    {fam.addressNote || 'Perumahan Grand Sundara'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Selected House Details */}
        <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-xs space-y-4">
          <h2 className="font-bold text-gray-900 text-sm sm:text-base flex items-center space-x-2 border-b border-gray-100 pb-3">
            <Users className="w-5 h-5 text-emerald-600" />
            <span>Detail Rumah Terpilih</span>
          </h2>

          {activeFamily ? (
            <div className="space-y-4">
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  Kavling Rumah
                </div>
                <div className="text-lg font-bold text-gray-900 mt-0.5">
                  Blok {activeFamily.block} Nomor {activeFamily.houseNumber}
                </div>
                {activeFamily.addressNote && (
                  <p className="text-xs text-gray-600 mt-1">{activeFamily.addressNote}</p>
                )}
              </div>

              <div className="space-y-3">
                <div className="text-xs font-bold text-gray-700">Anggota Keluarga Penghuni:</div>
                {selectedResidents.map((res) => (
                  <div key={res.id} className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 text-sm">{res.fullName}</span>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        {res.familyRelationship}
                      </span>
                    </div>
                    {res.occupation && <p className="text-xs text-gray-600">Pekerjaan: {res.occupation}</p>}
                    {res.phoneNumber && <p className="text-xs text-gray-600">No. HP: {res.phoneNumber}</p>}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">Pilih salah satu rumah pada denah di samping.</p>
          )}
        </div>
      </div>
    </div>
  );
};
