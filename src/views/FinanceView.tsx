import React, { useState } from 'react';
import { Plus, Wallet, ArrowUpRight, ArrowDownRight, Trash2, X, Filter } from 'lucide-react';
import { storage } from '../services/storage';
import { TransactionCategory, TransactionType } from '../types';

interface FinanceViewProps {
  onNavigate: (view: string) => void;
}

const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  bibit: 'Bibit / Benih Ikan',
  pakan: 'Pakan Ikan',
  obat_vitamin: 'Obat, Probiotik & Garam',
  peralatan: 'Wadah & Peralatan Kolam',
  operasional: 'Listrik & Air Operasional',
  penjualan_ikan: 'Penjualan Ikan Konsumsi',
  penjualan_hasil_panen: 'Penjualan Hasil Panen',
  lainnya: 'Lainnya',
};

export const FinanceView: React.FC<FinanceViewProps> = ({ onNavigate }) => {
  const transactions = storage.getTransactions();
  const summary = storage.getFinancialSummary();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  
  // Form State
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<TransactionCategory>('pakan');
  const [amount, setAmount] = useState(50000);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    storage.addTransaction({
      type,
      category,
      amount: Number(amount),
      date,
      description: description || (type === 'expense' ? `Pengeluaran ${category}` : `Pemasukan ${category}`),
    });

    setIsModalOpen(false);
    setDescription('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus transaksi ini dari buku kas?')) {
      storage.deleteTransaction(id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Pencatatan Keuangan & Arus Kas
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Buku kas operasional budidaya ikan untuk memantau biaya modal, pakan, dan hasil penjualan panen.
          </p>
        </div>
        <button
          onClick={() => {
            setType('expense');
            setCategory('pakan');
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors self-start cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Catat Transaksi Baru</span>
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card 1: Pemasukan */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Total Pemasukan</span>
            <div className="p-1 rounded-md bg-emerald-50 text-emerald-600">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
            Rp {summary.totalIncome.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Dari penjualan panen dan ikan konsumsi
          </span>
        </div>

        {/* Card 2: Pengeluaran */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Total Pengeluaran (Modal)</span>
            <div className="p-1 rounded-md bg-red-50 text-red-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-red-700 tabular-nums">
            Rp {summary.totalExpense.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Bibit, pakan, probiotik & peralatan
          </span>
        </div>

        {/* Card 3: Saldo Kas */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Saldo Kas (Selisih Bersih)</span>
            <div className="p-1 rounded-md bg-slate-100 text-slate-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-2xl font-bold font-mono tabular-nums ${
              summary.balance >= 0 ? 'text-emerald-700' : 'text-red-700'
            }`}
          >
            Rp {summary.balance.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {summary.balance >= 0 ? 'Surplus operasional' : 'Masih dalam masa investasi awal'}
          </span>
        </div>

      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua Transaksi ({transactions.length})
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              filterType === 'expense' ? 'bg-white text-red-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pengeluaran ({transactions.filter((t) => t.type === 'expense').length})
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              filterType === 'income' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pemasukan ({transactions.filter((t) => t.type === 'income').length})
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Tanggal</th>
                <th className="py-2.5 px-4 font-semibold">Tipe</th>
                <th className="py-2.5 px-4 font-semibold">Kategori</th>
                <th className="py-2.5 px-4 font-semibold">Deskripsi</th>
                <th className="py-2.5 px-4 font-semibold text-right">Nominal</th>
                <th className="py-2.5 px-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Belum ada data transaksi keuangan pada kategori ini.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          tx.type === 'income'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                      {CATEGORY_LABELS[tx.category] || tx.category}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-sm truncate">
                      {tx.description}
                    </td>
                    <td
                      className={`py-3 px-4 font-mono font-bold text-right whitespace-nowrap ${
                        tx.type === 'income' ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Transaction */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900">Catat Transaksi Keuangan</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setType('expense');
                    setCategory('pakan');
                  }}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    type === 'expense'
                      ? 'bg-red-50 text-red-700 border-red-500 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Pengeluaran (Biaya)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType('income');
                    setCategory('penjualan_ikan');
                  }}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    type === 'income'
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
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:outline-none"
                  >
                    {type === 'expense' ? (
                      <>
                        <option value="pakan">Pakan Ikan</option>
                        <option value="bibit">Bibit / Benih Ikan</option>
                        <option value="obat_vitamin">Obat, Probiotik, Garam</option>
                        <option value="peralatan">Wadah & Peralatan</option>
                        <option value="operasional">Listrik & Air Operasional</option>
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
                    Nominal Transaksi (Rp)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono tabular-nums focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Transaksi
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi / Keterangan Transaksi
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Misal: Pembelian Pelet LP-1 5 kg di toko ternak"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer"
                >
                  Simpan Transaksi Kas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
