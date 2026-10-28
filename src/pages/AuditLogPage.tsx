/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MOCK_AUDIT_LOGS } from '../data/mockData';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <ShieldAlert className="w-6 h-6 text-emerald-600" />
          <span>Jejak Audit (Audit Log) Sistem</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Catatan operasi penting, perubahan data keluarga, transaksi kas, dan moderasi listing di Grand Sundara Digital.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-emerald-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-emerald-50/70 border-b border-emerald-100 text-[11px] font-bold text-emerald-900 uppercase">
                <th className="p-4">Waktu</th>
                <th className="p-4">Aktor / Pengguna</th>
                <th className="p-4">Tindakan (Action)</th>
                <th className="p-4">Entitas</th>
                <th className="p-4">Ringkasan Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
              {MOCK_AUDIT_LOGS.map((log) => (
                <tr key={log.id} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="p-4 font-medium text-gray-600 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('id-ID')}
                  </td>
                  <td className="p-4 font-semibold text-gray-900 whitespace-nowrap">
                    {log.actorUserId}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-gray-700 whitespace-nowrap">
                    {log.entityType} ({log.entityId})
                  </td>
                  <td className="p-4 text-gray-600 font-mono text-xs">
                    {log.changedFieldsSummary ? JSON.stringify(log.changedFieldsSummary) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
