import React from 'react';
import {
  Fish,
  TrendingDown,
  Layers,
  Wallet,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Utensils,
  Droplets,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { storage } from '../services/storage';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
  onOpenQuickLog: () => void;
  selectedBatchId?: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenQuickLog,
  selectedBatchId,
}) => {
  const settings = storage.getSettings();
  const totalLive = storage.getTotalCurrentLiveStock();
  const totalInitial = storage.getTotalInitialFish();
  const totalMortality = storage.getTotalMortalities();
  const totalHarvested = storage.getTotalHarvestedFish();
  const totalHarvestWeight = storage.getTotalHarvestedWeightKg();
  const survivalRate = storage.getSurvivalRate();
  const activeUnits = storage.getUnits().filter((u) => u.status === 'active');
  const activeBatches = storage.getActiveBatches();
  const financial = storage.getFinancialSummary();

  // Next feeding schedule lookup
  const schedules = storage.getFeedingSchedules(selectedBatchId || undefined);
  const now = new Date();
  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;
  const todayStr = now.toISOString().split('T')[0];

  const todayLogs = storage
    .getFeedingLogs()
    .filter((l) => l.feedDate === todayStr);

  // Find upcoming schedule
  const nextSchedule = schedules.find((s) => s.isActive && s.timeOfDay >= currentTimeStr) || schedules[0];
  const isNextAlreadyGiven = nextSchedule
    ? todayLogs.some((l) => l.scheduleId === nextSchedule.id && l.status === 'completed')
    : false;

  const handleMarkFeedGiven = (scheduleId: string, batchId: string, unitId: string, grams: number, feedType: string) => {
    storage.addFeedingLog({
      scheduleId,
      batchId,
      unitId,
      feedDate: todayStr,
      feedTime: currentTimeStr,
      feedBrand: feedType,
      amountGrams: grams,
      status: 'completed',
      notes: 'Ditandai selesai dari Dashboard',
    });
  };

  // Recent 5 days mortality data for simple SVG sparkline / bar chart
  const last7Days: { date: string; label: string; mortality: number; feedKg: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('id-ID', { weekday: 'short' });
    const dayMorts = storage
      .getMortalityRecords()
      .filter((m) => m.date === dateStr)
      .reduce((sum, m) => sum + m.quantity, 0);
    const dayFeedGrams = storage
      .getFeedingLogs()
      .filter((l) => l.feedDate === dateStr && l.status === 'completed')
      .reduce((sum, l) => sum + l.amountGrams, 0);

    last7Days.push({
      date: dateStr,
      label: dayLabel,
      mortality: dayMorts,
      feedKg: Number((dayFeedGrams / 1000).toFixed(2)),
    });
  }

  const maxMort = Math.max(3, ...last7Days.map((d) => d.mortality));
  const maxFeed = Math.max(1, ...last7Days.map((d) => d.feedKg));

  return (
    <div className="space-y-6">
      
      {/* Welcome & Farm Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Ringkasan Operasional Budidaya
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola stok hidup, jadwal pakan, kualitas air, dan pembukuan dalam satu pusat kendali.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('reports')}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Buka Laporan
          </button>
          <button
            onClick={onOpenQuickLog}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            + Catat Kegiatan
          </button>
        </div>
      </div>

      {/* Next Feeding Banner */}
      {nextSchedule && (
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-xl p-4 sm:p-5 shadow-sm border border-emerald-800/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    Jadwal Pakan Berikutnya
                  </span>
                  <span className="text-slate-400 text-xs" aria-hidden="true">·</span>
                  <span className="text-xs font-mono font-semibold text-white bg-emerald-800/60 px-2 py-0.5 rounded">
                    {nextSchedule.timeOfDay} WIB
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-semibold text-slate-100 mt-0.5">
                  {nextSchedule.feedType} — <span className="font-mono">{nextSchedule.amountGrams} gram</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Target: {storage.getBatchById(nextSchedule.batchId)?.batchName || 'Semua Ikan'} (
                  {storage.getUnitById(nextSchedule.unitId)?.name || 'Wadah Budidaya'})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {isNextAlreadyGiven ? (
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-700/50 px-3 py-1.5 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Pakan Sudah Diberikan</span>
                </div>
              ) : (
                <button
                  onClick={() =>
                    handleMarkFeedGiven(
                      nextSchedule.id,
                      nextSchedule.batchId,
                      nextSchedule.unitId,
                      nextSchedule.amountGrams,
                      nextSchedule.feedType
                    )
                  }
                  className="px-4 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                >
                  Tandai Sudah Diberikan
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Metric 1: Live Stock */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Ikan Hidup</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Fish className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {totalLive.toLocaleString('id-ID')}
            <span className="text-xs font-normal text-slate-500 ml-1">ekor</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
            <span>Tebar Awal: <strong className="font-mono text-slate-700">{totalInitial.toLocaleString('id-ID')}</strong></span>
            <span aria-hidden="true">·</span>
            <span>SR: <strong className="font-mono text-emerald-700">{survivalRate.toFixed(1)}%</strong></span>
          </div>
        </div>

        {/* Metric 2: Mortality */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Kematian</span>
            <div className="p-1.5 rounded-lg bg-red-50 text-red-600">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-700 font-mono tabular-nums">
            {totalMortality.toLocaleString('id-ID')}
            <span className="text-xs font-normal text-slate-500 ml-1">ekor</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {totalInitial > 0 ? (
              <span>Rasio Mati: <strong className="font-mono text-red-600">{((totalMortality / totalInitial) * 100).toFixed(1)}%</strong> dari benih</span>
            ) : (
              <span>Belum ada data kematian</span>
            )}
          </div>
        </div>

        {/* Metric 3: Harvest */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Ikan Dipanen</span>
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {totalHarvested.toLocaleString('id-ID')}
            <span className="text-xs font-normal text-slate-500 ml-1">ekor</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            <span>Total Bobot: <strong className="font-mono text-slate-800">{totalHarvestWeight} kg</strong></span>
          </div>
        </div>

        {/* Metric 4: Cash Balance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Saldo Kas Budidaya</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-2xl font-bold font-mono tabular-nums ${
              financial.balance >= 0 ? 'text-emerald-700' : 'text-red-700'
            }`}
          >
            Rp {financial.balance.toLocaleString('id-ID')}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="text-emerald-600">Masuk: Rp {financial.totalIncome.toLocaleString('id-ID')}</span>
            <span className="text-red-600">Keluar: Rp {financial.totalExpense.toLocaleString('id-ID')}</span>
          </div>
        </div>

      </div>

      {/* 2-Column Operational Body: Visual Trends & Active Units */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: 7-Day Chart & Activity */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 7-Day Activity Trends (SVG Chart) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Aktivitas 7 Hari Terakhir
                </h3>
                <p className="text-xs text-slate-500">
                  Perbandingan pakan terdistribusi (kg) dan angka mortalitas harian
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-emerald-500 rounded-xs" />
                  <span className="text-slate-600">Pakan (kg)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-red-400 rounded-xs" />
                  <span className="text-slate-600">Mortalitas (ekor)</span>
                </div>
              </div>
            </div>

            {/* SVG Visual Bars */}
            <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-100">
              {last7Days.map((day, idx) => {
                const feedHeightPct = (day.feedKg / maxFeed) * 85;
                const mortHeightPct = (day.mortality / maxMort) * 85;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div className="w-full max-w-[36px] flex items-end justify-center gap-1 h-32">
                      {/* Feed Bar */}
                      <div
                        style={{ height: `${Math.max(4, feedHeightPct)}%` }}
                        className="w-3.5 bg-emerald-500 rounded-t transition-all group-hover:bg-emerald-600 relative"
                        title={`${day.date}: ${day.feedKg} kg pakan`}
                      />
                      {/* Mortality Bar */}
                      <div
                        style={{ height: `${Math.max(day.mortality > 0 ? 4 : 0, mortHeightPct)}%` }}
                        className="w-3.5 bg-red-400 rounded-t transition-all group-hover:bg-red-500 relative"
                        title={`${day.date}: ${day.mortality} ekor mati`}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 mt-2">
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 px-2">
              <span>Konsumsi pakan relatif stabil</span>
              <button
                onClick={() => onNavigate('feeding')}
                className="text-emerald-700 font-semibold hover:underline inline-flex items-center gap-1"
              >
                <span>Detail Pakan & FCR</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Active Batches Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Batch Budidaya Aktif</h3>
                <p className="text-xs text-slate-500">Stok ikan dihitung otomatis dari pergerakan awal, kematian, dan panen</p>
              </div>
              <button
                onClick={() => onNavigate('batches')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Lihat Semua ({activeBatches.length})
              </button>
            </div>

            <div className="divide-y divide-slate-100 overflow-x-auto">
              {activeBatches.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Belum ada batch budidaya aktif. Klik "+ Catat Cepat" untuk menambahkan batch baru.
                </div>
              ) : (
                activeBatches.map((batch) => {
                  const liveCount = storage.getLiveStockCount(batch.id);
                  const unit = storage.getUnitById(batch.unitId);
                  const batchSR = storage.getSurvivalRate(batch.id);
                  const fcrData = storage.getBatchFCR(batch.id);

                  // Calculate days since stocking
                  const stockDate = new Date(batch.stockingDate);
                  const ageDays = Math.max(1, Math.floor((now.getTime() - stockDate.getTime()) / 86400000));

                  return (
                    <div
                      key={batch.id}
                      onClick={() => onNavigate('batches')}
                      className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-slate-900">{batch.batchName}</h4>
                          <span className="text-[11px] text-slate-500">({batch.species})</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                          <span>Wadah: <strong>{unit ? unit.name : 'Unknown'}</strong></span>
                          <span aria-hidden="true">·</span>
                          <span>Umur: <strong>Hari ke-{ageDays}</strong></span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                          {liveCount} <span className="text-xs font-normal text-slate-500">ekor hidup</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 justify-end">
                          <span>SR: <strong className="text-emerald-700 font-mono">{batchSR.toFixed(1)}%</strong></span>
                          {fcrData.fcr && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>FCR: <strong className="text-slate-800 font-mono">{fcrData.fcr}</strong></span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Right Col: Active Units & Quick Status */}
        <div className="space-y-6">
          
          {/* Active Units Overview */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Unit Wadah Budidaya</h3>
              <button
                onClick={() => onNavigate('units')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Kelola ({activeUnits.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {activeUnits.map((unit) => {
                const batchInUnit = activeBatches.find((b) => b.unitId === unit.id);
                const liveInUnit = batchInUnit ? storage.getLiveStockCount(batchInUnit.id) : 0;

                return (
                  <div
                    key={unit.id}
                    onClick={() => onNavigate('units')}
                    className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{unit.name}</span>
                      <span className="text-[11px] font-mono text-slate-500">{unit.volumeLiters} L</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                      <span>{unit.location}</span>
                      {batchInUnit ? (
                        <span className="text-emerald-700 font-medium font-mono tabular-nums">
                          {liveInUnit} ekor aktif
                        </span>
                      ) : (
                        <span className="text-slate-400">Kosong</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Water Quality Snippet */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">Kondisi Air Terakhir</h3>
              </div>
              <button
                onClick={() => onNavigate('water')}
                className="text-xs font-semibold text-sky-700 hover:text-sky-800"
              >
                Riwayat
              </button>
            </div>

            {storage.getWaterQualityRecords().length > 0 ? (
              (() => {
                const latest = storage.getWaterQualityRecords()[0];
                const unit = storage.getUnitById(latest.unitId);
                const isPhSafe = latest.phLevel >= 6.5 && latest.phLevel <= 8.5;
                const isTempSafe = latest.temperatureC >= 25 && latest.temperatureC <= 32;

                return (
                  <div className="space-y-3">
                    <div className="p-3 bg-sky-50/50 border border-sky-100 rounded-lg text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Wadah:</span>
                        <span className="font-semibold text-slate-800">{unit?.name || 'Unit'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Suhu Air:</span>
                        <span className={`font-mono font-semibold ${isTempSafe ? 'text-slate-900' : 'text-amber-700'}`}>
                          {latest.temperatureC}°C {isTempSafe ? '(Normal)' : '(Waspada)'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tingkat pH:</span>
                        <span className={`font-mono font-semibold ${isPhSafe ? 'text-slate-900' : 'text-amber-700'}`}>
                          {latest.phLevel} {isPhSafe ? '(Ideal)' : '(Asam/Basa)'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Warna Air:</span>
                        <span className="capitalize font-medium text-slate-800">
                          {latest.waterColor.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    {latest.notes && (
                      <p className="text-[11px] text-slate-500 italic">
                        "{latest.notes}"
                      </p>
                    )}
                  </div>
                );
              })()
            ) : (
              <p className="text-xs text-slate-400">Belum ada pencatatan parameter air.</p>
            )}
          </div>

          {/* Farm Advice Card */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/70 rounded-xl text-xs space-y-1 text-emerald-900">
            <h4 className="font-bold">Tips Budidaya Efisien:</h4>
            <p className="text-emerald-800 leading-relaxed">
              Jaga nilai FCR di bawah 1.15 untuk lele dengan teknik bibit seragam dan tidak memberi pakan berlebih saat cuaca mendung.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
