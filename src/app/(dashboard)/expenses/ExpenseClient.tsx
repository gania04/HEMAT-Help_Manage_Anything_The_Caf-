/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { addExpense } from '@/lib/expense-actions';
import { formatRupiah } from '@/lib/utils';

function BudgetAlertCard({ budget, idx }: Readonly<{ budget: any, idx: number }>) {
  const ratioPercent = Math.min(Math.round(Number(budget.ratio) * 100), 100);
  
  let cardStyle = "bg-white border-green-200 text-green-700";
  let barStyle = "bg-green-500";
  let icon = "✅";

  if (budget.alertLevel === 'waspada') {
    cardStyle = "bg-yellow-50 border-yellow-300 text-yellow-800";
    barStyle = "bg-yellow-500";
    icon = "⚠️";
  } else if (budget.alertLevel === 'bahaya') {
    cardStyle = "bg-red-50 border-red-300 text-red-800";
    barStyle = "bg-red-500";
    icon = "🚨";
  }

  return (
    <div key={`expense-${exp.id || idx}`} className={`p-4 rounded-xl border shadow-sm ${cardStyle}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-sm">{String(budget.category)}</h3>
        <span>{icon}</span>
      </div>
      <div className="text-xl font-bold mb-1">{formatRupiah(Number(budget.spent))}</div>
      <div className="text-xs opacity-70 mb-3">dari limit {formatRupiah(Number(budget.limit))}</div>
      
      <div className="w-full bg-black/10 rounded-full h-2.5">
        <div className={`h-2.5 rounded-full ${barStyle}`} style={{ width: `${ratioPercent}%` }}></div>
      </div>
      <div className="text-right text-xs mt-1 font-bold">{ratioPercent}% Terpakai</div>
    </div>
  );
}

function ExpenseHistoryTable({ expenses }: Readonly<{ expenses: any[] }>) {
  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h2 className="font-bold text-gray-700">Riwayat Pengeluaran</h2>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white border-b border-gray-100 text-gray-500 text-sm">
            <th className="p-4 font-medium">Tanggal</th>
            <th className="p-4 font-medium">Kategori / Keterangan</th>
            <th className="p-4 font-medium">Nominal</th>
            <th className="p-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp) => {
            const statusClass = exp.status === 'approved' 
              ? 'bg-green-100 text-green-700' 
              : exp.status === 'rejected'  // NOSONAR
                ? 'bg-red-100 text-red-700' 
                : 'bg-yellow-100 text-yellow-700';
            const statusText = exp.status === 'pending_approval' ? 'Pending Owner' : String(exp.status).toUpperCase();

            return (
              <tr key={String(exp.id)} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="p-4 text-sm text-gray-600">
                  {new Date(String(exp.created_at)).toLocaleDateString('id-ID')}
                </td>
                <td className="p-4">
                  <p className="font-bold text-gray-800 text-sm">{String(exp.category)}</p>
                  <p className="text-xs text-gray-500">{String(exp.description || '-')}</p>
                </td>
                <td className="p-4 font-bold text-gray-800">
                  {formatRupiah(Number(exp.amount))}
                </td>
                <td className="p-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusClass}`}>
                    {statusText}
                  </span>
                </td>
              </tr>
            );
          })}
          {expenses.length === 0 && (
            <tr>
              <td colSpan={4} className="p-8 text-center text-gray-400 font-medium">Belum ada pengeluaran tercatat.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function ExpenseClient({ expenses, budgetAlerts }: Readonly<{ expenses: any[], budgetAlerts: any[] }>) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const category = formData.get('category') as string;
    const amount = Number(formData.get('amount'));
    const description = formData.get('description') as string;

    if (!category || !amount) return alert('Kategori dan Nominal wajib diisi!');

    setIsSubmitting(true);
    try {
      const res = await addExpense(category, amount, description);
      if (res.requiresApproval) {
        alert('Pengeluaran di atas Rp 5.000.000 berhasil dicatat, namun MENUNGGU PERSETUJUAN Owner.');
      } else {
        alert('Pengeluaran berhasil dicatat!');
      }
      (e.target as HTMLFormElement).reset();
    } catch (_err: unknown) {
      alert((_err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 p-10 bg-soft-gray overflow-y-auto h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#00875A]">PENCATATAN PENGELUARAN</h1>
        <p className="text-gray-500 mt-1">Catat beban operasional harian kafe dan pantau limit anggarannya.</p>
      </div>

      {/* Budget Alerts Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>📊</span> Pantauan Anggaran Bulan Ini
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {budgetAlerts.map((budget, idx) => (
            <BudgetAlertCard key={String(budget.category) || String(idx)} budget={budget} idx={idx} />
          ))}
          {budgetAlerts.length === 0 && (
            <p className="text-gray-400 text-sm">Belum ada pagu anggaran yang diatur di database.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Input */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-bold text-[#00875A] mb-4">Catat Baru</h2>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="category">Kategori</label>
              <select name="category" id="category" className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00875A] focus:border-transparent outline-none">
                <option value="Operasional (Listrik, Air)">Operasional (Listrik, Air)</option>
                <option value="Gaji Karyawan">Gaji Karyawan</option>
                <option value="Lain-lain">Lain-lain</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="amount">Nominal (Rp)</label>
              <input type="number" name="amount" id="amount" required min="1" placeholder="Contoh: 150000" className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00875A] focus:border-transparent outline-none" />
              <p className="text-xs text-gray-400 mt-1">*Lebih dari Rp 5.000.000 butuh persetujuan Owner</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="description">Keterangan</label>
              <textarea name="description" id="description" rows={3} placeholder="Beli token listrik 50rb..." className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00875A] focus:border-transparent outline-none"></textarea>
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-[#00875A] text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Pengeluaran'}
            </button>
          </form>
        </div>

        {/* Tabel Histori */}
        <ExpenseHistoryTable expenses={expenses} />
      </div>
    </div>
  );
}
