import React from 'react';

export function PosLayout({
  children,
  cartPanel,
}: Readonly<{
  children: React.ReactNode;
  cartPanel: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-soft-gray overflow-hidden">
      {/* Product Grid Area */}
      <main className="flex-1 flex flex-col min-h-0">
        <header className="bg-primary-green text-white p-4 flex justify-between items-center shadow-md z-10 shrink-0">
          <h1 className="text-xl font-bold">HEMAT POS</h1>
          <div className="text-sm bg-white/20 px-3 py-1 rounded-full">
            Koneksi: Online
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </div>
      </main>

      {/* Payment/Cart Panel Area */}
      <aside className="w-full lg:w-[400px] h-[350px] lg:h-auto bg-white border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] lg:shadow-xl z-20 shrink-0">
        {cartPanel}
      </aside>
    </div>
  );
}
