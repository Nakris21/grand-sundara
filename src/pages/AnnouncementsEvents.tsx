/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MOCK_ANNOUNCEMENTS, MOCK_EVENTS } from '../data/mockData';
import { Announcement, EventItem, UserAccount } from '../types';
import { Bell, Calendar, ExternalLink, Plus, MapPin, X } from 'lucide-react';

interface AnnouncementsEventsProps {
  currentUser: UserAccount;
}

export const AnnouncementsEvents: React.FC<AnnouncementsEventsProps> = ({ currentUser }) => {
  const [announcements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);
  const [events] = useState<EventItem[]>(MOCK_EVENTS);
  const [activeTab, setActiveTab] = useState<'announcements' | 'events'>('announcements');

  const canManage = currentUser.role === 'super_admin' || currentUser.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Bell className="w-6 h-6 text-emerald-600" />
            <span>Pengumuman & Agenda Kegiatan Warga</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Informasi resmi pengurus paguyuban dan jadwal agenda kegiatan warga Perumahan Grand Sundara Dukuhturi.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-3 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('announcements')}
          className={`pb-2 px-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'announcements'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Pengumuman Warga ({announcements.length})
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`pb-2 px-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'events'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Agenda Kegiatan ({events.length})
        </button>
      </div>

      {activeTab === 'announcements' ? (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div key={ann.id} className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded">
                  Pengumuman Resmi Paguyuban
                </span>
                <span>{new Date(ann.createdAt).toLocaleDateString('id-ID', { dateStyle: 'full' })}</span>
              </div>
              <h3 className="font-bold text-gray-900 text-lg">{ann.title}</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{ann.body}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((ev) => (
            <div key={ev.id} className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded inline-block">
                  {new Date(ev.eventDate).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                </span>
                <h3 className="font-bold text-gray-900 text-base">{ev.title}</h3>
                {ev.location && (
                  <p className="text-xs text-gray-500 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{ev.location}</span>
                  </p>
                )}
                <p className="text-xs text-gray-600">{ev.description}</p>
              </div>

              {ev.instagramUrl && (
                <div className="pt-3 border-t border-gray-100">
                  <a
                    href={ev.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-3 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <span>Buka Dokumentasi Instagram</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
