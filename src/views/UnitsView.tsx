import React, { useState } from 'react';
import { Plus, Layers, X, Edit2, Trash2, Fish } from 'lucide-react';
import { storage } from '../services/storage';
import { CultivationUnit, UnitType } from '../types';

interface UnitsViewProps {
  onNavigate: (view: string) => void;
}

export const UnitsView: React.FC<UnitsViewProps> = ({ onNavigate }) => {
  const units = storage.getUnits();
  const batches = storage.getBatches();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<CultivationUnit | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<UnitType>('ember_80l');
  const [volumeLiters, setVolumeLiters] = useState(80);
  const [location, setLocation] = useState('Pekarangan');
  const [description, setDescription] = useState('');

  const handleOpenAdd = () => {
    setEditingUnit(null);
    setName('');
    setType('ember_80l');
    setVolumeLiters(80);
    setLocation('Pekarangan Rumah');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (unit: CultivationUnit) => {
    setEditingUnit(unit);
    setName(unit.name);
    setType(unit.type);
    setVolumeLiters(unit.volumeLiters);
    setLocation(unit.location);
    setDescription(unit.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    if (editingUnit) {
      storage.updateUnit(editingUnit.id, {
        name,
        type,
        volumeLiters: Number(volumeLiters),
        location,
        description,
      });
    } else {
      storage.addUnit({
        name,
        type,
        volumeLiters: Number(volumeLiters),
        location,
        status: 'active',
        description,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Yakin ingin menghapus unit wadah ini?')) {
      storage.deleteUnit(id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Manajemen Unit Wadah Budidaya
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar wadah pemeliharaan ikan mulai dari sistem Budikdamber 80L hingga kolam terpal dan beton.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors self-start cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tambah Wadah Baru</span>
        </button>
      </div>

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {units.map((unit) => {
          const activeBatch = batches.find((b) => b.unitId === unit.id && b.status === 'active');
          const batchHistory = batches.filter((b) => b.unitId === unit.id);
          const liveFish = activeBatch ? storage.getLiveStockCount(activeBatch.id) : 0;
          const waterLogs = storage.getWaterQualityRecords(unit.id);
          const latestWater = waterLogs[0];

          return (
            <div
              key={unit.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5 space-y-3.5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                      {unit.type.replace('_', ' ')}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">{unit.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{unit.location}</p>
                  </div>
                  <span className="text-sm font-bold font-mono text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                    {unit.volumeLiters.toLocaleString('id-ID')} L
                  </span>
                </div>

                {/* Status Box */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Status Wadah:</span>
                    <span className={`font-semibold ${unit.status === 'active' ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {unit.status === 'active' ? 'Aktif Digunakan' : 'Perawatan'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Batch Berjalan:</span>
                    {activeBatch ? (
                      <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                        {activeBatch.batchName}
                      </span>
                    ) : (
                      <span className="text-slate-400">Kosong (Siap Tebar)</span>
                    )}
                  </div>

                  {activeBatch && (
                    <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500">Ikan Hidup di Wadah:</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {liveFish} ekor ({activeBatch.species})
                      </span>
                    </div>
                  )}
                </div>

                {/* Latest Water Quality in this Unit */}
                {latestWater && (
                  <div className="text-[11px] text-slate-500 flex items-center justify-between px-1">
                    <span>pH Air: <strong className="font-mono text-slate-700">{latestWater.phLevel}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>Suhu: <strong className="font-mono text-slate-700">{latestWater.temperatureC}°C</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>Warna: <strong className="capitalize text-slate-700">{latestWater.waterColor.replace('_', ' ')}</strong></span>
                  </div>
                )}

                {unit.description && (
                  <p className="text-xs text-slate-500 italic">
                    "{unit.description}"
                  </p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Total {batchHistory.length} siklus
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(unit)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-200/60 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(unit.id)}
                    className="p-1.5 text-red-500 hover:text-red-700 rounded-md hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Unit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900">
                {editingUnit ? 'Edit Unit Wadah' : 'Tambah Unit Wadah Baru'}
              </h3>
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
                  Nama / Label Wadah
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Ember 80L #2 atau Kolam Terpal Bawah"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis Wadah
                  </label>
                  <select
                    value={type}
                    onChange={(e) => {
                      const newType = e.target.value as UnitType;
                      setType(newType);
                      if (newType === 'ember_80l') setVolumeLiters(80);
                      else if (newType === 'kolam_terpal') setVolumeLiters(2500);
                      else if (newType === 'kolam_beton') setVolumeLiters(4000);
                      else if (newType === 'bioflok') setVolumeLiters(3000);
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="ember_80l">Ember 80 Liter</option>
                    <option value="kolam_terpal">Kolam Terpal Bulat/Kotak</option>
                    <option value="kolam_beton">Kolam Beton / Semen</option>
                    <option value="bioflok">Kolam Bioflok</option>
                    <option value="keramba">Keramba Jaring Apung</option>
                    <option value="akuarium">Akuarium / Bak Kaca</option>
                    <option value="lainnya">Wadah Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Volume Air (Liter)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={volumeLiters}
                    onChange={(e) => setVolumeLiters(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono tabular-nums focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lokasi Wadah
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Misal: Halaman Belakang, Balkon Lt 2"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi / Perlengkapan
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Misal: Dilengkapi pot kangkung, aerator 2 titik, kran kuras bawah"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer"
                >
                  {editingUnit ? 'Simpan Perubahan' : 'Simpan Wadah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
