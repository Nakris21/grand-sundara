/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HeartHandshake } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-emerald-100 py-6 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
            GS
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Grand Sundara Digital</p>
            <p className="text-xs text-gray-500">
              Paguyuban Warga Perumahan Grand Sundara Dukuhturi
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-xs text-emerald-800 font-medium bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <HeartHandshake className="w-4 h-4 text-emerald-600" />
          <span>Gotong Royong • Guyub Rukun • Seduluran</span>
        </div>
      </div>
    </footer>
  );
};
