import React, { useState } from 'react';
import { X, Utensils, TrendingDown, Droplets, Wallet, BookOpen } from 'lucide-react';
import { storage } from '../services/storage';
import { MortalityCause, TransactionCategory, WaterColor } from '../types';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultBatchId?: string;
}

type LogType = 'pakan' | 'kematian' | 'air' | 'keuangan' | 'jurnal';

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  isOpen,
  onClose,
  defaultBatchId,
}) => {
  const [activeTab, setActiveTab] = useState<LogType>('pakan');

  const batches = storage.getActiveBatches();
  const units = storage.getUnits();

  const [selectedBatchId, setSelectedBatchId] = useState(
    defaultBatchId || (batches[0] ? batches[0].id : '')
  );
  const [selectedUnitId, setSelectedUnitId] = useState(
    units[0] ? units[0].id : ''
  );

  // Feeding form
  const [feedGrams, setFeedGrams] = useState(50);
  const [feedBrand, setFeedBrand] = useState('Pelet Apung Hi-Pro-Vite LP-1');
  const [feedTime, setFeedTime] = useState(
    new Date().toTimeString().substring(0, 5)
  );

  // Mortality form
  const [mortalityQty, setMortalityQty] = useState(1);
  const [mortalityCause, setMortalityCause] = useState<MortalityCause>('kualitas_air');
  const [mortalityNotes, setMortalityNotes] = useState('');

  // Water Quality form
  const [tempC, setTempC] = useState(28);
  const [ph, setPh] = useState(7.2);
  const [waterColor, setWaterColor] = useState<WaterColor>('hijau_muda');
  const [waterChangePercent, setWaterChangePercent] = useState(0);
  const [waterNotes, setWaterNotes] = useState('');

  // Finance form
  const [txType, setTxType] = useState<'expense' | 'income'>('expense');
  const [txCategory, setTxCategory] = useState<TransactionCategory>('pakan');
  const [txAmount, setTxAmount] = useState(35000);
  const [txDesc, setTxDesc] = useState('');

  // Journal form
  const [journalNotes, setJournalNotes] = useState('');
  const [fishBehavior, setFishBehavior] = useState('Lincah, nafsu makan tinggi');

  if (!isOpen) return null;

  const currentBatch = batches.find((b) => b.id === selectedBatchId);
  const unitId = currentBatch ? currentBatch.unitId : selectedUnitId;
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'pakan') {
      if (!selectedBatchId) return;
      storage.addFeedingLog({
        batchId: selectedBatchId,
        unitId: unitId,
        feedDate: today,
        feedTime: feedTime,
        feedBrand: feedBrand,
        amountGrams: Number(feedGrams),
        status: 'completed',
        notes: 'Dicatat via aksi cepat',
      });
    } else if (activeTab === 'kematian') {
      if (!selectedBatchId) return;
      storage.addMortalityRecord({
        batchId: selectedBatchId,
        unitId: unitId,
        date: today,
        quantity: Number(mortalityQty),
        suspectedCause: mortalityCause,
        notes: mortalityNotes,
      });
    } else if (activeTab === 'air') {
      storage.addWaterQualityRecord({
        unitId: selectedUnitId,
        batchId: selectedBatchId || undefined,
        recordedAt: `${today}T${feedTime}`,
        temperatureC: Number(tempC),
        phLevel: Number(ph),
        waterColor: waterColor,
        waterClarity: 'sedang',
        waterOdor: 'normal',
        waterChangePercent: Number(waterChangePercent),
        notes: waterNotes,
      });
    } else if (activeTab === 'keuangan') {
      storage.addTransaction({
        batchId: selectedBatchId || undefined,
        unitId: unitId || undefined,
        type: txType,
        category: txCategory,
        amount: Number(txAmount),
        date: today,
        description: txDesc || (txType === 'expense' ? `Pengeluaran ${txCategory}` : `Pemasukan ${txCategory}`),
      });
    } else if (activeTab === 'jurnal') {
      if (!selectedBatchId) return;
      storage.addJournal({
        batchId: selectedBatchId,
        unitId: unitId,
        entryDate: today,
        activityType: 'rutin',
        fishBehavior: fishBehavior,
        notes: journalNotes || 'Pemeriksaan rutin kolam budidaya.',
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Catat Cepat Lapangan</h3>
            <p className="text-xs text-slate-500">Pencatatan aktivitas operasional instan</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-5 p-2 bg-slate-100 gap-1 border-b border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('pakan')}
            className={`flex flex-col items-center py-2 rounded-lg transition-colors ${
              activeTab === 'pakan' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Utensils className="w-4 h-4 mb-1 text-emerald-600" />
            <span>Pakan</span>
          </button>
          <button
            onClick={() => setActiveTab('kematian')}
            className={`flex flex-col items-center py-2 rounded-lg transition-colors ${
              activeTab === 'kematian' ? 'bg-white text-red-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingDown className="w-4 h-4 mb-1 text-red-600" />
            <span>Kematian</span>
          </button>
          <button
            onClick={() => setActiveTab('air')}
            className={`flex flex-col items-center py-2 rounded-lg transition-colors ${
              activeTab === 'air' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Droplets className="w-4 h-4 mb-1 text-sky-600" />
            <span>Kualitas Air</span>
          </button>
          <button
            onClick={() => setActiveTab('keuangan')}
            className={`flex flex-col items-center py-2 rounded-lg transition-colors ${
              activeTab === 'keuangan' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wallet className="w-4 h-4 mb-1 text-emerald-600" />
            <span>Keuangan</span>
          </button>
          <button
            onClick={() => setActiveTab('jurnal')}
            className={`flex flex-col items-center py-2 rounded-lg transition-colors ${
              activeTab === 'jurnal' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 mb-1 text-indigo-600" />
            <span>Jurnal</span>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Target Batch Selector */}
          {activeTab !== 'air' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pilih Batch Ikan
              </label>
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batchName} — {b.species}
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeTab === 'air' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pilih Wadah / Kolam
              </label>
              <select
                value={selectedUnitId}
                onChange={(e) => setSelectedUnitId(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.type})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tab 1: Pakan */}
          {activeTab === 'pakan' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jumlah Pakan (Gram)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={feedGrams}
                    onChange={(e) => setFeedGrams(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono tabular-nums focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jam Pemberian
                  </label>
                  <input
                    type="time"
                    value={feedTime}
                    onChange={(e) => setFeedTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Merk / Jenis Pakan
                </label>
                <input
                  type="text"
                  value={feedBrand}
                  onChange={(e) => setFeedBrand(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:outline-none"
                  placeholder="Misal: Hi-Pro-Vite LP-1 / Maggot BSF"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Kematian */}
          {activeTab === 'kematian' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jumlah Ikan Mati (Ekor)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={mortalityQty}
                    onChange={(e) => setMortalityQty(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 text-sm border border-red-300 bg-red-50/30 rounded-lg font-mono tabular-nums text-red-900 focus:ring-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dugaan Penyebab
                  </label>
                  <select
                    value={mortalityCause}
                    onChange={(e) => setMortalityCause(e.target.value as MortalityCause)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="kualitas_air">Kualitas Air Menurun</option>
                    <option value="kanibalisme">Kanibalisme (Beda Ukuran)</option>
                    <option value="loncat">Loncat Keluar Wadah</option>
                    <option value="jamur_parasit">Jamur / Parasit Putih</option>
                    <option value="stres_cuaca">Stres Perubahan Cuaca / Hujan</option>
                    <option value="penyakit_bakteri">Infeksi Bakteri</option>
                    <option value="kembung">Perut Kembung</option>
                    <option value="tidak_diketahui">Penyebab Lain / Belum Tahu</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Gejala / Penanganan
                </label>
                <input
                  type="text"
                  value={mortalityNotes}
                  onChange={(e) => setMortalityNotes(e.target.value)}
                  placeholder="Misal: Insang pucat, segera kuras air 30%"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-500 italic">
                * Sistem otomatis mengurangi stok ikan hidup secara atomik tanpa mengurangi dua kali.
              </p>
            </div>
          )}

          {/* Tab 3: Air */}
          {activeTab === 'air' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Suhu Air (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempC}
                    onChange={(e) => setTempC(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono tabular-nums focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tingkat pH Air
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="14"
                    value={ph}
                    onChange={(e) => setPh(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono tabular-nums focus:ring-emerald-500 focus:outline-none"
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
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="hijau_muda">Hijau Muda (Ideal)</option>
                    <option value="hijau_pekat">Hijau Pekat</option>
                    <option value="cokelat">Cokelat Sehat (Probiotik)</option>
                    <option value="bening">Bening Baru</option>
                    <option value="keruh">Keruh Berlumpur</option>
                    <option value="merah_kehitaman">Merah / Kehitaman</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Persentase Kuras Air (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={waterChangePercent}
                    onChange={(e) => setWaterChangePercent(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono tabular-nums focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Kualitas Air
                </label>
                <input
                  type="text"
                  value={waterNotes}
                  onChange={(e) => setWaterNotes(e.target.value)}
                  placeholder="Misal: Ditambah garam krosok 2 genggam"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Tab 4: Keuangan */}
          {activeTab === 'keuangan' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTxType('expense')}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    txType === 'expense'
                      ? 'bg-red-50 text-red-700 border-red-500 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Pengeluaran (Biaya)
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('income')}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    txType === 'income'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-500 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Pemasukan (Hasil Jual)
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value as TransactionCategory)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:outline-none"
                  >
                    {txType === 'expense' ? (
                      <>
                        <option value="pakan">Pakan Ikan</option>
                        <option value="bibit">Bibit Ikan</option>
                        <option value="obat_vitamin">Obat & Vitamin</option>
                        <option value="peralatan">Peralatan / Wadah</option>
                        <option value="operasional">Listrik & Operasional</option>
                        <option value="lainnya">Pengeluaran Lainnya</option>
                      </>
                    ) : (
                      <>
                        <option value="penjualan_ikan">Penjualan Ikan Konsumsi</option>
                        <option value="penjualan_hasil_panen">Penjualan Hasil Panen</option>
                        <option value="lainnya">Pendapatan Lainnya</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nominal (Rp)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={txAmount}
                    onChange={(e) => setTxAmount(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono tabular-nums focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi / Keterangan
                </label>
                <input
                  type="text"
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  placeholder="Misal: Beli pelet 2 sak atau jual 10 kg lele"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Tab 5: Jurnal */}
          {activeTab === 'jurnal' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Perilaku / Respons Ikan
                </label>
                <input
                  type="text"
                  value={fishBehavior}
                  onChange={(e) => setFishBehavior(e.target.value)}
                  placeholder="Misal: Lincah merata, tidak menggantung di pojok"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Aktivitas Budidaya
                </label>
                <textarea
                  rows={3}
                  value={journalNotes}
                  onChange={(e) => setJournalNotes(e.target.value)}
                  placeholder="Tuliskan perlakuan hari ini (pemotongan kangkung, aerasi, pemberian molase, dll.)"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-600/30 transition-colors cursor-pointer"
            >
              Simpan Catatan
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
