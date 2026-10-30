import React, { useState } from 'react';
import {
  LayoutDashboard,
  Fish,
  Utensils,
  Wallet,
  Menu,
  X,
  Layers,
  TrendingDown,
  Droplets,
  BookOpen,
  BarChart3,
  Settings,
} from 'lucide-react';
import { NAV_ITEMS } from './Sidebar';

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const mainTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'batches', label: 'Budidaya', icon: Fish },
    { id: 'feeding', label: 'Pakan', icon: Utensils },
    { id: 'finance', label: 'Keuangan', icon: Wallet },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="relative bg-white rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto shadow-2xl z-10 border-t border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900">Semua Modul Mitra Tumbuh</h3>
                <p className="text-xs text-slate-500">Pilih menu navigasi operasional</p>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                      isActive
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 md:hidden safe-area-bottom">
        <div className="grid grid-cols-5 h-16">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive ? 'text-emerald-700 font-semibold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className="text-[10px] leading-tight">{tab.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              isMenuOpen ? 'text-emerald-700 font-semibold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] leading-tight">Lainnya</span>
          </button>
        </div>
      </nav>
    </>
  );
};
