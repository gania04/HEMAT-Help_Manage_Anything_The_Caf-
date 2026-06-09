/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CompliancePanel } from "@/components/settings/CompliancePanel";

export default function SettingsPage() {
  const users = [
    { id: 1, name: "Gania K.", role: "Owner", email: "gania@hemat.cafe", lastActive: "Baru saja" },
    { id: 2, name: "Andi Kasir", role: "Kasir", email: "andi@hemat.cafe", lastActive: "2 jam yang lalu" },
    { id: 3, name: "Budi Gudang", role: "Admin Inventaris", email: "budi@hemat.cafe", lastActive: "1 hari yang lalu" },
  ];

  return (
    <main className="flex-1 overflow-y-auto p-10 space-y-8 bg-soft-gray">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pengaturan & Kepatuhan</h1>
          <p className="text-gray-500">Pusat kendali operasional kafe, akses staf, dan kepatuhan sistem keamanan (Compliance).</p>
        </div>

        {/* Panel KYC dan Keamanan (EPIC 11) */}
        <section className="w-full mb-8">
          <CompliancePanel />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bagian Pengaturan Toko */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Profil Kafe</h2>
            <Card className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bisnis</label>
                <input 
                  type="text" 
                  defaultValue="HEMAT Cafe & Resto"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-primary-green focus:border-primary-green outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                <textarea 
                  defaultValue="Jl. Sudirman No. 123, Jakarta"
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-primary-green focus:border-primary-green outline-none transition-colors resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                  <input 
                    type="text" 
                    defaultValue="0812-3456-7890"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-primary-green focus:border-primary-green outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mata Uang</label>
                  <select className="w-full px-4 py-2 border rounded-lg focus:ring-primary-green focus:border-primary-green outline-none transition-colors bg-white">
                    <option>IDR - Rupiah</option>
                    <option>USD - US Dollar</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <Button variant="primary">Simpan Profil</Button>
              </div>
            </Card>
          </section>

          {/* Bagian Hak Akses & Pengguna */}
          <section className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-xl font-bold text-gray-800">Manajemen Staf</h2>
              <Button variant="secondary" className="text-sm px-3 py-1.5 h-auto">
                <span>+</span> Tambah Staf
              </Button>
            </div>
            
            <div className="space-y-4">
              {users.map(user => (
                <Card key={user.id} className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#E6F4EA] flex items-center justify-center text-primary-green font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-1 ${
                      user.role === 'Owner' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'Kasir' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {user.role}
                    </span>
                    <p className="text-xs text-gray-400">Aktif: {user.lastActive}</p>
                  </div>
                </Card>
              ))}
            </div>

            <Card variant="audit" className="mt-6 border-blue-200 bg-blue-50/50">
              <div className="flex gap-3">
                <span className="text-blue-500 text-xl">ℹ️</span>
                <div>
                  <h4 className="font-bold text-blue-800 text-sm">Informasi Peran Akses</h4>
                  <p className="text-xs text-blue-600 mt-1 leading-relaxed">
                    <strong>Owner</strong> memiliki akses penuh ke Dasbor dan Kepatuhan Hukum (KYC). <br/>
                    <strong>Kasir</strong> hanya dapat mengakses POS dan Laporan harian.<br/>
                  </p>
                </div>
              </div>
            </Card>

          </section>
        </div>
      </main>
  );
}
