'use client';
import React, { useState } from 'react';

export function PosLayout({
  children,
  cartPanel,
}: Readonly<{
  children: React.ReactNode;
  cartPanel: React.ReactNode;
}>) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="flex h-full w-full bg-soft-gray overflow-hidden relative">
      {/* Product Grid Area */}
      <main className="flex-1 flex flex-col h-full min-w-0">
        <header className="bg-primary-green text-white p-4 flex justify-between items-center shadow-md z-10 shrink-0">
          <h1 className="text-xl font-bold">HEMAT POS</h1>
          <div className="text-sm bg-white/20 px-3 py-1 rounded-full">
            Koneksi: Online
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 lg:pb-6 custom-scrollbar">
          {children}
        </div>

        {/* Floating Action Button for Mobile */}
        <div className="lg:hidden absolute bottom-6 left-6 right-6 z-30">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[#00875A] text-white py-4 rounded-xl font-black shadow-xl shadow-[#00875A]/30 text-lg flex justify-center items-center gap-2 border-2 border-white active:scale-95 transition-transform"
          >
            <span className="text-2xl">🛒</span> LIHAT KERANJANG & BAYAR
          </button>
        </div>
      </main>

      {/* Payment/Cart Panel Area (Drawer on Mobile, Sidebar on Desktop) */}
      <aside className={`
        fixed inset-0 z-50 bg-white flex flex-col transition-transform duration-300 ease-in-out
        ${isCartOpen ? 'translate-y-0' : 'translate-y-full'}
        lg:static lg:translate-y-0 lg:w-[400px] lg:h-full lg:border-l lg:border-gray-200 lg:shadow-xl lg:z-20 shrink-0
      `}>
        {/* Mobile Close Button Header */}
        <div className="lg:hidden p-4 bg-white border-b border-gray-100 flex justify-between items-center shadow-sm shrink-0">
          <h2 className="font-bold text-xl text-gray-800 flex items-center gap-2"><span>🛒</span> Keranjang Anda</h2>
          <button 
            onClick={() => setIsCartOpen(false)} 
            className="bg-red-50 text-red-500 w-10 h-10 rounded-full font-bold text-lg hover:bg-red-100 active:scale-95 transition-transform"
          >
            ✕
          </button>
        </div>
        
        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto">
          {cartPanel}
        </div>
      </aside>
    </div>
  );
}
