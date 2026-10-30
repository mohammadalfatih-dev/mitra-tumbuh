import React from 'react';
import { Plus, Fish, Layers } from 'lucide-react';
import { storage } from '../services/storage';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenQuickLog: () => void;
  selectedBatchId: string;
  onSelectBatchId: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenQuickLog,
  selectedBatchId,
  onSelectBatchId,
}) => {
  const settings = storage.getSettings();
  const batches = storage.getActiveBatches();
  const liveStock = storage.getTotalCurrentLiveStock();
  const activeUnitsCount = storage.getUnits().filter((u) => u.status === 'active').length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-600/20 group-hover:bg-emerald-700 transition-colors">
                <Fish className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                  Mitra Tumbuh
                </span>
                <span className="text-[11px] font-medium text-slate-500 tracking-wider uppercase block leading-none">
                  {settings.farmName || 'Aquaculture System'}
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Contextual Scope & Quick Indicator */}
          <div className="hidden lg:flex items-center gap-5 text-xs text-slate-600">
            <div className="flex items-center gap-2 py-1 px-3 bg-slate-100/80 rounded-md border border-slate-200/60">
              <span className="text-slate-500">Unit Aktif</span>
              <span className="font-semibold text-slate-900 font-mono tabular-nums">{activeUnitsCount}</span>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <span className="text-slate-500">Total Ikan Hidup</span>
              <span className="font-semibold text-emerald-700 font-mono tabular-nums">{liveStock.toLocaleString('id-ID')} ekor</span>
            </div>

            {batches.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Fokus Batch:</span>
                <select
                  value={selectedBatchId}
                  onChange={(e) => onSelectBatchId(e.target.value)}
                  className="bg-white border border-slate-200 text-xs rounded-md px-2.5 py-1 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">Semua Batch</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.batchName} ({b.species})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Zone 3: Primary Quick Action */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenQuickLog}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-600/20 active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Catat Cepat</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
