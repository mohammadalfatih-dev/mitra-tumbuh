import React, { useState } from 'react';
import { Fish, Check, Sparkles, Layers } from 'lucide-react';
import { storage } from '../services/storage';
import { UnitType } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_FISH = [
  'Ikan Lele Sangkuriang / Dumbo',
  'Ikan Nila Merah / Hitam',
  'Ikan Patin',
  'Ikan Gurame',
  'Ikan Bawal Air Tawar',
  'Ikan Mas',
  'Udang Vaname',
];

const UNIT_PRESETS: { type: UnitType; label: string; volume: number; desc: string }[] = [
  {
    type: 'ember_80l',
    label: 'Ember 80 Liter (Budikdamber)',
    volume: 80,
    desc: 'Cocok untuk skala rumahan pekarangan, 50-70 ekor lele + tanaman kangkung',
  },
  {
    type: 'kolam_terpal',
    label: 'Kolam Terpal Bulat D2 (2.500 Liter)',
    volume: 2500,
    desc: 'Diameter 2m, tinggi 1m. Populer untuk lele bioflok & nila',
  },
  {
    type: 'kolam_beton',
    label: 'Kolam Beton / Semen',
    volume: 4000,
    desc: 'Permanen dan kokoh untuk kapasitas tebar tinggi',
  },
  {
    type: 'bioflok',
    label: 'Kolam Sistem Bioflok',
    volume: 3000,
    desc: 'Memanfaatkan flok bakteri probiotik untuk efisiensi pakan tinggi',
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [farmName, setFarmName] = useState('Mina Tumbuh Lestari');
  const [ownerName, setOwnerName] = useState('Peternak Ikan');
  
  // Fish selection
  const [selectedFish, setSelectedFish] = useState('Ikan Lele Sangkuriang / Dumbo');
  const [isCustomFish, setIsCustomFish] = useState(false);
  const [customFishInput, setCustomFishInput] = useState('');

  // Unit setup
  const [unitType, setUnitType] = useState<UnitType>('ember_80l');
  const [unitName, setUnitName] = useState('Ember 80L #1');
  const [unitVolume, setUnitVolume] = useState(80);
  const [unitLocation, setUnitLocation] = useState('Pekarangan Rumah');

  // Initial Batch
  const [batchName, setBatchName] = useState('Batch 01');
  const [initialCount, setInitialCount] = useState(60);
  const [initialSizeCm, setInitialSizeCm] = useState(7);
  const [seedPrice, setSeedPrice] = useState(24000);

  if (!isOpen) return null;

  const handleFinish = () => {
    const finalSpecies = isCustomFish && customFishInput.trim() ? customFishInput.trim() : selectedFish;

    // 1. Update settings
    storage.updateSettings({
      farmName,
      ownerName,
      hasCompletedOnboarding: true,
      selectedFishPresets: [finalSpecies],
    });

    // 2. Create Unit
    const createdUnit = storage.addUnit({
      name: unitName,
      type: unitType,
      volumeLiters: unitVolume,
      location: unitLocation,
      status: 'active',
      description: `Wadah budidaya pertama (${unitType})`,
    });

    // 3. Create Batch
    const today = new Date().toISOString().split('T')[0];
    storage.addBatch({
      unitId: createdUnit.id,
      species: finalSpecies,
      batchName: `${batchName} - ${finalSpecies}`,
      initialCount: Number(initialCount),
      initialSizeCm: Number(initialSizeCm),
      seedPriceTotal: Number(seedPrice),
      stockingDate: today,
      status: 'active',
      currentAvgWeightGrams: 30,
      notes: 'Batch awal dibuat saat setup onboarding Mitra Tumbuh',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-5 text-white">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-200 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Setup Awal Mitra Tumbuh</span>
          </div>
          <h2 className="text-xl font-bold">Mulai Manajemen Budidaya Anda</h2>
          <p className="text-xs text-emerald-100 mt-1">
            Langkah {step} dari 3: {step === 1 ? 'Identitas Budidaya & Jenis Ikan' : step === 2 ? 'Wadah / Kolam Pertama' : 'Data Tebar Benih'}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Usaha / Usaha Ternak
                </label>
                <input
                  type="text"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Misal: Lele Berkah Farm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Jenis Komoditas Ikan
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                  {COMMON_FISH.map((fish) => {
                    const isSelected = !isCustomFish && selectedFish === fish;
                    return (
                      <button
                        type="button"
                        key={fish}
                        onClick={() => {
                          setSelectedFish(fish);
                          setIsCustomFish(false);
                        }}
                        className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold shadow-xs'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {fish}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2.5 pt-2.5 border-t border-slate-100">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCustomFish}
                      onChange={(e) => setIsCustomFish(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Atau masukkan jenis ikan / udang kustom</span>
                  </label>
                  {isCustomFish && (
                    <input
                      type="text"
                      value={customFishInput}
                      onChange={(e) => setCustomFishInput(e.target.value)}
                      placeholder="Misal: Ikan Gabus Haruan, Ikan Bilis, dll."
                      className="mt-2 w-full px-3 py-2 text-sm border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-emerald-50/30"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-700">
                Pilih Tipe Wadah Budidaya Pertama
              </label>

              <div className="space-y-2">
                {UNIT_PRESETS.map((preset) => {
                  const isSelected = unitType === preset.type;
                  return (
                    <div
                      key={preset.type}
                      onClick={() => {
                        setUnitType(preset.type);
                        setUnitVolume(preset.volume);
                        setUnitName(preset.label.split('(')[0].trim());
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{preset.label}</span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{preset.desc}</p>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Nama / Label Wadah
                  </label>
                  <input
                    type="text"
                    value={unitName}
                    onChange={(e) => setUnitName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Lokasi Penempatan
                  </label>
                  <input
                    type="text"
                    value={unitLocation}
                    onChange={(e) => setUnitLocation(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3.5">
              <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs text-emerald-900">
                <span className="font-semibold block mb-0.5">Ringkasan Setup:</span>
                <div>Ikan: <span className="font-medium">{isCustomFish ? customFishInput : selectedFish}</span></div>
                <div>Wadah: <span className="font-medium">{unitName} ({unitVolume} Liter)</span></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jumlah Tebar Awal (Ekor)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={initialCount}
                    onChange={(e) => setInitialCount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono tabular-nums focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ukuran Benih (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={initialSizeCm}
                    onChange={(e) => setInitialSizeCm(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono tabular-nums focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Biaya Pembelian Bibit (Rp)
                </label>
                <input
                  type="number"
                  value={seedPrice}
                  onChange={(e) => setSeedPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono tabular-nums focus:ring-emerald-500 focus:outline-none"
                  placeholder="Misal: 30000"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Akan otomatis dicatat ke jurnal keuangan pengeluaran bibit
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Kembali
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Lewati Setup
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
            >
              Lanjutkan
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-600/30 transition-colors"
            >
              Mulai Budidaya Sekarang
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
