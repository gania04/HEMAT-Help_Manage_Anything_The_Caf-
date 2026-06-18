'use client';

import { formatRupiah } from '@/lib/utils';
import { useState } from 'react';

export default function ReportCard({ report }: { report: any }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);

    try {
      const operasional = report.omzet - report.hpp - report.laba;

      // Buat konten CSV
      let csvContent = "data:text/csv;charset=utf-8,";

      // 1. JURNAL UMUM
      csvContent += "=== JURNAL UMUM ===\n";
      csvContent += "Tanggal,Keterangan,Debit,Kredit\n";
      csvContent += `01 ${report.period},Penjualan Tunai,${report.omzet},0\n`;
      csvContent += `01 ${report.period},HPP,${report.hpp},0\n`;
      csvContent += `01 ${report.period},Persediaan Barang,0,${report.hpp}\n`;
      csvContent += `30 ${report.period},Biaya Operasional,${operasional > 0 ? operasional : 0},0\n`;
      csvContent += `30 ${report.period},Kas (Keluar untuk operasional),0,${operasional > 0 ? operasional : 0}\n`;
      
      csvContent += "\n\n";

      // 2. LABA RUGI
      csvContent += "=== LAPORAN LABA RUGI ===\n";
      csvContent += "Deskripsi,Jumlah\n";
      csvContent += `Pendapatan Penjualan,${report.omzet}\n`;
      csvContent += `Harga Pokok Penjualan (HPP),-${report.hpp}\n`;
      csvContent += `Laba Kotor,${report.omzet - report.hpp}\n`;
      csvContent += `Biaya Operasional,-${operasional > 0 ? operasional : 0}\n`;
      csvContent += `Laba Bersih,${report.laba}\n`;

      // Eksekusi download
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Laporan_Keuangan_${report.period.replace(' ', '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (e) {
      console.error(e);
      alert("Gagal mengunduh laporan.");
    }

    setIsDownloading(false);
  };

  return (
    <div 
      onClick={handleDownload}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md hover:border-[#00875A] transition cursor-pointer"
    >
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
          {report.period} {isDownloading && <span className="text-xs text-[#00875A] font-normal animate-pulse">Menyiapkan Excel...</span>}
        </h3>
        <div className="flex items-center gap-2 text-sm">
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${report.status === 'Naik' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {report.status === 'Naik' ? '📈 Naik' : '📉 Turun'}
          </span>
          <span className="text-gray-500 font-medium text-blue-600">Klik untuk unduh Excel 📥</span>
        </div>
      </div>
      
      <div className="flex gap-8 text-right pointer-events-none">
        <div>
          <p className="text-gray-500 text-sm mb-1">Total Omzet</p>
          <p className="font-bold text-[#00875A]">{formatRupiah(report.omzet)}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm mb-1">Total HPP</p>
          <p className="font-bold text-red-600">{formatRupiah(report.hpp)}</p>
        </div>
        <div className="pl-6 border-l border-gray-100">
          <p className="text-gray-500 text-sm mb-1">Laba Bersih</p>
          <p className="font-bold text-xl text-[#00875A]">{formatRupiah(report.laba)}</p>
        </div>
      </div>
    </div>
  );
}
