'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/Card";
import { saveGoldPrice } from "@/lib/zakat-actions";

type ZakatProps = {
  initialData: {
    totalAssets: number;
    nisab: number;
    goldPrice: number;
    isNisabReached: boolean;
    zakatAmount: number;
  };
};

export function ZakatWidget({ initialData }: Readonly<ZakatProps>) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [newPrice, setNewPrice] = useState(initialData.goldPrice.toString());
  const [isLoading, setIsLoading] = useState(false);

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    await saveGoldPrice(Number(newPrice), 'MANUAL');
    setIsLoading(false);
    setIsUpdating(false);
  };

  return (
    <Card className="border border-yellow-200 shadow-sm relative overflow-hidden h-full flex flex-col">
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-bl-full -z-10 opacity-50"></div>
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-yellow-700 flex items-center gap-2 text-lg">
            <span>🕌</span> Kewajiban Zakat Maal
          </h3>
          <p className="text-sm text-gray-500">Pemantauan Nisab & Harga Emas</p>
        </div>
        <span className={`px-3 py-1 text-xs font-bold rounded-full ${initialData.isNisabReached ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {initialData.isNisabReached ? 'Wajib Zakat' : 'Belum Nisab'}
        </span>
      </div>

      <div className="space-y-4 flex-1">
        <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center border border-gray-100">
          <div>
            <span className="text-xs text-gray-500 block">Harga Emas (per gram)</span>
            {isUpdating ? (
              <div className="flex items-center gap-2 mt-1">
                <input 
                  type="number" 
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="border px-2 py-1 rounded w-32 text-sm font-bold"
                />
                <button 
                  onClick={handleUpdate}
                  disabled={isLoading}
                  className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold hover:bg-yellow-600 disabled:opacity-50"
                >
                  {isLoading ? '...' : 'Simpan'}
                </button>
              </div>
            ) : (
              <span className="font-bold text-gray-800">{formatRupiah(initialData.goldPrice)}</span>
            )}
          </div>
          {!isUpdating && (
            <button onClick={() => setIsUpdating(true)} className="text-xs text-yellow-600 font-bold underline">
              Update
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-xs text-gray-500 block">Total Aset Lancar</span>
            <span className="font-bold text-gray-800">{formatRupiah(initialData.totalAssets)}</span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Batas Nisab (85g)</span>
            <span className="font-bold text-gray-800">{formatRupiah(initialData.nisab)}</span>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500 block mb-1">Estimasi Zakat (2.5%)</span>
          <span className={`text-xl font-bold ${initialData.isNisabReached ? 'text-red-600' : 'text-gray-400'}`}>
            {formatRupiah(initialData.zakatAmount)}
          </span>
          {initialData.isNisabReached && (
            <p className="text-xs text-red-500 mt-1">Segera tunaikan jika sudah mencapai haul (1 tahun).</p>
          )}
        </div>
      </div>
    </Card>
  );
}
