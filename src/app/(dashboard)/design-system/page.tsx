import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function DesignSystem() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-10 space-y-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">Design System HEMAT</h1>
          <p className="text-gray-500">Standar visual & komponen sesuai Panduan UI (v1.2)</p>
        </div>

        <section>
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b">1. Typography</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Heading 1 (24px - 36px, Bold)</p>
              <h1 className="text-3xl font-bold text-primary-green">DASHBOARD PERFORMA</h1>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Heading 2 (20px - 24px, SemiBold)</p>
              <h2 className="text-2xl font-semibold text-gray-900">Total Kas Hari Ini</h2>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Body Text (14px - 16px, Regular)</p>
              <p className="text-base text-gray-700">Ini adalah contoh teks standar untuk deskripsi, laporan, atau instruksi ringan.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b">2. Colors</h2>
          <div className="flex gap-4 flex-wrap">
            <div className="w-32">
              <div className="h-20 bg-primary-green rounded-lg mb-2 shadow-inner"></div>
              <p className="font-bold text-sm">Primary Green</p>
              <p className="text-xs text-gray-500">#00875A</p>
            </div>
            <div className="w-32">
              <div className="h-20 bg-secondary-green rounded-lg mb-2 shadow-inner"></div>
              <p className="font-bold text-sm">Secondary Green</p>
              <p className="text-xs text-gray-500">#E6F4EA</p>
            </div>
            <div className="w-32">
              <div className="h-20 bg-action-red rounded-lg mb-2 shadow-inner"></div>
              <p className="font-bold text-sm">Action Red</p>
              <p className="text-xs text-gray-500">#D32F2F</p>
            </div>
            <div className="w-32">
              <div className="h-20 bg-soft-gray rounded-lg mb-2 border border-gray-200 shadow-inner"></div>
              <p className="font-bold text-sm">Soft Gray</p>
              <p className="text-xs text-gray-500">#F8F9FA</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b">3. Buttons</h2>
          <div className="space-y-6">
            <div className="flex gap-4 items-center">
              <Button variant="primary">MASUK SEKARANG</Button>
              <Button variant="secondary">Tambah Menu</Button>
              <Button variant="danger">Request Void</Button>
            </div>
            <div className="max-w-xs">
              <p className="text-sm text-gray-500 mb-2">POS Payment Button (Giant)</p>
              <Button variant="primary" size="giant">QRIS</Button>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b">4. Cards</h2>
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Total Omzet</h3>
              <p className="text-2xl font-bold text-primary-green">Rp 4.500.000</p>
            </Card>
            
            <Card variant="audit">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-primary-green flex items-center gap-2">
                    <span>✨</span> Audit Kilat AI
                  </h3>
                  <p className="text-sm mt-1">Margin aman. Stok kopi tersisa 5 porsi.</p>
                </div>
              </div>
            </Card>
          </div>
        </section>

      </main>
    </div>
  );
}
