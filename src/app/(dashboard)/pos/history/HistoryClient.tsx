'use client';

import { useState } from 'react';
import { requestVoid } from '@/lib/pos-actions';

export default function HistoryClient({ history }: { history: any[] }) {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  const handleVoid = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin mengajukan pembatalan (Void) untuk transaksi ini?')) return;
    
    setIsProcessing(id);
    try {
      await requestVoid(id);
      alert('Berhasil diajukan! Menunggu persetujuan Manajer.');
      window.location.reload();
    } catch (err: any) {
      alert('Gagal: ' + err.message);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="flex-1 p-10 bg-soft-gray overflow-y-auto h-full">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#00875A]">RIWAYAT KASIR</h1>
          <p className="text-gray-500 mt-1">Daftar transaksi yang telah dilakukan. Ajukan void jika terjadi kesalahan.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
              <th className="p-4 font-medium">No. Order / Waktu</th>
              <th className="p-4 font-medium">Item Pesanan</th>
              <th className="p-4 font-medium">Total Harga</th>
              <th className="p-4 font-medium">Metode / Status</th>
              <th className="p-4 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {history.map((trx) => (
              <tr key={trx.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                <td className="p-4">
                  <p className="font-bold text-gray-800">{trx.order_number}</p>
                  <p className="text-xs text-gray-400">{new Date(trx.created_at).toLocaleString('id-ID')}</p>
                </td>
                <td className="p-4">
                  <ul className="text-sm text-gray-600 list-disc pl-4">
                    {trx.transaction_items?.map((item: any, idx: number) => (
                      <li key={idx}>
                        {item.quantity}x {item.menus?.menu_name || 'Item'}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="p-4 font-bold text-[#00875A]">
                  {formatRupiah(trx.total_amount)}
                </td>
                <td className="p-4">
                  <p className="text-sm font-bold text-gray-700 capitalize">{trx.payment_method}</p>
                  <p className={`text-xs mt-1 font-bold ${
                    trx.status === 'completed' ? 'text-green-500' :
                    trx.status === 'pending_void' ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {trx.status === 'pending_void' ? 'Menunggu Void' : trx.status.toUpperCase()}
                  </p>
                </td>
                <td className="p-4 text-right">
                  {trx.status === 'completed' && (
                    <button 
                      onClick={() => handleVoid(trx.id)}
                      disabled={isProcessing === trx.id}
                      className="bg-white border border-red-200 text-red-500 hover:bg-red-50 px-3 py-1 rounded-md text-sm font-bold disabled:opacity-50 transition"
                    >
                      {isProcessing === trx.id ? '...' : 'Request Void'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400 font-medium">Belum ada transaksi.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
