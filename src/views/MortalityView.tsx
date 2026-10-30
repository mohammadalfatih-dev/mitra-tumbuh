import React, { useState } from 'react';
import { Plus, TrendingDown, AlertTriangle, X, Trash2, Calendar, ShieldAlert } from 'lucide-react';
import { storage } from '../services/storage';
import { MortalityCause } from '../types';

interface MortalityViewProps {
  onNavigate: (view: string) => void;
}

const CAUSE_LABELS: Record<MortalityCause, string> = {
  kualitas_air: 'Kualitas Air Menurun',
  kanibalisme: 'Kanibalisme (Beda Ukuran)',
  loncat: 'Loncat Keluar Wadah',
  jamur_parasit: 'Jamur / Parasit Putih',
  stres_cuaca: 'Stres Perubahan Cuaca / Hujan',
  penyakit_bakteri: 'Infeksi Bakteri (Aeromonas)',
  kembung: 'Perut Kembung',
  tidak_diketahui: 'Penyebab Lain / Belum Tahu',
};

export const MortalityView: React.FC<MortalityViewProps> = ({ onNavigate }) => {
  const records = storage.getMortalityRecords();
  const batches = storage.getActiveBatches();
  const totalMortality = storage.getTotalMortalities();
  const totalInitial = storage.getTotalInitialFish();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [batchId, setBatchId] = useState(batches[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [quantity, setQuantity] = useState(1);
  const [suspectedCause, setSuspectedCause] = useState<MortalityCause>('kualitas_air');
  const [notes, setNotes] = useState('');

  const currentBatch = batches.find((b) => b.id === batchId) || batches[0];
  const unitId = currentBatch ? currentBatch.unitId : '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchId) return;

    storage.addMortalityRecord({
      batchId,
      unitId,
      date,
      quantity: Number(quantity),
      suspectedCause,
      notes,
    });

    setIsModalOpen(false);
    setQuantity(1);
    setNotes('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus pencatatan kematian ini? Stok hidup akan dipulihkan secara otomatis.')) {
      storage.deleteMortalityRecord(id);
    }
  };

  // Group by cause for quick breakdown
  const causeCounts: Partial<Record<MortalityCause, number>> = {};
  for (const r of records) {
    causeCounts[r.suspectedCause] = (causeCounts[r.suspectedCause] || 0) + r.quantity;
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Pencatatan Mortalitas Ikan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dokumentasikan setiap kematian ikan beserta dugaan penyebab untuk evaluasi dan pembaruan stok hidup real-time.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors self-start cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Catat Kematian Baru</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Total Kematian Kumulatif</span>
          <div className="text-2xl font-bold font-mono text-red-700 tabular-nums">
            {totalMortality.toLocaleString('id-ID')}
            <span className="text-xs font-normal text-slate-500 ml-1">ekor</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Dicatat dalam {records.length} insiden
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Tingkat Mortalitas Global</span>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {totalInitial > 0 ? ((totalMortality / totalInitial) * 100).toFixed(1) : 0}%
          </div>
          <span className="text-[11px] text-emerald-700 mt-1 block font-medium">
            Tingkat Kelangsungan Hidup (SR): {storage.getSurvivalRate().toFixed(1)}%
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Penyebab Kematian Terbanyak</span>
          <div className="text-base font-bold text-slate-800 truncate">
            {Object.keys(causeCounts).length > 0
              ? CAUSE_LABELS[Object.entries(causeCounts).sort((a, b) => b[1] - a[1])[0][0] as MortalityCause]
              : 'Belum ada data'}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Berdasarkan diagnosa visual lapangan
          </span>
        </div>

      </div>

      {/* Cause Breakdown Strip */}
      {Object.keys(causeCounts).length > 0 && (
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Distribusi Penyebab Kematian
          </h4>
          <div className="flex flex-wrap gap-2 pt-1">
            {Object.entries(causeCounts).map(([cause, count]) => (
              <div
                key={cause}
                className="flex items-center gap-2 py-1 px-2.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700"
              >
                <span>{CAUSE_LABELS[cause as MortalityCause] || cause}</span>
                <span className="font-mono font-bold text-red-600 bg-white px-1.5 py-0.5 rounded shadow-2xs">
                  {count} ekor
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mortality Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Riwayat Catatan Kematian</h3>
            <p className="text-xs text-slate-500">Log insiden mortalitas ikan</p>
          </div>
          <span className="text-xs text-slate-400">{records.length} catatan</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Tanggal</th>
                <th className="py-2.5 px-4 font-semibold">Batch & Wadah</th>
                <th className="py-2.5 px-4 font-semibold">Jumlah Mati</th>
                <th className="py-2.5 px-4 font-semibold">Dugaan Penyebab</th>
                <th className="py-2.5 px-4 font-semibold">Keterangan Gejala</th>
                <th className="py-2.5 px-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada catatan kematian ikan. Kondisi budidaya prima!
                  </td>
                </tr>
              ) : (
                records.map((rec) => {
                  const b = storage.getBatchById(rec.batchId);
                  const u = storage.getUnitById(rec.unitId);

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                        {rec.date}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{b?.batchName || 'Unknown Batch'}</div>
                        <div className="text-[11px] text-slate-400">{u?.name} ({b?.species})</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                          {rec.quantity} ekor
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                        {CAUSE_LABELS[rec.suspectedCause] || rec.suspectedCause}
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                        {rec.notes || '-'}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(rec.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                          title="Hapus catatan & pulihkan stok"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Mortality */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900">Catat Kematian Ikan</h3>
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
                  Pilih Batch Budidaya
                </label>
                <select
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-red-500 focus:outline-none"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.batchName} — {b.species} (Sisa {storage.getLiveStockCount(b.id)} ekor)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Insiden
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jumlah Mati (Ekor)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-red-300 rounded-lg font-mono tabular-nums text-red-900 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dugaan Penyebab Kematian
                </label>
                <select
                  value={suspectedCause}
                  onChange={(e) => setSuspectedCause(e.target.value as MortalityCause)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-red-500 focus:outline-none"
                >
                  <option value="kualitas_air">Kualitas Air Menurun / Amonia Tinggi</option>
                  <option value="kanibalisme">Kanibalisme (Ukuran Benih Tidak Seragam)</option>
                  <option value="loncat">Loncat Keluar Wadah</option>
                  <option value="jamur_parasit">Infeksi Jamur / Bercak Putih</option>
                  <option value="stres_cuaca">Stres Perubahan Cuaca / Hujan Mendadak</option>
                  <option value="penyakit_bakteri">Infeksi Bakteri (Sirip Geripis/Aeromonas)</option>
                  <option value="kembung">Perut Kembung / Pakan Mengembang di Lambung</option>
                  <option value="tidak_diketahui">Penyebab Lain / Belum Diketahui</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan Gejala & Tindakan
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Misal: Ditemukan mengambang di pojok, insang merah tua, segera kuras air 30%"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer"
                >
                  Simpan Catatan & Kurangi Stok Hidup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
