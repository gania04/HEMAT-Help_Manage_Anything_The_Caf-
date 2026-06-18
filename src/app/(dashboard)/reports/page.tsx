import { getFinancialReports } from "@/lib/report-actions";
import { formatRupiah } from '@/lib/utils';
import ReportCard from './ReportCard';

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
          <ReportCard key={`report-${index}`} report={report} />
        ))}
      </div>
    </main>
  );
}
