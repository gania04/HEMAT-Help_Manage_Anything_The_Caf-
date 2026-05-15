'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutUser } from '@/lib/auth-actions';

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: '📊' },
    { name: 'POS Kasir', path: '/pos', icon: '💻' },
    { name: 'Kalkulator HPP', path: '/hpp', icon: '🧮' },
    { name: 'Inventaris', path: '/inventory', icon: '📦' },
    { name: 'Hutang & Piutang', path: '/debts', icon: '💳' },
    { name: 'Laporan Keuangan', path: '/reports', icon: '📈' },
    { name: 'Design System', path: '/design-system', icon: '🎨' },
  ];

  return (
    <aside className="w-64 bg-[#00875A] text-white flex flex-col min-h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight">HEMAT</h1>
        <p className="text-sm text-[#E6F4EA]/80">Help Manage Anything The Café</p>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-8">
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
      <div className="p-4 m-4 bg-white/10 rounded-lg">
        <p className="text-xs text-[#E6F4EA]/80 mb-1">Petugas Aktif</p>
        <p className="font-bold flex items-center gap-2"><span>👤</span> Gania K.</p>
        <form action={logoutUser}>
          <button type="submit" className="w-full text-left block mt-4 pt-3 border-t border-white/20 text-sm text-red-200 hover:text-white transition-colors flex items-center gap-2 font-medium">
            <span>🚪</span> Keluar Aplikasi
          </button>
        </form>
      </div>
    </aside>
  );
}
