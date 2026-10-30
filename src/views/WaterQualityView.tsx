import React, { useState } from 'react';
import { Plus, Droplets, Thermometer, AlertCircle, X, CheckCircle, Info } from 'lucide-react';
import { storage } from '../services/storage';
import { WaterColor, WaterClarity, WaterOdor } from '../types';

interface WaterQualityViewProps {
  onNavigate: (view: string) => void;
}

const WATER_COLOR_LABELS: Record<WaterColor, string> = {
  hijau_muda: 'Hijau Muda (Plankton Baik)',
  hijau_pekat: 'Hijau Pekat (Plankton Berlebih)',
  cokelat: 'Cokelat (Dominasi Probiotik)',
  bening: 'Bening (Air Baru)',
  keruh: 'Keruh Berlumpur',
  merah_kehitaman: 'Merah / Kehitaman (Bakteri/Dekomposisi)',
};

export const WaterQualityView: React.FC<WaterQualityViewProps> = ({ onNavigate }) => {
  const records = storage.getWaterQualityRecords();
  const units = storage.getUnits();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>('all');

  // Form State
  const [unitId, setUnitId] = useState(units[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().substring(0, 5));
  const [tempC, setTempC] = useState(28);
  const [phLevel, setPhLevel] = useState(7.2);
  const [waterColor, setWaterColor] = useState<WaterColor>('hijau_muda');
  const [waterClarity, setWaterClarity] = useState<WaterClarity>('sedang');
  const [waterOdor, setWaterOdor] = useState<WaterOdor>('normal');
  const [waterChangePercent, setWaterChangePercent] = useState(0);
  const [notes, setNotes] = useState('');

  const filteredRecords = records.filter((r) => {
    if (selectedUnitFilter === 'all') return true;
    return r.unitId === selectedUnitFilter;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitId) return;

    storage.addWaterQualityRecord({
      unitId,
      recordedAt: `${date}T${time}`,
      temperatureC: Number(tempC),
      phLevel: Number(phLevel),
      waterColor,
      waterClarity,
      waterOdor,
      waterChangePercent: Number(waterChangePercent),
      notes,
    });

    setIsModalOpen(false);
    setNotes('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Pemantauan Kualitas Air
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Catat parameter fisik dan kimia air (suhu, pH, warna, penggantian air) untuk memantau stabilitas lingkungan kolam.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors self-start cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Ukur Kualitas Air</span>
        </button>
      </div>

      {/* Parameter Reference Guide Bar */}
      <div className="p-4 bg-sky-50/60 border border-sky-200/80 rounded-xl text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-sky-950">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-sky-700 shrink-0" />
          <span className="font-semibold">Pedoman Parameter Baku Air Ikan Air Tawar:</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span>Suhu Ideal: <strong className="font-mono text-sky-900">26°C – 30°C</strong></span>
          <span aria-hidden="true" className="text-sky-300">·</span>
          <span>pH Ideal: <strong className="font-mono text-sky-900">6.5 – 8.5</strong></span>
          <span aria-hidden="true" className="text-sky-300">·</span>
          <span>Rekomendasi Kuras: <strong className="font-mono text-sky-900">20% – 30%</strong> jika dasar kotor</span>
        </div>
      </div>

      {/* Filter by Unit */}
      {units.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Filter Wadah:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedUnitFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedUnitFilter === 'all'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Semua Wadah ({records.length})
            </button>
            {units.map((u) => (
              <button
                key={u.id}
                onClick={() => setSelectedUnitFilter(u.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  selectedUnitFilter === u.id
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {u.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecords.map((rec) => {
          const unit = storage.getUnitById(rec.unitId);
          const isPhSafe = rec.phLevel >= 6.5 && rec.phLevel <= 8.5;
          const isTempSafe = rec.temperatureC >= 25 && rec.temperatureC <= 31;
          const [recDate, recTime] = rec.recordedAt.split('T');

          return (
            <div
              key={rec.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{unit?.name || 'Unit'}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {recDate} · {recTime || '08:00'}
                    </p>
                  </div>
                  {rec.waterChangePercent > 0 && (
                    <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                      Kuras {rec.waterChangePercent}%
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Suhu Air</span>
                    <span className={`text-base font-bold font-mono ${isTempSafe ? 'text-slate-900' : 'text-amber-700'}`}>
                      {rec.temperatureC}°C
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">pH Air</span>
                    <span className={`text-base font-bold font-mono ${isPhSafe ? 'text-slate-900' : 'text-amber-700'}`}>
                      {rec.phLevel}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 mt-3 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Warna Air:</span>
                    <span className="font-semibold text-slate-800">
                      {WATER_COLOR_LABELS[rec.waterColor] || rec.waterColor}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Aroma:</span>
                    <span className="capitalize font-medium text-slate-700">{rec.waterOdor.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Kejernihan:</span>
                    <span className="capitalize font-medium text-slate-700">{rec.waterClarity.replace('_', ' ')}</span>
                  </div>
                </div>

                {rec.notes && (
                  <p className="text-[11px] text-slate-500 italic mt-2 pt-2 border-t border-slate-100">
                    "{rec.notes}"
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add Water Quality */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900">Ukur Parameter Kualitas Air</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Wadah / Kolam
                </label>
                <select
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-sky-500 focus:outline-none"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Pengukuran
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jam Pengukuran
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Suhu Air (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={tempC}
                    onChange={(e) => setTempC(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono tabular-nums focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    pH Air
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="14"
                    required
                    value={phLevel}
                    onChange={(e) => setPhLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono tabular-nums focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Warna Air
                  </label>
                  <select
                    value={waterColor}
                    onChange={(e) => setWaterColor(e.target.value as WaterColor)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="hijau_muda">Hijau Muda (Ideal)</option>
                    <option value="hijau_pekat">Hijau Pekat</option>
                    <option value="cokelat">Cokelat Probiotik</option>
                    <option value="bening">Bening</option>
                    <option value="keruh">Keruh</option>
                    <option value="merah_kehitaman">Merah / Kehitaman</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kuras Air (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={waterChangePercent}
                    onChange={(e) => setWaterChangePercent(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono tabular-nums focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Pengamatan
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Misal: Diberi aerasi tambahan dan garam krosok 100 gram"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors cursor-pointer"
                >
                  Simpan Parameter Air
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
