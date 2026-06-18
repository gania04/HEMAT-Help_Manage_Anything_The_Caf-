/* eslint-disable react-hooks/set-state-in-effect */
 
 
'use client';

import { useState, useEffect } from 'react';
import { getDebts, payDebt } from '@/lib/debt-actions';
import { DebtItem } from '@/lib/mock-db';

import { formatRupiah } from '@/lib/utils';

export default function DebtsPage() {
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [activeTab, setActiveTab] = useState<'hutang' | 'piutang'>('hutang');
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const fetchDebts = async () => {
    const data = await getDebts();
    setDebts(data);
    setIsLoading(false);
  };

  useEffect(() => {
     
    fetchDebts();
  }, []);

  const handlePayment = async (id: string, remainingAmount: number) => {
    setProcessingId(id);
    setNotification(null);
    
    // Asumsikan bayar lunas seluruh sisa tagihan untuk simulasi ini
    const result = await payDebt(id, remainingAmount);
    
    if (result.success) {
      setNotification({ type: 'success', message: result.message || 'Pembayaran berhasil' });
       
    fetchDebts(); // Refresh data
    } else {
      setNotification({ type: 'error', message: result.error || 'Terjadi kesalahan' });
    }
    
    setProcessingId(null);
  };

const filteredData = debts.filter(d => d.type === activeTab);
  const totalAmount = filteredData.reduce((sum, item) => sum + item.amount, 0);
  const totalUnpaid = filteredData.reduce((sum, item) => sum + (item.amount - item.paidAmount), 0);

  return (
    <main className="h-full overflow-y-auto p-4 md:p-10 bg-soft-gray">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#00875A]">HUTANG & PIUTANG</h1>
          <p className="text-gray-500 mt-1">Manajemen tagihan supplier dan piutang pelanggan bebas riba.</p>
        </div>
        <button className="bg-[#00875A] text-white px-5 py-3 rounded-lg font-bold shadow-md hover:bg-green-700 transition flex items-center gap-2 active:scale-95">
          <span>➕</span> Catat Tagihan Baru
        </button>
      </div>

      {notification && (
        <div className={`mb-6 p-4 rounded-xl shadow-sm border font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2 ${
          notification.type === 'success' ? 'bg-[#E6F4EA] text-[#00875A] border-green-200' : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-lg opacity-50 hover:opacity-100">&times;</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <button 
          onClick={() => { setActiveTab('hutang'); setNotification(null); }}
          className={`flex-1 py-3 md:py-4 rounded-xl font-bold text-sm md:text-lg transition shadow-sm border-2 ${
            activeTab === 'hutang' ? 'bg-white text-[#D32F2F] border-[#D32F2F] shadow-[#D32F2F]/10' : 'bg-gray-50 text-gray-400 border-transparent hover:bg-white hover:text-gray-600'
          }`}
        >
          📉 Hutang Saya (Ke Supplier)
        </button>
        <button 
          onClick={() => { setActiveTab('piutang'); setNotification(null); }}
          className={`flex-1 py-3 md:py-4 rounded-xl font-bold text-sm md:text-lg transition shadow-sm border-2 ${
            activeTab === 'piutang' ? 'bg-white text-[#00875A] border-[#00875A] shadow-[#00875A]/10' : 'bg-gray-50 text-gray-400 border-transparent hover:bg-white hover:text-gray-600'
          }`}
        >
          📈 Piutang Pelanggan (Ke Kafe)
        </button>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-gray-500 font-medium mb-1">Total Keseluruhan {activeTab === 'hutang' ? 'Hutang' : 'Piutang'}</p>
            <p className="text-3xl font-black text-gray-800">{formatRupiah(totalAmount)}</p>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-5 text-8xl">
            {activeTab === 'hutang' ? '📉' : '📈'}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 font-medium mb-1">Total Sisa Tagihan (Belum Lunas)</p>
          <p className={`text-3xl font-black ${activeTab === 'hutang' ? 'text-[#D32F2F]' : 'text-[#00875A]'}`}>
            {formatRupiah(totalUnpaid)}
          </p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-4 md:p-10 text-center text-gray-500 font-bold flex flex-col items-center gap-3">
             <div className="w-8 h-8 border-4 border-[#00875A] border-t-transparent rounded-full animate-spin"></div>
             Memuat data tagihan...
          </div>
        ) : (
          <div className="w-full overflow-x-auto mb-4"><table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                <th className="p-4 font-medium">Pihak Terkait</th>
                <th className="p-4 font-medium">Keterangan</th>
                <th className="p-4 font-medium">Jatuh Tempo</th>
                <th className="p-4 font-medium text-right">Total Tagihan</th>
                <th className="p-4 font-medium text-right">Sisa Tagihan</th>
                <th className="p-4 font-medium text-center">Status</th>
                <th className="p-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr><td colSpan={7} className="p-4 md:p-10 text-center text-gray-400 font-medium">Belum ada catatan tagihan di kategori ini.</td></tr>
              ) : filteredData.map((item) => {
                const remaining = item.amount - item.paidAmount;
                const isPaid = item.status === 'Lunas';
                
                let remainingColorClass = 'text-gray-400';
                if (remaining > 0) {
                  remainingColorClass = activeTab === 'hutang' ? 'text-red-600' : 'text-green-600';
                }

                let actionButtonClass = 'bg-[#1E88E5] text-white hover:bg-blue-700';
                if (isPaid) {
                  actionButtonClass = 'bg-gray-100 text-gray-400 cursor-not-allowed';
                } else if (activeTab === 'hutang') {
                  actionButtonClass = 'bg-[#00875A] text-white hover:bg-green-700';
                }

                let actionButtonText = '💵 Terima Uang';
                if (processingId === item.id) {
                  actionButtonText = 'Memproses...';
                } else if (isPaid) {
                  actionButtonText = '✔ Lunas';
                } else if (activeTab === 'hutang') {
                  actionButtonText = '💵 Bayar Lunas';
                }

                return (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="p-4 font-bold text-gray-800">{item.counterparty}</td>
                    <td className="p-4 text-gray-600 text-sm max-w-[200px] truncate" title={item.description}>{item.description}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${isPaid ? 'bg-gray-100 text-gray-500' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                        {item.dueDate}
                      </span>
                    </td>
                    <td className="p-4 text-right font-medium">{formatRupiah(item.amount)}</td>
                    <td className={`p-4 text-right font-bold ${remainingColorClass}`}>
                      {formatRupiah(remaining)}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        isPaid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handlePayment(item.id, remaining)}
                        disabled={isPaid || processingId === item.id}
                        className={`px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition active:scale-95 flex items-center justify-center gap-2 ml-auto ${actionButtonClass}`}
                      >
                        {actionButtonText}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        )}
      </div>
    </main>
  );
}

