import Link from 'next/link';
import Image from 'next/image';
import { cookies } from 'next/headers';
import logoIcon from '../../../../public/icon-192x192.png';

export default async function MainMenuPage() {
  const cookieStore = await cookies();
  const sessionData = cookieStore.get('hemat_session')?.value;
  let role = 'owner';
  let name = 'Pengguna';
  
  if (sessionData) {
    try {
      const parsed = JSON.parse(sessionData);
      role = (parsed.role || 'owner').toLowerCase();
      name = parsed.name || 'Pengguna';
    } catch(e) {}
  }

  const isOwner = role === 'owner';
  const isAdmin = role === 'admin';
  const isKasir = role === 'kasir';

  return (
    <div className="h-full bg-soft-gray p-4 md:p-8 flex flex-col items-center justify-center overflow-y-auto w-full">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden mt-4 mb-4">
        <div className="bg-[#00875A] p-6 text-white text-center relative">
          <div className="flex justify-center mb-4">
            <Image src={logoIcon} alt="HEMAT Logo" width={70} height={70} className="bg-white p-2 rounded-2xl shadow-lg" unoptimized />
          </div>
          <h1 className="text-3xl font-black mb-2 tracking-tight">Selamat Datang, {name}!</h1>
          <p className="text-green-100 font-medium">Pilih modul aplikasi yang ingin Anda buka hari ini</p>
        </div>

        <div className="p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 bg-white w-full">
          {(isOwner || isKasir || isAdmin) && (
            <Link href="/pos" className="group flex flex-col items-center text-center gap-3 p-6 md:p-8 rounded-2xl border-2 border-gray-100 bg-gray-50 hover:bg-[#E6F4EA] hover:border-[#00875A] transition-all shadow-sm hover:shadow-md">
              <div className="text-5xl md:text-6xl group-hover:scale-110 transition-transform">💻</div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-[#00875A] mb-2">Kasir (POS)</h2>
                <p className="text-gray-500 text-sm leading-relaxed">Catat pesanan, proses pembayaran, dan kelola struk pelanggan.</p>
              </div>
            </Link>
          )}

          {(isOwner || isAdmin) && (
            <Link href="/" className="group flex flex-col items-center text-center gap-3 p-6 md:p-8 rounded-2xl border-2 border-gray-100 bg-gray-50 hover:bg-[#E6F4EA] hover:border-[#00875A] transition-all shadow-sm hover:shadow-md">
              <div className="text-5xl md:text-6xl group-hover:scale-110 transition-transform">📊</div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-[#00875A] mb-2">Dashboard Utama</h2>
                <p className="text-gray-500 text-sm leading-relaxed">Lihat ringkasan pendapatan, pengeluaran, dan laporan Audit AI.</p>
              </div>
            </Link>
          )}

          {(isOwner || isAdmin) && (
            <Link href="/inventory" className="group flex flex-col items-center text-center gap-3 p-6 md:p-8 rounded-2xl border-2 border-gray-100 bg-gray-50 hover:bg-[#E6F4EA] hover:border-[#00875A] transition-all shadow-sm hover:shadow-md">
              <div className="text-5xl md:text-6xl group-hover:scale-110 transition-transform">📦</div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-[#00875A] mb-2">Inventori Gudang</h2>
                <p className="text-gray-500 text-sm leading-relaxed">Kelola stok bahan baku, resep menu, limbah, dan HPP.</p>
              </div>
            </Link>
          )}

          {(isOwner || isAdmin || isKasir) && (
            <Link href="/expenses" className="group flex flex-col items-center text-center gap-3 p-6 md:p-8 rounded-2xl border-2 border-gray-100 bg-gray-50 hover:bg-[#E6F4EA] hover:border-[#00875A] transition-all shadow-sm hover:shadow-md">
              <div className="text-5xl md:text-6xl group-hover:scale-110 transition-transform">💸</div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-[#00875A] mb-2">Keuangan Lainnya</h2>
                <p className="text-gray-500 text-sm leading-relaxed">Catat beban operasional, hutang piutang, dan dana sosial/zakat.</p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
