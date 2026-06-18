/* eslint-disable react-hooks/set-state-in-effect */
'use client'

 
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CompliancePanel } from "@/components/settings/CompliancePanel";
import { createStaff } from "@/lib/auth-actions";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: true });
    if (data) setUsers(data);
    setIsLoading(false);
  };

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSaveProfile = () => {
    setIsSavingProfile(true);
    setTimeout(() => {
      alert("Profil Kafe berhasil diperbarui!");
      setIsSavingProfile(false);
    }, 800);
  };


  const handleAddStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await createStaff(formData);
    if (res.success) {
      alert("Staf berhasil ditambahkan!");
      setShowAddStaffModal(false);
      fetchUsers(); // Refresh list
    } else {
      alert("Gagal menambahkan staf: " + res.error);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8 bg-soft-gray relative">
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
                <Button 
                  variant="primary" 
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  className="disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSavingProfile ? "Menyimpan..." : "Simpan Profil"}
                </Button>
              </div>
            </Card>
          </section>

          {/* Bagian Hak Akses & Pengguna */}
          <section className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-xl font-bold text-gray-800">Manajemen Staf</h2>
              <Button onClick={() => setShowAddStaffModal(true)} variant="secondary" className="text-sm px-3 py-1.5 h-auto">
                <span>+</span> Tambah Staf
              </Button>
            </div>
            
            <div className="space-y-4">
              {isLoading ? (
                <p className="text-sm text-gray-500">Memuat data staf...</p>
              ) : users.length === 0 ? (
                <p className="text-sm text-gray-500">Belum ada staf.</p>
              ) : (
                users.map(user => {
                  const displayName = user.name || user.full_name || user.username || 'User';
                  return (
                    <Card key={user.id} className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#E6F4EA] flex items-center justify-center text-primary-green font-bold uppercase">
                          {displayName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{displayName}</h3>
                          <p className="text-sm text-gray-500">{user.email || `${user.username}@hemat.cafe`}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-1 ${
                          user.role === 'owner' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'kasir' ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {user.role}
                        </span>
                        <p className="text-xs text-gray-400">Aktif: Tercatat</p>
                      </div>
                    </Card>
                  );
                })
              )}
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

        {/* Modal Tambah Staf */}
        {showAddStaffModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Tambah Staf Baru</h2>
              <form onSubmit={handleAddStaff} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                  <input name="name" type="text" required className="w-full border rounded-lg px-3 py-2 outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green" placeholder="Cth: Budi Santoso" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Username</label>
                  <input name="username" type="text" required className="w-full border rounded-lg px-3 py-2 outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green" placeholder="budi_kasir" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input name="email" type="email" className="w-full border rounded-lg px-3 py-2 outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green" placeholder="budi@hemat.cafe" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input name="password" type="password" required className="w-full border rounded-lg px-3 py-2 outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green" placeholder="Minimal 6 karakter" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Peran (Role)</label>
                  <select name="role" className="w-full border rounded-lg px-3 py-2 bg-white outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green">
                    <option value="kasir">Kasir (Akses Terbatas)</option>
                    <option value="admin">Admin (Gudang & Operasional)</option>
                    <option value="owner">Owner (Akses Penuh)</option>
                  </select>
                </div>
                <div className="flex gap-3 justify-end mt-6">
                  <Button type="button" onClick={() => setShowAddStaffModal(false)} variant="secondary">Batal</Button>
                  <Button type="submit" variant="primary">Simpan Staf</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
  );
}
