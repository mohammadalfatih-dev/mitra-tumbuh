import React, { useState } from 'react';
import { Plus, Fish, Layers, Calendar, ChevronRight, X, CheckCircle, Scale, DollarSign, Activity } from 'lucide-react';
import { storage } from '../services/storage';
import { BatchStatus, FishBatch } from '../types';

interface BatchesViewProps {
  onNavigate: (view: string) => void;
}

export const BatchesView: React.FC<BatchesViewProps> = ({ onNavigate }) => {
  const batches = storage.getBatches();
  const units = storage.getUnits();
  
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<FishBatch | null>(null);
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);

  // New Batch Form State
  const [batchName, setBatchName] = useState('');
  const [species, setSpecies] = useState('Ikan Lele Sangkuriang');
  const [unitId, setUnitId] = useState(units[0]?.id || '');
  const [initialCount, setInitialCount] = useState(100);
  const [initialSizeCm, setInitialSizeCm] = useState(7);
  const [seedPrice, setSeedPrice] = useState(40000);
  const [stockingDate, setStockingDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetDate, setTargetDate] = useState('');
  const [notes, setNotes] = useState('');

  // Harvest Form State
  const [harvestCount, setHarvestCount] = useState(0);
  const [harvestWeightKg, setHarvestWeightKg] = useState(0);
  const [sellingPricePerKg, setSellingPricePerKg] = useState(28000);
  const [buyerName, setBuyerName] = useState('Pengepul Pasar');
  const [harvestNotes, setHarvestNotes] = useState('');

  const filteredBatches = batches.filter((b) => {
    if (filterStatus === 'all') return true;
    return b.status === filterStatus;
  });

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitId || !batchName) return;

    storage.addBatch({
      unitId,
      species,
      batchName,
      initialCount: Number(initialCount),
      initialSizeCm: Number(initialSizeCm),
      seedPriceTotal: Number(seedPrice),
      stockingDate,
      status: 'active',
      targetHarvestDate: targetDate || undefined,
      currentAvgWeightGrams: 30,
      notes,
    });

    setIsModalOpen(false);
    // Reset form
    setBatchName('');
  };

  const handleHarvestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;

    const today = new Date().toISOString().split('T')[0];
    const revenue = Number(harvestWeightKg) * Number(sellingPricePerKg);

    storage.addHarvestRecord({
      batchId: selectedBatch.id,
      unitId: selectedBatch.unitId,
      harvestDate: today,
      quantityCount: Number(harvestCount),
      totalWeightKg: Number(harvestWeightKg),
      sellingPricePerKg: Number(sellingPricePerKg),
      revenueTotal: revenue,
      buyerName,
      notes: harvestNotes || 'Panen komersial',
    });

    setIsHarvestModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Manajemen Data Budidaya (Batch)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola siklus penebaran benih, pemantauan stok hidup otomatis, dan pencatatan panen.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors self-start cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tambah Batch Budidaya</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-slate-500">Filter Status:</span>
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              filterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({batches.length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              filterStatus === 'active' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Aktif ({batches.filter((b) => b.status === 'active').length})
          </button>
          <button
            onClick={() => setFilterStatus('harvested')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              filterStatus === 'harvested' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dipanen ({batches.filter((b) => b.status === 'harvested').length})
          </button>
        </div>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBatches.map((batch) => {
          const liveCount = storage.getLiveStockCount(batch.id);
          const unit = storage.getUnitById(batch.unitId);
          const survivalRate = storage.getSurvivalRate(batch.id);
          const fcrInfo = storage.getBatchFCR(batch.id);
          const now = new Date();
          const stockDate = new Date(batch.stockingDate);
          const ageDays = Math.max(1, Math.floor((now.getTime() - stockDate.getTime()) / 86400000));
          const totalFeedKg = storage.getBatchTotalFeedKg(batch.id);

          return (
            <div
              key={batch.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5 space-y-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">
                        {batch.species}
                      </span>
                      <span className="text-slate-300" aria-hidden="true">·</span>
                      <span className={`text-[11px] font-medium ${batch.status === 'active' ? 'text-emerald-700' : 'text-slate-500'}`}>
                        {batch.status === 'active' ? 'Aktif' : 'Selesai Panen'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {batch.batchName}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">Stok Hidup</span>
                    <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                      {liveCount}
                    </span>
                    <span className="text-[11px] text-slate-500 ml-1">ekor</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 px-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Wadah Budidaya</span>
                    <span className="font-semibold text-slate-700 truncate block">
                      {unit?.name || 'Tanpa Wadah'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Umur Penebaran</span>
                    <span className="font-semibold text-slate-700 block">
                      Hari ke-{ageDays}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tebar Awal</span>
                    <span className="font-mono font-semibold text-slate-700 block">
                      {batch.initialCount} ekor ({batch.initialSizeCm} cm)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Survival Rate (SR)</span>
                    <span className="font-mono font-semibold text-emerald-700 block">
                      {survivalRate.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  <div>
                    <span>Total Pakan: <strong className="font-mono">{totalFeedKg.toFixed(1)} kg</strong></span>
                  </div>
                  {fcrInfo.fcr && (
                    <div>
                      <span>FCR: <strong className="font-mono text-emerald-700">{fcrInfo.fcr}</strong></span>
                    </div>
                  )}
                </div>

                {batch.notes && (
                  <p className="text-[11px] text-slate-500 italic line-clamp-2">
                    "{batch.notes}"
                  </p>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedBatch(batch)}
                  className="text-xs font-semibold text-slate-700 hover:text-slate-900"
                >
                  Detail Mutasi Stok
                </button>
                {batch.status === 'active' && liveCount > 0 && (
                  <button
                    onClick={() => {
                      setSelectedBatch(batch);
                      setHarvestCount(liveCount);
                      setIsHarvestModalOpen(true);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100/70 hover:bg-emerald-200 rounded-md transition-colors"
                  >
                    Catat Panen
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Batch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900">Tambah Batch Budidaya Baru</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Batch / Siklus
                </label>
                <input
                  type="text"
                  required
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  placeholder="Misal: Siklus 2 - Lele Pekarangan"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis Ikan / Komoditas
                  </label>
                  <input
                    type="text"
                    required
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                    placeholder="Misal: Ikan Lele Sangkuriang"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pilih Wadah Budidaya
                  </label>
                  <select
                    value={unitId}
                    onChange={(e) => setUnitId(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:outline-none"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jumlah Awal Tebar (Ekor)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={initialCount}
                    onChange={(e) => setInitialCount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono tabular-nums focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ukuran Awal Benih (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={initialSizeCm}
                    onChange={(e) => setInitialSizeCm(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono tabular-nums focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Harga Beli Benih Total (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={seedPrice}
                    onChange={(e) => setSeedPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono tabular-nums focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Penebaran
                  </label>
                  <input
                    type="date"
                    required
                    value={stockingDate}
                    onChange={(e) => setStockingDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Tambahan
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Misal: Sumber benih BBI Depok, aklimatisasi 30 menit"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer"
                >
                  Simpan & Tebar Benih
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Movement Ledger Detail Modal */}
      {selectedBatch && !isHarvestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900">{selectedBatch.batchName}</h3>
                <p className="text-xs text-slate-500">Buku Besar Mutasi Stok Ikan (Event Ledger)</p>
              </div>
              <button
                onClick={() => setSelectedBatch(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-3 gap-2 text-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[11px] text-slate-400 block">Tebar Awal</span>
                  <span className="text-base font-bold font-mono text-slate-800">{selectedBatch.initialCount}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Kematian</span>
                  <span className="text-base font-bold font-mono text-red-600">
                    -{storage.getMortalityRecords(selectedBatch.id).reduce((s, m) => s + m.quantity, 0)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Stok Hidup Saat Ini</span>
                  <span className="text-base font-bold font-mono text-emerald-700">
                    {storage.getLiveStockCount(selectedBatch.id)} ekor
                  </span>
                </div>
              </div>

              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Riwayat Transaksi Pergerakan Stok
              </h4>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {storage.getStockMovements(selectedBatch.id).map((movement) => (
                  <div key={movement.id} className="p-3 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">
                        {movement.movementType === 'INITIAL' && 'Penebaran Awal'}
                        {movement.movementType === 'ADDITION' && 'Penambahan Benih'}
                        {movement.movementType === 'MORTALITY' && 'Kematian Ikan'}
                        {movement.movementType === 'HARVEST' && 'Pemanenan Ikan'}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{movement.notes}</div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-mono font-bold ${
                          movement.movementType === 'INITIAL' || movement.movementType === 'ADDITION'
                            ? 'text-emerald-700'
                            : 'text-red-600'
                        }`}
                      >
                        {movement.movementType === 'INITIAL' || movement.movementType === 'ADDITION' ? '+' : '-'}
                        {movement.quantity} ekor
                      </span>
                      <div className="text-[10px] text-slate-400">
                        {movement.createdAt.split('T')[0]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedBatch(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Harvest Record Modal */}
      {isHarvestModalOpen && selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900">Catat Hasil Panen</h3>
              <button
                onClick={() => setIsHarvestModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleHarvestSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-900">
                <div>Batch: <strong className="font-semibold">{selectedBatch.batchName}</strong></div>
                <div>Stok Hidup Tersedia: <strong className="font-mono">{storage.getLiveStockCount(selectedBatch.id)} ekor</strong></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jumlah Dipanen (Ekor)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={storage.getLiveStockCount(selectedBatch.id)}
                    required
                    value={harvestCount}
                    onChange={(e) => setHarvestCount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono tabular-nums focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Bobot Panen (Kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={harvestWeightKg}
                    onChange={(e) => setHarvestWeightKg(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono tabular-nums focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Harga Jual per Kg (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={sellingPricePerKg}
                    onChange={(e) => setSellingPricePerKg(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono tabular-nums focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pembeli / Pasar
                  </label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs flex justify-between items-center">
                <span className="text-slate-600">Total Nilai Penjualan:</span>
                <span className="font-bold text-emerald-700 text-sm font-mono">
                  Rp {(harvestWeightKg * sellingPricePerKg).toLocaleString('id-ID')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 italic">
                * Pendapatan panen akan otomatis dicatat ke Buku Kas Keuangan tanpa mengurangi stok hidup dua kali.
              </p>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer"
                >
                  Konfirmasi & Simpan Panen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
