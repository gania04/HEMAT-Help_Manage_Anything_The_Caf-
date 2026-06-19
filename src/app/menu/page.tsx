import Link from 'next/link';
import Image from 'next/image';
import { cookies } from 'next/headers';
import { logoutUser } from '@/lib/auth-actions';
import logoIcon from '../../../public/icon-192x192.png';

export default async function MainMenuPage() {
  const cookieStore = await cookies();
  const sessionData = cookieStore.get('hemat_session')?.value;
  let role = 'owner';
  let name = 'Pengguna';
  
  if (sessionData) {
    try {
      const parsed = JSON.parse(sessionData);
      role = parsed.role;
      name = parsed.name;
    } catch(e) {}
  }

  return (
    <div className="min-h-screen bg-soft-gray p-4 md:p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-[#00875A] p-8 text-white text-center relative">
          <div className="flex justify-center mb-4">
            <Image src={logoIcon} alt="HEMAT Logo" width={80} height={80} className="bg-white p-2 rounded-2xl shadow-lg" unoptimized />
          </div>
          <h1 className="text-3xl font-black mb-2 tracking-tight">Selamat Datang, {name}!</h1>
          <p className="text-green-100 font-medium">Pilih modul aplikasi yang ingin Anda buka</p>
          <div className="absolute top-4 right-4">
            <form action={logoutUser}>
              <button className="text-sm font-bold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition">Keluar</button>
            </form>
          </div>
        </div>

        <div className="p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 bg-white">
          {(role === 'owner' || role === 'kasir' || role === 'admin') && (
            <Link href="/pos" className="group flex items-start gap-4 p-5 md:p-6 rounded-2xl border-2 border-transparent bg-gray-50 hover:bg-[#E6F4EA] hover:border-[#00875A]/30 transition-all shadow-sm hover:shadow-md">
              <div className="text-4xl md:text-5xl group-hover:scale-110 transition-transform">💻</div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-[#00875A] mb-1">Kasir (POS)</h2>
                <p className="text-gray-500 text-xs md:text-sm leading-relaxed">Catat pesanan, proses pembayaran, dan kelola struk pelanggan dengan cepat.</p>
              </div>
            </Link>
          )}

          {(role === 'owner' || role === 'admin') && (
            <Link href="/" className="group flex items-start gap-4 p-5 md:p-6 rounded-2xl border-2 border-transparent bg-gray-50 hover:bg-[#E6F4EA] hover:border-[#00875A]/30 transition-all shadow-sm hover:shadow-md">
              <div className="text-4xl md:text-5xl group-hover:scale-110 transition-transform">📊</div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-[#00875A] mb-1">Dashboard Utama</h2>
                <p className="text-gray-500 text-xs md:text-sm leading-relaxed">Lihat ringkasan pendapatan, pengeluaran, dan laporan Audit AI.</p>
              </div>
            </Link>
          )}

          {(role === 'owner' || role === 'admin') && (
            <Link href="/inventory" className="group flex items-start gap-4 p-5 md:p-6 rounded-2xl border-2 border-transparent bg-gray-50 hover:bg-[#E6F4EA] hover:border-[#00875A]/30 transition-all shadow-sm hover:shadow-md">
              <div className="text-4xl md:text-5xl group-hover:scale-110 transition-transform">📦</div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-[#00875A] mb-1">Inventori & HPP</h2>
                <p className="text-gray-500 text-xs md:text-sm leading-relaxed">Kelola stok bahan baku, resep menu, limbah, dan harga pokok penjualan.</p>
              </div>
            </Link>
          )}

          {(role === 'owner' || role === 'admin' || role === 'kasir') && (
            <Link href="/expenses" className="group flex items-start gap-4 p-5 md:p-6 rounded-2xl border-2 border-transparent bg-gray-50 hover:bg-[#E6F4EA] hover:border-[#00875A]/30 transition-all shadow-sm hover:shadow-md">
              <div className="text-4xl md:text-5xl group-hover:scale-110 transition-transform">💸</div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-[#00875A] mb-1">Keuangan Lainnya</h2>
                <p className="text-gray-500 text-xs md:text-sm leading-relaxed">Catat beban operasional, hutang piutang, dan dana sosial/zakat.</p>
              </div>
            </Link>
          )}
        </div>
      </div>
      <div className="mt-8 text-gray-400 text-xs md:text-sm font-medium tracking-wide">HEMAT &copy; Help Manage Anything The Café</div>
    </div>
  );
}
