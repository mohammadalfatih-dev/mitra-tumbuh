import React, { useState } from 'react';
import { Plus, Utensils, CheckCircle, Clock, AlertCircle, X, ChevronRight, Calculator, Scale } from 'lucide-react';
import { storage } from '../services/storage';
import { FeedingSchedule, FeedingStatus } from '../types';

interface FeedingViewProps {
  onNavigate: (view: string) => void;
}

export const FeedingView: React.FC<FeedingViewProps> = ({ onNavigate }) => {
  const batches = storage.getActiveBatches();
  const units = storage.getUnits();
  const schedules = storage.getFeedingSchedules();
  const logs = storage.getFeedingLogs();

  const [selectedBatchId, setSelectedBatchId] = useState<string>(batches[0]?.id || '');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Sampling weight modal
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [avgWeightInput, setAvgWeightInput] = useState(35);

  // New Schedule State
  const [schedTime, setSchedTime] = useState('08:00');
  const [schedFeedType, setSchedFeedType] = useState('Pelet Apung LP-1');
  const [schedGrams, setSchedGrams] = useState(60);
  const [schedNotes, setSchedNotes] = useState('');

  // Manual Log State
  const [logTime, setLogTime] = useState(new Date().toTimeString().substring(0, 5));
  const [logBrand, setLogBrand] = useState('Pelet Apung LP-1');
  const [logGrams, setLogGrams] = useState(60);
  const [logStatus, setLogStatus] = useState<FeedingStatus>('completed');
  const [logNotes, setLogNotes] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const currentBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];
  const currentBatchSchedules = schedules.filter((s) => s.batchId === currentBatch?.id);
  const currentBatchLogs = logs.filter((l) => l.batchId === currentBatch?.id);

  // FCR metrics
  const fcrData = currentBatch ? storage.getBatchFCR(currentBatch.id) : null;
  const liveCount = currentBatch ? storage.getLiveStockCount(currentBatch.id) : 0;

  const handleMarkGiven = (sched: FeedingSchedule) => {
    storage.addFeedingLog({
      scheduleId: sched.id,
      batchId: sched.batchId,
      unitId: sched.unitId,
      feedDate: todayStr,
      feedTime: currentTimeStr,
      feedBrand: sched.feedType,
      amountGrams: sched.amountGrams,
      status: 'completed',
      notes: 'Ditandai selesai dari modul jadwal pakan',
    });
  };

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBatch) return;

    storage.addFeedingSchedule({
      unitId: currentBatch.unitId,
      batchId: currentBatch.id,
      timeOfDay: schedTime,
      feedType: schedFeedType,
      amountGrams: Number(schedGrams),
      isActive: true,
      notes: schedNotes,
    });

    setIsScheduleModalOpen(false);
  };

  const handleCreateLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBatch) return;

    storage.addFeedingLog({
      batchId: currentBatch.id,
      unitId: currentBatch.unitId,
      feedDate: todayStr,
      feedTime: logTime,
      feedBrand: logBrand,
      amountGrams: Number(logGrams),
      status: logStatus,
      notes: logNotes,
    });

    setIsLogModalOpen(false);
  };

  const handleSaveSampleWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBatch) return;

    storage.updateBatch(currentBatch.id, {
      currentAvgWeightGrams: Number(avgWeightInput),
    });

    // Add journal entry about sampling
    storage.addJournal({
      batchId: currentBatch.id,
      unitId: currentBatch.unitId,
      entryDate: todayStr,
      activityType: 'sortir_ukuran',
      fishBehavior: 'Sampling bobot ikan',
      notes: `Sampling bobot rata-rata ikan diperbarui menjadi ${avgWeightInput} gram/ekor untuk estimasi FCR.`,
    });

    setIsWeightModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Jadwal Pemberian Pakan & Estimasi FCR
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur rutinitas pemberian pakan, catat porsi harian, dan pantau efisiensi pakan (*Feed Conversion Ratio*).
          </p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jadwal</span>
          </button>
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Utensils className="w-4 h-4" />
            <span>+ Catat Pakan Hari Ini</span>
          </button>
        </div>
      </div>

      {/* Batch Selector Bar */}
      {batches.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-600">Pilih Batch Budidaya:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {batches.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBatchId(b.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  b.id === currentBatch?.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {b.batchName} ({b.species})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FCR & Feeding KPI Cards */}
      {currentBatch && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: FCR Metric */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Estimasi FCR (Rasio Pakan)</span>
              <Calculator className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
              {fcrData?.fcr !== null ? fcrData?.fcr : '1.05'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>{fcrData?.fcr && fcrData.fcr <= 1.2 ? 'Efisiensi Sangat Baik' : 'Standar Budidaya'}</span>
              <button
                onClick={() => {
                  setAvgWeightInput(currentBatch.currentAvgWeightGrams || 35);
                  setIsWeightModalOpen(true);
                }}
                className="text-emerald-700 font-semibold hover:underline"
              >
                Sampling Bobot
              </button>
            </div>
          </div>

          {/* Card 2: Total Feed Given */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Total Pakan Diberikan</span>
              <Utensils className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {storage.getBatchTotalFeedKg(currentBatch.id).toFixed(2)}
              <span className="text-xs font-normal text-slate-500 ml-1">kg</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Akumulasi sejak tebar benih
            </div>
          </div>

          {/* Card 3: Live Biomass Estimate */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Estimasi Biomassa Hidup</span>
              <Scale className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {((liveCount * (currentBatch.currentAvgWeightGrams || 35)) / 1000).toFixed(2)}
              <span className="text-xs font-normal text-slate-500 ml-1">kg</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Rata-rata: <strong className="font-mono text-slate-700">{currentBatch.currentAvgWeightGrams || 35}g</strong> / ekor
            </div>
          </div>

          {/* Card 4: Daily Feeding Rate */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Pakan Hari Ini</span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {currentBatchLogs
                .filter((l) => l.feedDate === todayStr && l.status === 'completed')
                .reduce((sum, l) => sum + l.amountGrams, 0)}
              <span className="text-xs font-normal text-slate-500 ml-1">gram</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Dari {currentBatchSchedules.length} target jadwal harian
            </div>
          </div>

        </div>
      )}

      {/* Main Content Grid: Schedules & Daily Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Feeding Schedules */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Jadwal Pemberian Pakan Harian</h3>
              <p className="text-xs text-slate-500">Rutinitas jam pakan untuk {currentBatch?.batchName}</p>
            </div>
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              + Buat Jadwal
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {currentBatchSchedules.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Belum ada jadwal pakan untuk batch ini. Klik "+ Buat Jadwal" untuk mengatur waktu pemberian pakan.
              </div>
            ) : (
              currentBatchSchedules.map((sched) => {
                const todayLog = currentBatchLogs.find(
                  (l) => l.scheduleId === sched.id && l.feedDate === todayStr
                );
                
                let statusBadge: 'completed' | 'missed' | 'pending' = 'pending';
                if (todayLog) {
                  statusBadge = todayLog.status === 'completed' ? 'completed' : 'missed';
                } else if (sched.timeOfDay < currentTimeStr) {
                  statusBadge = 'missed';
                }

                return (
                  <div key={sched.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-100 flex flex-col items-center justify-center font-mono">
                        <span className="text-xs font-bold text-emerald-800">{sched.timeOfDay}</span>
                        <span className="text-[9px] text-emerald-600 font-medium">WIB</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{sched.feedType}</h4>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono font-semibold text-slate-700">{sched.amountGrams} gram</span>
                          <span aria-hidden="true">·</span>
                          <span className="capitalize text-slate-500">
                            {statusBadge === 'completed' && 'Sudah Diberikan'}
                            {statusBadge === 'missed' && 'Terlewat / Belum Diberikan'}
                            {statusBadge === 'pending' && 'Menunggu Waktu'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {statusBadge === 'completed' ? (
                        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                          <CheckCircle className="w-4 h-4" />
                          <span>Selesai</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleMarkGiven(sched)}
                          className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
                        >
                          Beri Pakan
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Feeding History Logs */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Riwayat Catatan Pakan</h3>
              <p className="text-xs text-slate-500">Log konsumsi pakan terverifikasi</p>
            </div>
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              + Catat Manual
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto">
            {currentBatchLogs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Belum ada riwayat pemberian pakan.
              </div>
            ) : (
              currentBatchLogs.map((log) => (
                <div key={log.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50/50">
                  <div>
                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                      <span>{log.feedBrand}</span>
                      <span className="font-mono text-emerald-700 font-bold">{log.amountGrams} gram</span>
                    </div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      {log.feedDate} pukul {log.feedTime} {log.notes ? `— "${log.notes}"` : ''}
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      log.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : log.status === 'missed'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {log.status === 'completed' ? 'Diberikan' : 'Terlewat'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Modal: Sampling Bobot untuk FCR */}
      {isWeightModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900">Sampling Bobot Ikan</h3>
              <button
                onClick={() => setIsWeightModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSampleWeight} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bobot Rata-rata Ikan Saat Ini (Gram / Ekor)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  required
                  value={avgWeightInput}
                  onChange={(e) => setAvgWeightInput(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono tabular-nums focus:ring-emerald-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Misal: Ambil sampel 5-10 ekor ikan, timbang total, lalu bagi jumlah ekor.
                </span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-900 space-y-1">
                <div>Stok Hidup: <strong className="font-mono">{liveCount} ekor</strong></div>
                <div>Estimasi Total Biomassa Baru: <strong className="font-mono">{((liveCount * avgWeightInput) / 1000).toFixed(2)} kg</strong></div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer"
                >
                  Perbarui Bobot & Hitung Ulang FCR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tambah Jadwal Pakan */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900">Tambah Jadwal Pakan</h3>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jam Pemberian (WIB)
                  </label>
                  <input
                    type="time"
                    required
                    value={schedTime}
                    onChange={(e) => setSchedTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Porsi Pakan (Gram)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={schedGrams}
                    onChange={(e) => setSchedGrams(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono tabular-nums focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis / Merk Pakan
                </label>
                <input
                  type="text"
                  required
                  value={schedFeedType}
                  onChange={(e) => setSchedFeedType(e.target.value)}
                  placeholder="Misal: Pelet Apung LP-1 / Maggot BSF"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Prosedur
                </label>
                <input
                  type="text"
                  value={schedNotes}
                  onChange={(e) => setSchedNotes(e.target.value)}
                  placeholder="Misal: Bibit ditebar sedikit demi sedikit 3 tahap"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Catat Log Pakan Manual */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900">Catat Pakan Terdistribusi</h3>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLog} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jam Pemberian
                  </label>
                  <input
                    type="time"
                    required
                    value={logTime}
                    onChange={(e) => setLogTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jumlah (Gram)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={logGrams}
                    onChange={(e) => setLogGrams(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono tabular-nums focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Merk / Jenis Pakan
                </label>
                <input
                  type="text"
                  required
                  value={logBrand}
                  onChange={(e) => setLogBrand(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Pemberian
                </label>
                <select
                  value={logStatus}
                  onChange={(e) => setLogStatus(e.target.value as FeedingStatus)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="completed">Sudah Diberikan Penuh</option>
                  <option value="missed">Terlewat / Puasa</option>
                  <option value="skipped">Dilewati Karena Air Keruh</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Nafsu Makan
                </label>
                <input
                  type="text"
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  placeholder="Misal: Ikan sangat agresif melahap pakan"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer"
                >
                  Simpan Catatan Pakan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
