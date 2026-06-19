'use client';

import { useState } from 'react';
import { calculateHppSummary } from '@/lib/hpp-calculator';
import { formatRupiah } from '@/lib/utils';
import { createPosProduct } from '@/lib/pos-actions';

type Ingredient = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
};

export default function HppCalculatorPage() {
  const [menuName, setMenuName] = useState('Menu Baru');
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: '1', name: 'Biji Kopi Arabica', quantity: 15, unit: 'Gram', pricePerUnit: 200 },
    { id: '2', name: 'Susu UHT', quantity: 150, unit: 'ml', pricePerUnit: 20 },
    { id: '3', name: 'Cup Plastik 16oz', quantity: 1, unit: 'Pcs', pricePerUnit: 1500 }
  ]);

  const [margin, setMargin] = useState(60);
  const [overhead, setOverhead] = useState(10);
  const [yieldQuantity, setYieldQuantity] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [addToPos, setAddToPos] = useState(false);

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { id: Date.now().toString(), name: '', quantity: 0, unit: 'Gram', pricePerUnit: 0 }
    ]);
  };

  const updateIngredient = (id: string, field: keyof Ingredient, value: string | number) => {
    setIngredients(ingredients.map(ing => 
      ing.id === id ? { ...ing, [field]: value } : ing
    ));
  };

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Auto calculate
    const { hppPerUnit, recommendedSellingPrice } = calculateHppSummary(ingredients, margin / 100, overhead / 100, yieldQuantity);

    let posMsg = '';
    if (addToPos) {
      const res = await createPosProduct(menuName, recommendedSellingPrice);
      if (res.success) {
        posMsg = '\n✅ Berhasil ditambahkan ke daftar Menu Kasir!';
      } else {
        posMsg = '\n❌ Gagal menambahkan ke Menu Kasir: ' + res.error;
      }
    }

    setTimeout(() => {
      alert(`Berhasil menyimpan resep "${menuName}"!\nHPP Per Unit: ${formatRupiah(hppPerUnit)}\nRekomendasi Harga Jual (Margin ${margin}%): ${formatRupiah(recommendedSellingPrice)}${posMsg}`);
      setIsSaving(false);
    }, 500); // reduced timeout for better UX
  };

