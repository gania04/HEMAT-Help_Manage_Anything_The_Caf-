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
    { name: 'Persetujuan Void', path: '/void-approvals', icon: '⚠️', roles: ['owner'] },
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

  const menuItems = allMenuItems.filter(item => item.roles.includes(activeRole));

  return (
    <aside className="w-64 bg-[#00875A] text-white flex flex-col h-full">
      <div className="p-6 pb-4 flex items-center gap-3">
        <Image src="/icon-192x192.png" alt="HEMAT Logo" width={40} height={40} className="bg-white p-1 rounded-lg" unoptimized={true} />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">HEMAT</h1>
          <p className="text-[10px] text-[#E6F4EA]/80 leading-tight">Help Manage Anything<br/>The Café</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto pb-6">
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
  );
}
