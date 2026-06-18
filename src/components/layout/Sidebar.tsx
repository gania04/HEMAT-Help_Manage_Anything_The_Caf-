'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { logoutUser } from '@/lib/auth-actions';

export function Sidebar({ activeUser = 'Gania K.', activeRole = 'owner' }: Readonly<{ activeUser?: string, activeRole?: string }>) {
  const pathname = usePathname();

  const allMenuItems = [
    { name: 'Dashboard', path: '/', icon: '📊', roles: ['owner', 'admin'] },
    { name: 'POS Kasir', path: '/pos', icon: '💻', roles: ['owner', 'kasir', 'admin'] },
    { name: 'Riwayat Kasir', path: '/pos/history', icon: '📜', roles: ['owner', 'kasir', 'admin'] },
    { name: 'Persetujuan Void', path: '/void-approvals', icon: '⚠️', roles: ['owner', 'admin', 'kasir'] },
    { name: 'Kalkulator HPP', path: '/hpp', icon: '🧮', roles: ['owner', 'admin'] },
    { name: 'Inventaris', path: '/inventory', icon: '📦', roles: ['owner', 'admin'] },
    { name: 'Manajemen Limbah', path: '/waste', icon: '🗑️', roles: ['owner', 'admin'] },
    { name: 'Pengeluaran', path: '/expenses', icon: '💸', roles: ['owner', 'admin', 'kasir'] },
    { name: 'Persetujuan Owner', path: '/expenses/approvals', icon: '👑', roles: ['owner'] },
    { name: 'Hutang & Piutang', path: '/debts', icon: '💳', roles: ['owner', 'admin'] },
    { name: 'Dana Sosial & Zakat', path: '/social', icon: '🤝', roles: ['owner', 'admin'] },
    { name: 'Laporan Keuangan', path: '/reports', icon: '📈', roles: ['owner', 'admin'] },
    { name: 'Pengaturan & Akses', path: '/settings', icon: '⚙️', roles: ['owner'] },
  ];

  const [isOpen, setIsOpen] = React.useState(false);

  const menuItems = allMenuItems.filter(item => item.roles.includes(activeRole));

  // Tutup sidebar di mobile saat pindah halaman
    React.useEffect(() => {
    setTimeout(() => setIsOpen(false), 0);
  }, [pathname]);

  const activeMenuName = menuItems.find(m => m.path === pathname)?.name || 'HEMAT';

  return (
    <>
      {/* Mobile Top Navigation Bar */}
      <div className="md:hidden flex items-center justify-between bg-white text-gray-800 px-4 py-3 border-b shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Image src="/icon-192x192.png" alt="Logo" width={32} height={32} unoptimized={true} />
          <span className="font-bold text-[#00875A]">{activeMenuName}</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-[#E6F4EA] text-[#00875A] rounded-md"
        >
          <span className="text-xl">☰</span>
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-[#00875A] text-white flex flex-col h-[100dvh] md:h-full
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 pb-4 flex items-center justify-between md:justify-start gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Image src="/icon-192x192.png" alt="HEMAT Logo" width={40} height={40} className="bg-white p-1 rounded-lg" unoptimized={true} />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">HEMAT</h1>
              <p className="text-[10px] text-[#E6F4EA]/80 leading-tight">Help Manage Anything<br/>The Café</p>
            </div>
          </div>
          <button className="md:hidden text-white/70 text-2xl" onClick={() => setIsOpen(false)}>✕</button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto pb-6 min-h-0">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path} 
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive 
                    ? 'bg-[#E6F4EA] text-[#00875A] shadow-inner font-bold' 
                    : 'hover:bg-white/10 text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Info Akun / Petugas */}
        <div className="p-4 mx-4 mb-6 mt-auto bg-white/10 rounded-lg">
          <p className="text-xs text-[#E6F4EA]/80 mb-1">Petugas Aktif</p>
          <p className="font-bold flex items-center gap-2"><span>👤</span> {activeUser}</p>
          <form action={logoutUser}>
            <button type="submit" className="w-full text-left block mt-4 pt-3 border-t border-white/20 text-sm text-red-200 hover:text-white transition-colors flex items-center gap-2 font-medium">
              <span>🚪</span> Keluar Aplikasi
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
