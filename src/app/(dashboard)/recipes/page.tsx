import { getAllRecipes } from '@/lib/recipe-actions';
import { formatRupiah } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function RecipesPage() {
  const recipes = await getAllRecipes();

  return (
    <main className="h-full overflow-y-auto p-4 md:p-10 bg-soft-gray">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#00875A]">DAFTAR RESEP MENU</h1>
          <p className="text-gray-500 mt-1">Daftar resep dari menu Kasir beserta rincian komposisi bahan baku.</p>
        </div>
        <Link href="/hpp" className="bg-[#00875A] text-white px-5 py-2.5 rounded-lg font-bold shadow hover:bg-green-700 transition flex items-center gap-2">
          <span>➕</span> Buat Resep Baru
        </Link>
      </div>

      {recipes.length === 0 ? (
        <div className="bg-white p-10 rounded-xl shadow-sm text-center border border-gray-100 flex flex-col items-center justify-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Belum ada resep yang disimpan</h3>
          <p className="text-gray-500 mb-6">Buat resep HPP terlebih dahulu dan simpan ke menu POS untuk menampilkannya di sini.</p>
          <Link href="/hpp" className="text-[#00875A] font-bold underline hover:opacity-80">
            Pergi ke Kalkulator HPP
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((menu) => {
            // Calculate total HPP for this recipe
            let totalHpp = 0;
            const ingredients = menu.menu_recipes.map((recipe: any) => {
              const qty = Number(recipe.qty_needed);
              const price = Number(recipe.inventory?.unit_price || 0);
              const cost = qty * price;
              totalHpp += cost;
              return {
                name: recipe.inventory?.item_name || 'Bahan Tidak Ditemukan',
                qty,
                unit: recipe.inventory?.unit || 'Unit',
                cost
              };
            });

            // Get selling price
            const sellingPrice = menu.menu_prices && menu.menu_prices.length > 0 
              ? Number(menu.menu_prices[0].price) 
              : 0;

            const margin = sellingPrice > 0 ? ((sellingPrice - totalHpp) / sellingPrice) * 100 : 0;

            return (
              <div key={menu.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                <div className="bg-[#00875A] p-4 text-white">
                  <h2 className="text-xl font-bold truncate" title={menu.menu_name}>{menu.menu_name}</h2>
                  <div className="flex justify-between items-center mt-2 text-sm text-green-100">
                    <span>Harga Jual: {formatRupiah(sellingPrice)}</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded font-bold">
                      Margin: {margin.toFixed(0)}%
                    </span>
                  </div>
                </div>
                
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 pb-2 border-b border-gray-100">Komposisi Bahan</h3>
                  
                  <ul className="space-y-3 flex-1">
                    {ingredients.map((ing: any, idx: number) => (
                      <li key={idx} className="flex justify-between items-start text-sm">
                        <div>
                          <p className="font-medium text-gray-800">{ing.name}</p>
                          <p className="text-xs text-gray-500">{ing.qty} {ing.unit}</p>
                        </div>
                        <span className="font-semibold text-gray-700">{formatRupiah(ing.cost)}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 -mx-4 -mb-4 p-4 rounded-b-xl">
                    <span className="text-sm font-bold text-gray-600">Total Biaya Resep</span>
                    <span className="text-lg font-black text-[#00875A]">{formatRupiah(totalHpp)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
