/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { approveVoid } from '@/lib/void-actions';
import { formatRupiah } from '@/lib/utils';

export default function VoidClient({ pendingVoids }: Readonly<{ pendingVoids: any[] }>) {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

const handleApprove = async (id: string) => {
    if (!confirm('Persetujuan ini akan mengembalikan stok bahan baku dan membatalkan pendapatan. Lanjutkan?')) return;
    
    setIsProcessing(id);
    try {
      await approveVoid(id);
      alert('Void berhasil disetujui! Stok telah dikembalikan.');
      globalThis.location.reload();
    } catch (_err: unknown) {
      alert('Gagal menyetujui void: ' + (_err as Error).message);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-10 bg-soft-gray overflow-y-auto h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-red-600">PERSETUJUAN VOID</h1>
        <p className="text-gray-500 mt-1">Daftar pengajuan pembatalan transaksi dari Kasir. Membutuhkan otorisasi Manajer.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
        <div className="bg-red-50 p-4 border-b border-red-100">
          <h2 className="font-bold text-red-700 flex items-center gap-2">
            <span>⚠️</span> Transaksi Menunggu Persetujuan ({pendingVoids.length})
          </h2>
        </div>
        <div className="w-full overflow-x-auto mb-4"><table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-gray-100 text-gray-500 text-sm">
              <th className="p-4 font-medium">No. Order / Waktu</th>
              <th className="p-4 font-medium">Detail Pesanan</th>
              <th className="p-4 font-medium">Nilai Void</th>
              <th className="p-4 font-medium text-right">Aksi Manajer</th>
            </tr>
          </thead>
          <tbody>
            {pendingVoids.map((trx) => (
              <tr key={trx.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                <td className="p-4">
                  <p className="font-bold text-gray-800">{trx.order_number}</p>
                  <p className="text-xs text-gray-400">{new Date(trx.created_at).toLocaleString('id-ID')}</p>
                </td>
                <td className="p-4">
                  <ul className="text-sm text-gray-600 list-disc pl-4">
                    {trx.transaction_items?.map((item: any, idx: number) => (
                      <li key={`void-${idx}`}>
                        {item.quantity}x {item.menus?.menu_name || 'Item'}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="p-4 font-bold text-red-600">
                  {formatRupiah(trx.total_amount)}
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handleApprove(trx.id)}
                    disabled={isProcessing === trx.id}
                    className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 transition shadow-sm"
                  >
                    {isProcessing === trx.id ? 'Memproses...' : 'Setujui (Approve)'}
                  </button>
                </td>
              </tr>
            ))}
            {pendingVoids.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-400 font-medium">Tidak ada pengajuan void saat ini.</td>
              </tr>
            )}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}
