'use client';

import { useState } from 'react';
import { approveExpense, rejectExpense } from '@/lib/expense-actions';

export default function ApprovalClient({ pendingExpenses }: { pendingExpenses: any[] }) {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    if (!confirm(`Apakah Anda yakin ingin ${action === 'approve' ? 'MENYETUJUI' : 'MENOLAK'} pengeluaran ini?`)) return;
    
    setIsProcessing(id);
    try {
      if (action === 'approve') {
        await approveExpense(id);
        alert('Pengeluaran disetujui!');
      } else {
        await rejectExpense(id);
        alert('Pengeluaran ditolak!');
      }
      window.location.reload();
    } catch (err: any) {
      alert('Gagal: ' + err.message);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="flex-1 p-10 bg-soft-gray overflow-y-auto h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-yellow-600">PERSETUJUAN PENGELUARAN (OWNER)</h1>
        <p className="text-gray-500 mt-1">Daftar beban operasional bernilai besar (&gt; Rp 5.000.000) yang tertahan dan wajib di-ACC Owner.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-yellow-200 overflow-hidden">
        <div className="bg-yellow-50 p-4 border-b border-yellow-200">
          <h2 className="font-bold text-yellow-800 flex items-center gap-2">
            <span>🛡️</span> Menunggu Persetujuan ({pendingExpenses.length})
          </h2>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-gray-100 text-gray-500 text-sm">
              <th className="p-4 font-medium">Tanggal</th>
              <th className="p-4 font-medium">Kategori & Keterangan</th>
              <th className="p-4 font-medium">Nominal Request</th>
              <th className="p-4 font-medium text-right">Aksi Owner</th>
            </tr>
          </thead>
          <tbody>
            {pendingExpenses.map((exp) => (
              <tr key={exp.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                <td className="p-4 text-sm text-gray-600">
                  {new Date(exp.created_at).toLocaleString('id-ID')}
                </td>
                <td className="p-4">
                  <p className="font-bold text-gray-800">{exp.category}</p>
                  <p className="text-sm text-gray-500">{exp.description}</p>
                </td>
                <td className="p-4 font-bold text-yellow-600 text-lg">
                  {formatRupiah(exp.amount)}
                </td>
                <td className="p-4 text-right">
                  <div className="flex gap-2 justify-end">
                    <button 
                      onClick={() => handleAction(exp.id, 'reject')}
                      disabled={isProcessing === exp.id}
                      className="bg-white border border-red-200 text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-bold disabled:opacity-50 transition"
                    >
                      Tolak
                    </button>
                    <button 
                      onClick={() => handleAction(exp.id, 'approve')}
                      disabled={isProcessing === exp.id}
                      className="bg-[#00875A] text-white hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 transition shadow-sm"
                    >
                      {isProcessing === exp.id ? '...' : 'Setujui (Approve)'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {pendingExpenses.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-400 font-medium">Tidak ada antrian persetujuan saat ini.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
