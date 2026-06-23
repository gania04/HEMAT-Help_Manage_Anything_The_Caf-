'use client';

import { formatRupiah } from '@/lib/utils';
import { useState } from 'react';

export default function ReportCard({ report }: Readonly<{ report: Parameters<typeof JSON.stringify>[0] }>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'JURNAL'|'BUKU_BESAR'|'NERACA'|'LABA_RUGI'>('JURNAL');
  const [isDownloading, setIsDownloading] = useState(false);

  const operasional = report.omzet - report.hpp - report.laba;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDownloading(true);

    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      // 1. JURNAL UMUM
      csvContent += "=== JURNAL UMUM ===\nTanggal,Keterangan,Debit,Kredit\n";
      csvContent += `01 ${report.period},Kas,${report.omzet},0\n`;
      csvContent += `01 ${report.period},Pendapatan Penjualan,0,${report.omzet}\n`;
      csvContent += `01 ${report.period},HPP,${report.hpp},0\n`;
      csvContent += `01 ${report.period},Persediaan Barang,0,${report.hpp}\n`;
      csvContent += `30 ${report.period},Biaya Operasional,${Math.max(0, operasional)},0\n`;
      csvContent += `30 ${report.period},Kas,0,${Math.max(0, operasional)}\n\n`;

      // 2. LABA RUGI
      csvContent += "=== LAPORAN LABA RUGI ===\nDeskripsi,Jumlah\n";
      csvContent += `Pendapatan Penjualan,${report.omzet}\n`;
      csvContent += `Harga Pokok Penjualan (HPP),-${report.hpp}\n`;
      csvContent += `Laba Kotor,${report.omzet - report.hpp}\n`;
      csvContent += `Biaya Operasional,-${Math.max(0, operasional)}\n`;
      csvContent += `Laba Bersih,${report.laba}\n`;

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Laporan_Keuangan_${report.period.replace(' ', '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error(e);
      alert("Gagal mengunduh laporan.");
    }

    setIsDownloading(false);
  };

  return (
    <>
      <button 
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="w-full text-left bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between hover:shadow-md hover:border-[#00875A] transition cursor-pointer gap-4 md:gap-0"
      >
        <div>
          <h3 className="text-xl font-black text-[#00875A] mb-2">{report.period}</h3>
          <div className="flex items-center gap-2 text-sm">
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${report.status === 'Naik' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {report.status === 'Naik' ? '📈 Naik' : '📉 Turun'}
            </span>
            <span className="text-gray-500 font-medium">Klik untuk lihat rincian lengkap 📄</span>
          </div>
        </div>
        
        <div className="flex flex-wrap md:flex-nowrap gap-4 md:gap-8 text-left md:text-right w-full md:w-auto bg-gray-50 md:bg-transparent p-4 md:p-0 rounded-lg">
          <div>
            <p className="text-gray-500 text-xs md:text-sm mb-1 uppercase font-bold tracking-wider">Total Omzet</p>
            <p className="font-black text-[#00875A]">{formatRupiah(report.omzet)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs md:text-sm mb-1 uppercase font-bold tracking-wider">Total HPP</p>
            <p className="font-bold text-red-600">{formatRupiah(report.hpp)}</p>
          </div>
          <div className="md:pl-6 md:border-l border-gray-200">
            <p className="text-gray-500 text-xs md:text-sm mb-1 uppercase font-bold tracking-wider">Laba Bersih</p>
            <p className="font-black text-xl text-[#00875A]">{formatRupiah(report.laba)}</p>
          </div>
        </div>
      </button>

      {/* MODAL LAPORAN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-center p-4 bg-black/60 backdrop-blur-sm sm:items-center sm:p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            {/* Header */}
            <div className="bg-[#00875A] p-4 sm:p-6 text-white flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-black">Laporan {report.period}</h2>
                <p className="text-green-100 text-sm opacity-90 mt-1">Siklus Akuntansi Lengkap</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="bg-white text-[#00875A] p-2 sm:px-4 sm:py-2 rounded-lg font-bold text-sm hover:bg-green-50 transition flex items-center gap-2 shadow-sm"
                >
                  <span className="hidden sm:inline">{isDownloading ? 'Menyiapkan...' : '⬇️ Export CSV'}</span>
                  <span className="sm:hidden">⬇️</span>
                </button>
                <button onClick={() => setIsModalOpen(false)} className="bg-black/20 hover:bg-black/40 text-white p-2 rounded-lg transition">
                  ✕
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 shrink-0 overflow-x-auto custom-scrollbar">
              {[
                { id: 'JURNAL', label: 'Jurnal Umum' },
                { id: 'BUKU_BESAR', label: 'Buku Besar' },
                { id: 'NERACA', label: 'Neraca Saldo' },
                { id: 'LABA_RUGI', label: 'Laba Rugi' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as Parameters<typeof JSON.stringify>[0])}
                  className={`px-4 sm:px-6 py-3 sm:py-4 font-bold text-sm whitespace-nowrap transition-colors border-b-4 ${
                    activeTab === t.id ? 'border-[#00875A] text-[#00875A] bg-green-50/50' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-gray-50 custom-scrollbar">
              
              {/* TAB JURNAL UMUM */}
              {activeTab === 'JURNAL' && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-100 text-gray-600 border-b border-gray-200 uppercase text-xs">
                        <tr>
                          <th className="p-4 font-bold">Tanggal</th>
                          <th className="p-4 font-bold">Keterangan / Akun</th>
                          <th className="p-4 font-bold text-right">Debit</th>
                          <th className="p-4 font-bold text-right">Kredit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr className="hover:bg-gray-50">
                          <td className="p-4 whitespace-nowrap">01 {report.period.split(' ')[0]}</td>
                          <td className="p-4 font-bold">Kas</td>
                          <td className="p-4 text-right font-medium">{formatRupiah(report.omzet)}</td>
                          <td className="p-4 text-right text-gray-400">-</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="p-4"></td>
                          <td className="p-4 pl-10 text-gray-600">Pendapatan Penjualan</td>
                          <td className="p-4 text-right text-gray-400">-</td>
                          <td className="p-4 text-right font-medium">{formatRupiah(report.omzet)}</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="p-4 whitespace-nowrap">01 {report.period.split(' ')[0]}</td>
                          <td className="p-4 font-bold">Harga Pokok Penjualan</td>
                          <td className="p-4 text-right font-medium">{formatRupiah(report.hpp)}</td>
                          <td className="p-4 text-right text-gray-400">-</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="p-4"></td>
                          <td className="p-4 pl-10 text-gray-600">Persediaan Barang</td>
                          <td className="p-4 text-right text-gray-400">-</td>
                          <td className="p-4 text-right font-medium">{formatRupiah(report.hpp)}</td>
                        </tr>
                        {operasional > 0 && (
                          <>
                            <tr className="hover:bg-gray-50">
                              <td className="p-4 whitespace-nowrap">30 {report.period.split(' ')[0]}</td>
                              <td className="p-4 font-bold">Biaya Operasional</td>
                              <td className="p-4 text-right font-medium">{formatRupiah(operasional)}</td>
                              <td className="p-4 text-right text-gray-400">-</td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                              <td className="p-4"></td>
                              <td className="p-4 pl-10 text-gray-600">Kas</td>
                              <td className="p-4 text-right text-gray-400">-</td>
                              <td className="p-4 text-right font-medium">{formatRupiah(operasional)}</td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB BUKU BESAR */}
              {activeTab === 'BUKU_BESAR' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Akun Kas */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <h4 className="font-black text-[#00875A] border-b pb-2 mb-3">Akun Kas (111)</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-600"><span className="text-gray-400">Debit (Penerimaan)</span> <span>{formatRupiah(report.omzet)}</span></div>
                      <div className="flex justify-between text-gray-600"><span className="text-gray-400">Kredit (Pengeluaran)</span> <span>{formatRupiah(operasional)}</span></div>
                      <div className="flex justify-between font-bold pt-2 border-t mt-2">
                        <span>Saldo Akhir</span>
                        <span className="text-[#00875A]">{formatRupiah(report.omzet - operasional)}</span>
                      </div>
                    </div>
                  </div>
                  {/* Akun Pendapatan */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <h4 className="font-black text-blue-600 border-b pb-2 mb-3">Akun Pendapatan (411)</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-600"><span className="text-gray-400">Kredit (Penjualan)</span> <span>{formatRupiah(report.omzet)}</span></div>
                      <div className="flex justify-between font-bold pt-2 border-t mt-2">
                        <span>Saldo Akhir</span>
                        <span className="text-blue-600">{formatRupiah(report.omzet)}</span>
                      </div>
                    </div>
                  </div>
                  {/* Akun HPP */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <h4 className="font-black text-orange-600 border-b pb-2 mb-3">Akun HPP (511)</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-600"><span className="text-gray-400">Debit (Biaya Bahan)</span> <span>{formatRupiah(report.hpp)}</span></div>
                      <div className="flex justify-between font-bold pt-2 border-t mt-2">
                        <span>Saldo Akhir</span>
                        <span className="text-orange-600">{formatRupiah(report.hpp)}</span>
                      </div>
                    </div>
                  </div>
                  {/* Akun Persediaan */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <h4 className="font-black text-purple-600 border-b pb-2 mb-3">Akun Persediaan (114)</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-600"><span className="text-gray-400">Kredit (Penggunaan)</span> <span>{formatRupiah(report.hpp)}</span></div>
                      <div className="flex justify-between font-bold pt-2 border-t mt-2">
                        <span>Saldo Akhir</span>
                        <span className="text-purple-600">{formatRupiah(report.hpp)} (K)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB NERACA SALDO */}
              {activeTab === 'NERACA' && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#00875A] text-white uppercase text-xs">
                        <tr>
                          <th className="p-4 font-bold">Kode</th>
                          <th className="p-4 font-bold">Nama Akun</th>
                          <th className="p-4 font-bold text-right">Debit</th>
                          <th className="p-4 font-bold text-right">Kredit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr className="hover:bg-gray-50">
                          <td className="p-4 text-gray-400">111</td><td className="p-4 font-bold">Kas</td>
                          <td className="p-4 text-right font-medium">{formatRupiah(report.omzet - operasional)}</td><td className="p-4 text-right">-</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="p-4 text-gray-400">114</td><td className="p-4 font-bold">Persediaan Barang</td>
                          <td className="p-4 text-right">-</td><td className="p-4 text-right font-medium">{formatRupiah(report.hpp)}</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="p-4 text-gray-400">411</td><td className="p-4 font-bold">Pendapatan Penjualan</td>
                          <td className="p-4 text-right">-</td><td className="p-4 text-right font-medium">{formatRupiah(report.omzet)}</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="p-4 text-gray-400">511</td><td className="p-4 font-bold">Harga Pokok Penjualan</td>
                          <td className="p-4 text-right font-medium">{formatRupiah(report.hpp)}</td><td className="p-4 text-right">-</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="p-4 text-gray-400">512</td><td className="p-4 font-bold">Biaya Operasional</td>
                          <td className="p-4 text-right font-medium">{formatRupiah(operasional)}</td><td className="p-4 text-right">-</td>
                        </tr>
                        <tr className="bg-gray-100 font-black">
                          <td className="p-4" colSpan={2}>TOTAL NERACA SALDO</td>
                          <td className="p-4 text-right text-[#00875A]">{formatRupiah(report.omzet - operasional + report.hpp + operasional)}</td>
                          <td className="p-4 text-right text-[#00875A]">{formatRupiah(report.hpp + report.omzet)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB LABA RUGI */}
              {activeTab === 'LABA_RUGI' && (
                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200 max-w-2xl mx-auto">
                  <h3 className="text-center font-black text-2xl text-gray-800 mb-1">LAPORAN LABA RUGI</h3>
                  <p className="text-center text-gray-500 mb-8 pb-4 border-b">Periode: {report.period}</p>
                  
                  <div className="space-y-4 text-sm sm:text-base">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-700">Pendapatan Penjualan</span>
                      <span className="font-medium">{formatRupiah(report.omzet)}</span>
                    </div>
                    <div className="flex justify-between items-center text-red-600">
                      <span className="pl-4">Harga Pokok Penjualan (HPP)</span>
                      <span>({formatRupiah(report.hpp)})</span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-200 font-bold">
                      <span className="text-gray-800">Laba Kotor</span>
                      <span>{formatRupiah(report.omzet - report.hpp)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 text-red-600">
                      <span className="pl-4">Biaya Operasional</span>
                      <span>({formatRupiah(operasional)})</span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 mt-4 border-t-2 border-black font-black text-lg sm:text-xl">
                      <span className="text-[#00875A]">Laba Bersih</span>
                      <span className="text-[#00875A] bg-green-50 px-3 py-1 rounded-lg">{formatRupiah(report.laba)}</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}
