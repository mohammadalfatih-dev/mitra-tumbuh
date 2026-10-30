import React, { useState } from 'react';
import { Database, Download, Upload, RefreshCw, Copy, Check, ShieldAlert, Sparkles, Server, Trash2 } from 'lucide-react';
import { storage } from '../services/storage';

interface SettingsViewProps {
  onNavigate: (view: string) => void;
  onOpenOnboarding: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onNavigate, onOpenOnboarding }) => {
  const settings = storage.getSettings();

  const [farmName, setFarmName] = useState(settings.farmName);
  const [ownerName, setOwnerName] = useState(settings.ownerName);
  const [isCopied, setIsCopied] = useState(false);
  const [sqlPreview, setSqlPreview] = useState('');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storage.updateSettings({
      farmName,
      ownerName,
    });
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  const handleGenerateD1SQL = () => {
    const sql = storage.generateCloudflareD1SQL();
    setSqlPreview(sql);
  };

  const handleCopySQL = () => {
    const sql = sqlPreview || storage.generateCloudflareD1SQL();
    navigator.clipboard.writeText(sql);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadD1SQL = () => {
    const sql = sqlPreview || storage.generateCloudflareD1SQL();
    const blob = new Blob([sql], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `mitra_tumbuh_d1_${new Date().toISOString().split('T')[0]}.sql`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const jsonStr = storage.exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `mitra-tumbuh-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = storage.importJSON(content);
        if (success) {
          alert('Data backup berhasil diimpor!');
        } else {
          alert('Gagal mengimpor file. Pastikan format JSON sesuai.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleResetSample = () => {
    if (window.confirm('Muat ulang data contoh budidaya lele dan nila? Data saat ini akan diganti dengan preset.')) {
      storage.resetToSampleData();
    }
  };

  const handleClearAll = () => {
    if (window.confirm('PERINGATAN: Yakin ingin mengosongkan seluruh database budidaya? Tindakan ini tidak dapat dibatalkan.')) {
      storage.clearAllData();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Pengaturan & Sinkronisasi Cloudflare D1
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Konfigurasi identitas budidaya, pembuatan skrip SQL Cloudflare D1, dan backup data.
          </p>
        </div>
        <button
          onClick={onOpenOnboarding}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors self-start cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Buka Panduan Setup Awal</span>
        </button>
      </div>

      {/* Farm Profile Form */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Profil Budidaya / Usaha Ternak</h3>

        <form onSubmit={handleSaveSettings} className="space-y-4 max-w-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Usaha Budidaya
              </label>
              <input
                type="text"
                required
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Pemilik / Pembudidaya
              </label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
            >
              Simpan Profil
            </button>
            {isSavedNotice && (
              <span className="text-xs text-emerald-700 font-medium">
                Profil berhasil disimpan!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Cloudflare D1 SQL Generator Section */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-orange-50 text-orange-600 border border-orange-100">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Cloudflare D1 (SQLite) Migrations & Data Dump
              </h3>
              <p className="text-xs text-slate-500">
                Ekspor skema DDL 10 tabel dan INSERT query data aktif saat ini untuk dieksekusi di Cloudflare D1.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateD1SQL}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Pratinjau SQL
            </button>
            <button
              onClick={handleCopySQL}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{isCopied ? 'Tersalin' : 'Salin SQL'}</span>
            </button>
            <button
              onClick={handleDownloadD1SQL}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Unduh .sql</span>
            </button>
          </div>
        </div>

        {/* Code Box */}
        {sqlPreview && (
          <div className="relative">
            <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono max-h-64 overflow-y-auto overflow-x-auto border border-slate-800">
              {sqlPreview}
            </pre>
          </div>
        )}

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 space-y-1">
          <div className="font-semibold text-slate-800">Cara Menjalankan ke Cloudflare D1 via CLI:</div>
          <code className="block font-mono bg-white p-2 rounded border border-slate-200 text-slate-900 overflow-x-auto">
            wrangler d1 execute mitra-tumbuh-db --file=./migrations/0001_initial_schema.sql
          </code>
        </div>
      </div>

      {/* Backup, Restore & Reset Section */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Cadangan Data & Pengaturan Database</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Backup JSON */}
          <button
            onClick={handleExportJSON}
            className="flex items-center justify-center gap-2 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Backup JSON</span>
          </button>

          {/* Restore JSON */}
          <label className="flex items-center justify-center gap-2 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-sky-600" />
            <span>Impor Backup JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>

          {/* Reset to Sample Data */}
          <button
            onClick={handleResetSample}
            className="flex items-center justify-center gap-2 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-indigo-600" />
            <span>Muat Data Contoh</span>
          </button>

          {/* Clear All */}
          <button
            onClick={handleClearAll}
            className="flex items-center justify-center gap-2 p-3 rounded-lg border border-red-200 hover:bg-red-50 text-xs font-semibold text-red-600 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
            <span>Kosongkan Database</span>
          </button>

        </div>
      </div>

    </div>
  );
};
