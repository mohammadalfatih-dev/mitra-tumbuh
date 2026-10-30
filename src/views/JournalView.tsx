import React, { useState } from 'react';
import { Plus, BookOpen, Calendar, Trash2, X, Tag } from 'lucide-react';
import { storage } from '../services/storage';
import { JournalActivityType } from '../types';

interface JournalViewProps {
  onNavigate: (view: string) => void;
}

const ACTIVITY_LABELS: Record<JournalActivityType, string> = {
  rutin: 'Pemeriksaan Rutin',
  kuras_air: 'Penggantian / Kuras Air',
  probiotik: 'Aplikasi Probiotik',
  garam_krosok: 'Pemberian Garam Krosok',
  sortir_ukuran: 'Grading / Sortir Ukuran',
  vitamin: 'Vitamin / Suplemen',
  pengobatan: 'Karantina / Pengobatan',
  inspeksi: 'Inspeksi Wadah & Saluran',
  pergantian_pakan: 'Pergantian Jenis Pakan',
};

export const JournalView: React.FC<JournalViewProps> = ({ onNavigate }) => {
  const journals = storage.getJournals();
  const batches = storage.getActiveBatches();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState(batches[0]?.id || '');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [activityType, setActivityType] = useState<JournalActivityType>('rutin');
  const [fishBehavior, setFishBehavior] = useState('Lincah, nafsu makan tinggi');
  const [weatherCondition, setWeatherCondition] = useState('Pagi cerah berawan');
  const [notes, setNotes] = useState('');

  const currentBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];
  const unitId = currentBatch ? currentBatch.unitId : '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId || !notes) return;

    storage.addJournal({
      batchId: selectedBatchId,
      unitId,
      entryDate,
      activityType,
      fishBehavior,
      weatherCondition,
      notes,
    });

    setIsModalOpen(false);
    setNotes('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus catatan jurnal ini?')) {
      storage.deleteJournal(id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Jurnal Harian Budidaya
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Buku log catatan lapangan untuk mencatat perlakuan, aplikasi probiotik, garam, dan perilaku ikan.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors self-start cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Tulis Catatan Jurnal</span>
        </button>
      </div>

      {/* Journal Entries List */}
      <div className="space-y-4">
        {journals.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
            Belum ada catatan jurnal budidaya. Mulai catat perlakuan dan pengamatan harian Anda.
          </div>
        ) : (
          journals.map((entry) => {
            const batch = storage.getBatchById(entry.batchId);
            const unit = storage.getUnitById(entry.unitId);

            return (
              <div
                key={entry.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg font-semibold text-xs border border-indigo-100">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {ACTIVITY_LABELS[entry.activityType] || entry.activityType}
                        </span>
                        <span className="text-slate-300" aria-hidden="true">·</span>
                        <span className="text-xs font-mono text-slate-500">{entry.entryDate}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Batch: <strong>{batch?.batchName}</strong> ({unit?.name})
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                  {entry.notes}
                </p>

                {(entry.fishBehavior || entry.weatherCondition) && (
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                    {entry.fishBehavior && (
                      <div>
                        <span>Respon Ikan:</span> <strong className="text-slate-700">{entry.fishBehavior}</strong>
                      </div>
                    )}
                    {entry.weatherCondition && (
                      <div>
                        <span aria-hidden="true" className="text-slate-300 mr-2">·</span>
                        <span>Cuaca:</span> <strong className="text-slate-700">{entry.weatherCondition}</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Add Journal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900">Catat Aktivitas Jurnal</h3>
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
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-indigo-500 focus:outline-none"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.batchName} ({b.species})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Jurnal
                  </label>
                  <input
                    type="date"
                    required
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis Perlakuan
                  </label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value as JournalActivityType)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="rutin">Pemeriksaan Rutin</option>
                    <option value="kuras_air">Kuras / Penggantian Air</option>
                    <option value="probiotik">Aplikasi Probiotik / EM4</option>
                    <option value="garam_krosok">Pemberian Garam Krosok</option>
                    <option value="sortir_ukuran">Sortir / Grading Ukuran</option>
                    <option value="vitamin">Pemberian Vitamin / Jamu</option>
                    <option value="pengobatan">Karantina & Pengobatan</option>
                    <option value="inspeksi">Inspeksi Wadah & Saluran</option>
                    <option value="pergantian_pakan">Pergantian Tipe Pakan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Respon / Perilaku Ikan
                </label>
                <input
                  type="text"
                  value={fishBehavior}
                  onChange={(e) => setFishBehavior(e.target.value)}
                  placeholder="Misal: Lincah, berebut pakan di permukaan"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kondisi Cuaca
                </label>
                <input
                  type="text"
                  value={weatherCondition}
                  onChange={(e) => setWeatherCondition(e.target.value)}
                  placeholder="Misal: Pagi mendung dingin, siang terik"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Lapangan Detail
                </label>
                <textarea
                  rows={3}
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tuliskan tindakan yang dilakukan, takaran bahan, atau pengamatan penting"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
                >
                  Simpan Catatan Jurnal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
