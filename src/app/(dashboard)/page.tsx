import { Card } from "@/components/ui/Card";
import { getDashboardStats, getRevenueTrend, getPaymentRatios } from "@/lib/dashboard-actions";
import { RevenueChart, PaymentRatioChart } from "@/components/charts/DashboardCharts";
import { calculateZakatNisab } from "@/lib/zakat-actions";
import { ZakatWidget } from "@/components/dashboard/ZakatWidget";
import { formatRupiah } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const stats = await getDashboardStats();
  const trendData = await getRevenueTrend();
  const ratioData = await getPaymentRatios();
  const zakatData = await calculateZakatNisab();

return (
    <main className="h-full overflow-y-auto p-4 md:p-10">
      <h1 className="text-3xl font-bold text-primary-green mb-6">DASHBOARD PERFORMA</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <Card className="border-l-4 border-l-[#00875A] shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Total Kas</h3>
          <p className="text-2xl font-bold">{formatRupiah(stats.totalKas)}</p>
        </Card>
        <Card className="border-l-4 border-l-[#1E88E5] shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Omzet Hari Ini</h3>
          <p className="text-2xl font-bold text-[#00875A]">{formatRupiah(stats.omzetHariIni)}</p>
        </Card>
        <Card className="border-l-4 border-l-[#F4511E] shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Total HPP</h3>
          <p className="text-2xl font-bold text-[#D32F2F]">{formatRupiah(stats.totalHpp)}</p>
        </Card>
        <Card className="border-l-4 border-l-[#8E24AA] shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Laba Bersih</h3>
          <p className="text-2xl font-bold text-[#00875A]">{formatRupiah(stats.labaBersih)}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card variant="audit" className="h-full border-2 border-dashed border-[#00875A] bg-[#E6F4EA]/30 shadow-sm flex flex-col justify-center">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-primary-green flex items-center gap-2 mb-1">
                  <span>✨</span> Audit Kilat AI
                </h3>
                <p className="text-sm text-gray-700">{stats.audit.message}</p>
              </div>
              <button className="text-sm text-primary-green font-bold underline">Lihat Detail</button>
            </div>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <ZakatWidget initialData={zakatData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 pb-10">
        <div className="lg:col-span-2">
          <RevenueChart data={trendData} />
        </div>
        <div className="lg:col-span-1">
          <PaymentRatioChart data={ratioData} />
        </div>
      </div>
    </main>
  );
}
