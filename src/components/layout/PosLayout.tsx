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
    <div className="flex flex-col lg:flex-row w-full lg:h-full bg-soft-gray lg:overflow-hidden relative min-h-screen lg:min-h-0">
      {/* Product Grid Area */}
      <main className="flex-1 flex flex-col lg:h-full min-w-0">
        <header className="bg-primary-green text-white p-4 flex justify-between items-center shadow-md z-10 shrink-0">
          <h1 className="text-xl font-bold">HEMAT POS</h1>
          <div className="text-sm bg-white/20 px-3 py-1 rounded-full">
            Koneksi: Online
          </div>
        </header>
        
        <div className="flex-1 p-4 md:p-6 lg:overflow-y-auto custom-scrollbar">
          {children}
        </div>

        {/* Sticky Bottom Bar for Mobile */}
        <div className="lg:hidden sticky bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] shrink-0 z-40">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[#00875A] text-white py-3 md:py-4 rounded-xl font-black shadow-md shadow-[#00875A]/20 text-lg flex justify-center items-center gap-2 active:scale-95 transition-transform"
          >
            <span className="text-2xl">🛒</span> BUKA KERANJANG BELANJA
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
