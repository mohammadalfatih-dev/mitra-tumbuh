import React from 'react';
import { BarChart3, Download, TrendingDown, CheckCircle, Scale, Utensils, Fish } from 'lucide-react';
import { storage } from '../services/storage';

interface ReportsViewProps {
  onNavigate: (view: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onNavigate }) => {
  const batches = storage.getBatches();
  const summary = storage.getFinancialSummary();
  const totalLive = storage.getTotalCurrentLiveStock();
  const totalInitial = storage.getTotalInitialFish();
  const totalMortality = storage.getTotalMortalities();
  const totalHarvest = storage.getTotalHarvestedFish();
  const totalHarvestWeight = storage.getTotalHarvestedWeightKg();
  const overallSR = storage.getSurvivalRate();

  const handleExportCSV = () => {
    let csv = 'Batch Name,Species,Unit,Initial Count,Live Count,Mortality,Harvested Count,Harvested Weight (Kg),Survival Rate (%),Total Feed (Kg),Estimated FCR\n';
    
    batches.forEach((b) => {
      const live = storage.getLiveStockCount(b.id);
      const mort = storage.getMortalityRecords(b.id).reduce((s, m) => s + m.quantity, 0);
      const hrv = storage.getHarvestRecords(b.id).reduce((s, h) => s + h.quantityCount, 0);
      const hrvKg = storage.getHarvestRecords(b.id).reduce((s, h) => s + h.totalWeightKg, 0);
      const sr = storage.getSurvivalRate(b.id).toFixed(1);
      const feedKg = storage.getBatchTotalFeedKg(b.id).toFixed(2);
      const fcr = storage.getBatchFCR(b.id).fcr || '-';
      const unit = storage.getUnitById(b.unitId)?.name || 'Unit';

      csv += `"${b.batchName}","${b.species}","${unit}",${b.initialCount},${live},${mort},${hrv},${hrvKg},${sr},${feedKg},${fcr}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `mitra-tumbuh-laporan-budidaya-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Laporan Kinerja Budidaya Perikanan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluasi menyeluruh siklus produksi, rasio pakan (FCR), tingkat kelangsungan hidup (SR), dan efisiensi biaya.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs transition-colors self-start cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Ekspor CSV Laporan</span>
        </button>
      </div>

      {/* Aggregate Production Scoreboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Rata-rata Kelangsungan Hidup (SR)</span>
          <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
            {overallSR.toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Target standar budidaya: &gt; 80%
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Total Panen Terwujud</span>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {totalHarvestWeight} <span className="text-xs font-normal text-slate-500">kg</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Setara {totalHarvest.toLocaleString('id-ID')} ekor ikan
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Pendapatan Panen</span>
          <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
            Rp {summary.totalIncome.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Hasil penjualan ke pasar / konsumen
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Laba Bersih Kas</span>
          <div
            className={`text-2xl font-bold font-mono tabular-nums ${
              summary.balance >= 0 ? 'text-emerald-700' : 'text-red-700'
            }`}
          >
            Rp {summary.balance.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Selisih penerimaan dikurangi modal
          </span>
        </div>

      </div>

      {/* Batches Comprehensive Performance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Performa Detail per Batch Budidaya</h3>
          <span className="text-xs text-slate-400">{batches.length} batch terdaftar</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Batch & Spesies</th>
                <th className="py-2.5 px-4 font-semibold">Wadah</th>
                <th className="py-2.5 px-4 font-semibold text-center">Tebar Awal</th>
                <th className="py-2.5 px-4 font-semibold text-center">Stok Hidup</th>
                <th className="py-2.5 px-4 font-semibold text-center">Kematian</th>
                <th className="py-2.5 px-4 font-semibold text-center">Panen (Kg)</th>
                <th className="py-2.5 px-4 font-semibold text-center">SR (%)</th>
                <th className="py-2.5 px-4 font-semibold text-center">Pakan (Kg)</th>
                <th className="py-2.5 px-4 font-semibold text-center">FCR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {batches.map((batch) => {
                const live = storage.getLiveStockCount(batch.id);
                const unit = storage.getUnitById(batch.unitId);
                const mort = storage.getMortalityRecords(batch.id).reduce((s, m) => s + m.quantity, 0);
                const hrv = storage.getHarvestRecords(batch.id).reduce((s, h) => s + h.totalWeightKg, 0);
                const sr = storage.getSurvivalRate(batch.id);
                const feed = storage.getBatchTotalFeedKg(batch.id);
                const fcrData = storage.getBatchFCR(batch.id);

                return (
                  <tr key={batch.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{batch.batchName}</div>
                      <div className="text-[11px] text-slate-400">{batch.species}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700 whitespace-nowrap">
                      {unit?.name || '-'}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-medium whitespace-nowrap">
                      {batch.initialCount}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700 whitespace-nowrap">
                      {live}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-red-600 whitespace-nowrap">
                      {mort}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-medium whitespace-nowrap">
                      {hrv > 0 ? `${hrv} kg` : '-'}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-900 whitespace-nowrap">
                      {sr.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-center font-mono whitespace-nowrap">
                      {feed.toFixed(1)} kg
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-emerald-800 whitespace-nowrap">
                      {fcrData.fcr || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
