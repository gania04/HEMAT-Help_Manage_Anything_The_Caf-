'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { logoutUser } from '@/lib/auth-actions';

export function Sidebar({ activeUser = 'Gania K.', activeRole = 'owner' }: Readonly<{ activeUser?: string, activeRole?: string }>) {
  const pathname = usePathname();

  const allMenuItems = [
    { name: 'Beranda', path: '/', icon: '🏠', roles: ['owner', 'admin', 'kasir'] },
    { name: 'Dashboard', path: '/dashboard', icon: '📊', roles: ['owner', 'admin'] },
    { name: 'POS Kasir', path: '/pos', icon: '💻', roles: ['owner', 'kasir', 'admin'] },
    { name: 'Riwayat Kasir', path: '/pos/history', icon: '📜', roles: ['owner', 'kasir', 'admin'] },
    { name: 'Persetujuan Void', path: '/void-approvals', icon: '⚠️', roles: ['owner', 'admin', 'kasir'] },
    { name: 'Kalkulator HPP', path: '/hpp', icon: '🧮', roles: ['owner', 'admin'] },
    { name: 'Daftar Resep', path: '/recipes', icon: '📋', roles: ['owner', 'admin'] },
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

  // Tutup sidebar saat pindah halaman
  React.useEffect(() => {
    setTimeout(() => setIsOpen(false), 0);
  }, [pathname]);

  const isBeranda = pathname === '/';

  return (
    <>
      {/* Global Top Left Logo Trigger */}
      <div className={`fixed top-4 left-4 z-40 ${!isBeranda ? 'md:hidden' : ''}`}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center p-1 bg-white shadow-lg rounded-2xl hover:scale-105 transition-transform"
          aria-label="Buka Menu"
        >
          <Image src="/icon-192x192.png" alt="Toggle Menu" width={48} height={48} unoptimized={true} className="rounded-xl" />
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          role="presentation"
          className={`fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity w-full h-full cursor-default border-none outline-none ${!isBeranda ? 'md:hidden' : ''}`}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Drawer / Persistent Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50
        w-72 bg-[#00875A] text-white flex flex-col h-[100dvh] shadow-2xl
        transition-transform duration-300 ease-in-out
        ${!isBeranda ? 'md:static md:translate-x-0 md:h-full md:shadow-none' : ''}
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 pb-4 flex items-center justify-between md:justify-start gap-3 flex-shrink-0 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition">
            <Image src="/icon-192x192.png" alt="HEMAT Logo" width={40} height={40} className="bg-white p-1 rounded-lg" unoptimized={true} />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">HEMAT</h1>
              <p className="text-[10px] text-[#E6F4EA]/80 leading-tight">Help Manage Anything<br/>The Café</p>
            </div>
          </Link>
          <button className={`text-white hover:text-white/70 text-2xl p-2 rounded-lg hover:bg-white/10 transition-colors ${!isBeranda ? 'md:hidden' : ''}`} onClick={() => setIsOpen(false)}>✕</button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4 min-h-0">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
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
        <div className="p-4 mx-4 mb-6 mt-auto bg-white/10 rounded-xl">
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
