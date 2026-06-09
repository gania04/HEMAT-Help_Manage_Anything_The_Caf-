import { getFinancialReports } from "@/lib/report-actions";
import { formatRupiah } from '@/lib/utils';

export default async function ReportsPage() {
  const reports = await getFinancialReports();

return (
    <main className="h-full overflow-y-auto p-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#00875A]">LAPORAN KEUANGAN</h1>
        <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-gray-50 transition flex items-center gap-2">
          <span>⬇️</span> Download PDF
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {reports.map((report, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">{report.period}</h3>
              <div className="flex items-center gap-2 text-sm">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${report.status === 'Naik' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {report.status === 'Naik' ? '📈 Naik' : '📉 Turun'}
                </span>
                <span className="text-gray-500">dibandingkan bulan sebelumnya</span>
              </div>
            </div>
            
            <div className="flex gap-8 text-right">
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
        ))}
      </div>
    </main>
  );
}
