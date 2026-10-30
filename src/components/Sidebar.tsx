import React from 'react';
import {
  LayoutDashboard,
  Fish,
  Layers,
  Utensils,
  TrendingDown,
  Wallet,
  Droplets,
  BookOpen,
  BarChart3,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'batches', label: 'Data Budidaya', icon: Fish },
  { id: 'units', label: 'Unit Budidaya', icon: Layers },
  { id: 'feeding', label: 'Jadwal Pakan & FCR', icon: Utensils },
  { id: 'mortality', label: 'Mortalitas', icon: TrendingDown },
  { id: 'finance', label: 'Keuangan', icon: Wallet },
  { id: 'water', label: 'Kualitas Air', icon: Droplets },
  { id: 'journal', label: 'Jurnal Budidaya', icon: BookOpen },
  { id: 'reports', label: 'Laporan', icon: BarChart3 },
  { id: 'settings', label: 'Pengaturan & D1', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4">
      <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase px-3 mb-2">
        Menu Operasional
      </div>

      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                isActive
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-emerald-600' : 'text-slate-400'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-slate-100 text-xs text-slate-400 px-3 space-y-1">
        <div className="font-medium text-slate-600">Mitra Tumbuh v1.0</div>
        <div>Aquaculture D1 Ready</div>
      </div>
    </aside>
  );
};
