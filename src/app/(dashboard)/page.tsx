import { Card } from "@/components/ui/Card";
import { getDashboardStats } from "@/lib/dashboard-actions";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const stats = await getDashboardStats();

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  return (
    <main className="h-full overflow-y-auto p-10">
      <h1 className="text-3xl font-bold text-primary-green mb-6">DASHBOARD PERFORMA</h1>
      <div className="grid grid-cols-4 gap-6 mb-8">
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

      <Card variant="audit" className="mb-8 border-2 border-dashed border-[#00875A] bg-[#E6F4EA]/30 shadow-sm">
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
    </main>
  );
}
