import React from 'react';

export function PosLayout({
  children,
  cartPanel,
}: Readonly<{
  children: React.ReactNode;
  cartPanel: React.ReactNode;
}>) {
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
      </main>

      {/* Payment/Cart Panel Area */}
      <aside className="w-full lg:w-[400px] lg:h-full bg-white border-t-4 border-[#00875A] lg:border-t-0 lg:border-l lg:border-gray-200 flex flex-col shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.1)] lg:shadow-xl lg:z-20 shrink-0 relative">
        <div className="lg:hidden text-center py-2 bg-green-50 text-[#00875A] font-bold text-sm tracking-widest border-b border-green-100 flex justify-center items-center gap-2">
          <span>👇</span> SCROLL KE ATAS UNTUK LIHAT MENU <span>👇</span>
        </div>
        <div className="flex-1 lg:overflow-y-auto">
          {cartPanel}
        </div>
      </aside>
    </div>
  );
}
