import React from 'react';

export function PosLayout({
  children,
  cartPanel,
}: Readonly<{
  children: React.ReactNode;
  cartPanel: React.ReactNode;
}>) {
  return (
    <div className="flex h-full w-full bg-soft-gray overflow-hidden">
      {/* Product Grid Area */}
      <main className="flex-1 flex flex-col h-full">
        <header className="bg-primary-green text-white p-4 flex justify-between items-center shadow-md z-10">
          <h1 className="text-xl font-bold">HEMAT POS</h1>
          <div className="text-sm bg-white/20 px-3 py-1 rounded-full">
            Koneksi: Online
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>

      {/* Payment/Cart Panel Area */}
      <aside className="w-[400px] bg-white border-l border-gray-200 flex flex-col shadow-xl z-20">
        {cartPanel}
      </aside>
    </div>
  );
}
