import React from 'react';

export function PosLayout({
  children,
  cartPanel,
}: Readonly<{
  children: React.ReactNode;
  cartPanel: React.ReactNode;
}>) {
  return (
    <div className="flex h-full w-full bg-soft-gray overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth">
      {/* Product Grid Area */}
      <main className="w-full shrink-0 lg:w-auto lg:flex-1 flex flex-col h-full snap-start">
        <header className="bg-primary-green text-white p-4 flex justify-between items-center shadow-md z-10 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">HEMAT POS</h1>
            <span className="lg:hidden text-xs bg-white/20 px-2 py-1 rounded-full animate-pulse border border-white/40">👉 Geser ke Kanan untuk Keranjang</span>
          </div>
          <div className="hidden md:block text-sm bg-white/20 px-3 py-1 rounded-full">
            Koneksi: Online
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </div>
      </main>

      {/* Payment/Cart Panel Area */}
      <aside className="w-[90vw] lg:w-[400px] shrink-0 h-full bg-white border-l border-gray-200 flex flex-col shadow-xl z-20 snap-start relative">
        {/* Indikator swipe untuk mobile */}
        <div className="absolute top-[50%] -left-[14px] bg-white border border-gray-200 rounded-full w-7 h-7 flex items-center justify-center shadow-md lg:hidden text-gray-500 font-bold text-xs">
          ◀
        </div>
        {cartPanel}
      </aside>
    </div>
  );
}