// Kalkulasi Otomatis
  const { totalMaterialCost, overheadCost, totalHPP, hppPerUnit, recommendedSellingPrice } = calculateHppSummary(ingredients, margin / 100, overhead / 100, yieldQuantity);

  return (
    <main className="h-full overflow-y-auto p-4 md:p-10 bg-soft-gray">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#00875A]">KALKULATOR HPP</h1>
          <p className="text-gray-500 mt-1">Hitung Harga Pokok Penjualan (COGS) resep menu secara dinamis dan akurat.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panel Kiri: Input Komposisi */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6">
            <label htmlFor="menuName" className="block text-sm font-bold text-gray-700 mb-2">Nama Menu / Produk</label>
            <input 
              id="menuName"
              type="text" 
              value={menuName}
              onChange={(e) => setMenuName(e.target.value)}
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00875A]"
            />
          </div>

          <div className="mb-6 border-t pt-4">
            <label htmlFor="yieldQuantity" className="block text-sm font-bold text-gray-700 mb-2">Jumlah Porsi / Hasil Satuan (Yield)</label>
            <p className="text-xs text-gray-500 mb-2">Berapa banyak porsi/unit yang dihasilkan dari resep di bawah ini?</p>
            <input 
              id="yieldQuantity"
              type="number" 
              min="1"
              value={yieldQuantity || ''}
              onChange={(e) => setYieldQuantity(Number(e.target.value))}
              className="w-full md:w-1/3 border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00875A]"
            />
          </div>

          <h3 className="font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
            <span>⚖️</span> Komposisi Bahan Baku (Resep)
          </h3>
          
          <div className="space-y-4">
            {ingredients.map((ing, index) => (
              <div key={ing.id} className="flex gap-4 items-start">
                <div className="w-8 h-10 flex items-center justify-center font-bold text-gray-400">{index + 1}.</div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-5">
                    <input 
                      type="text" placeholder="Nama Bahan" value={ing.name}
                      onChange={(e) => updateIngredient(ing.id, 'name', e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#00875A]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <input 
                      type="number" placeholder="Qty" value={ing.quantity || ''}
                      onChange={(e) => updateIngredient(ing.id, 'quantity', Number(e.target.value))}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm text-center focus:outline-none focus:ring-1 focus:ring-[#00875A]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <select 
                      value={ing.unit} onChange={(e) => updateIngredient(ing.id, 'unit', e.target.value)}
                      className="w-full border border-gray-300 px-2 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#00875A]"
                    >
                      <option>Gram</option><option>ml</option><option>Pcs</option><option>Kg</option>
                    </select>
                  </div>
                  <div className="md:col-span-3 relative">
                    <span className="absolute left-3 top-2 text-gray-400 text-sm font-bold">Rp</span>
                    <input 
                      type="number" placeholder="Biaya/Unit" value={ing.pricePerUnit || ''}
                      onChange={(e) => updateIngredient(ing.id, 'pricePerUnit', Number(e.target.value))}
                      className="w-full border border-gray-300 pl-8 pr-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#00875A]"
                    />
                  </div>
                </div>
                <button onClick={() => removeIngredient(ing.id)} className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition active:scale-95">
                  &times;
                </button>
              </div>
            ))}
          </div>

          <button onClick={addIngredient} className="mt-6 w-full py-3 border-2 border-dashed border-[#00875A] text-[#00875A] font-bold rounded-xl hover:bg-[#E6F4EA] transition active:scale-95 flex items-center justify-center gap-2">
            <span>➕</span> Tambah Bahan Baku
          </button>
        </div>

        {/* Panel Kanan: Hasil Kalkulasi */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-fit sticky top-4 md:p-10">
          <h3 className="font-bold text-gray-800 mb-6 text-center text-xl flex items-center justify-center gap-2">
            <span>🧾</span> Hasil Kalkulasi
          </h3>
          
          <div className="space-y-4 flex-1">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-500 text-sm">Total Biaya Bahan</span>
              <span className="font-bold">{formatRupiah(totalMaterialCost)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-500 text-sm flex items-center gap-1">
                Estimasi Overhead 
                <select 
                  value={overhead}
                  onChange={(e) => setOverhead(Number(e.target.value))}
                  className="bg-gray-100 text-gray-700 text-[10px] rounded px-1 py-0.5 border-none focus:ring-0 cursor-pointer font-bold"
                >
                  <option value={10}>10%</option>
                  <option value={15}>15%</option>
                  <option value={20}>20%</option>
                  <option value={25}>25%</option>
                  <option value={30}>30%</option>
                  <option value={35}>35%</option>
                </select>
              </span>
              <span className="font-bold text-gray-700">{formatRupiah(overheadCost)}</span>
            </div>
            
            <div className="mt-6 pt-4 bg-[#E6F4EA] rounded-xl p-5 text-center border border-[#00875A]/20 shadow-inner">
              <p className="text-sm text-[#00875A] font-bold mb-1">Total HPP 1 Resep (Satu Batch)</p>
              <p className="text-2xl font-black text-[#00875A] drop-shadow-sm mb-2">{formatRupiah(totalHPP)}</p>
              <div className="border-t border-[#00875A]/20 pt-2 mt-2">
                <p className="text-sm text-[#00875A] font-bold mb-1">HPP per Unit (Porsi)</p>
                <p className="text-4xl font-black text-[#00875A] drop-shadow-sm">{formatRupiah(hppPerUnit)}</p>
              </div>
            </div>

            <div className="mt-6 p-4 border border-blue-100 bg-blue-50/50 rounded-xl">
              <div className="flex justify-between items-center mb-3 border-b border-blue-200 pb-2">
                <span className="text-xs text-blue-600 font-bold flex items-center gap-1">
                  <span>💡</span> Target Margin
                </span>
                <select 
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="bg-white border border-blue-200 text-blue-800 text-xs rounded-lg px-2 py-1 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value={30}>30%</option>
                  <option value={40}>40%</option>
                  <option value={50}>50%</option>
                  <option value={60}>60%</option>
                </select>
              </div>
              <div className="text-center">
                <p className="text-xs text-blue-600 font-bold mb-1">Rekomendasi Harga Jual</p>
                <p className="text-2xl font-bold text-blue-800">{formatRupiah(recommendedSellingPrice)}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 mb-2 flex items-center justify-center gap-2">
            <input 
              type="checkbox" 
              id="addToPos"
              checked={addToPos}
              onChange={(e) => setAddToPos(e.target.checked)}
              className="w-4 h-4 text-[#00875A] bg-gray-100 border-gray-300 rounded focus:ring-[#00875A]"
            />
            <label htmlFor="addToPos" className="text-sm font-medium text-gray-700 cursor-pointer">
              Tambahkan otomatis ke POS Menu Kasir
            </label>
          </div>

          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full mt-8 bg-[#00875A] text-white py-4 rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-100 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <span>⏳ Menyimpan...</span>
            ) : (
              <><span>💾</span> Simpan Resep & HPP</>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
