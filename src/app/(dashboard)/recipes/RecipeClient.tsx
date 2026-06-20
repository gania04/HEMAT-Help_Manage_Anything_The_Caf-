'use client';

import { useState } from 'react';
import { formatRupiah } from '@/lib/utils';
import { deleteRecipe } from '@/lib/recipe-actions';

export default function RecipeClient({ initialRecipes }: { initialRecipes: any[] }) {
  const [recipes, setRecipes] = useState(initialRecipes);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus resep "${name}"? Penghapusan ini juga akan menghapusnya dari daftar menu POS.`)) return;
    
    setIsDeleting(id);
    try {
      await deleteRecipe(id);
      setRecipes(recipes.filter(r => r.id !== id));
      alert(`Resep "${name}" berhasil dihapus.`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((menu) => {
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

        // Find selling price, ignoring 'recipe_only' channel if there's another
        let sellingPrice = 0;
        let isRecipeOnly = false;
        
        if (menu.menu_prices && menu.menu_prices.length > 0) {
          const validPrice = menu.menu_prices.find((p: any) => p.channel !== 'recipe_only');
          if (validPrice) {
            sellingPrice = Number(validPrice.price);
          } else {
            sellingPrice = Number(menu.menu_prices[0].price);
            isRecipeOnly = true;
          }
        }

        const margin = sellingPrice > 0 ? ((sellingPrice - totalHpp) / sellingPrice) * 100 : 0;

        return (
          <div key={menu.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col relative">
            <div className={`${isRecipeOnly ? 'bg-blue-600' : 'bg-[#00875A]'} p-4 text-white pr-10`}>
              <h2 className="text-xl font-bold truncate" title={menu.menu_name}>
                {menu.menu_name}
              </h2>
              {isRecipeOnly && <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-bold mt-1 inline-block">Hanya Resep (Bukan POS)</span>}
              <div className="flex justify-between items-center mt-2 text-sm text-green-100">
                <span className={isRecipeOnly ? 'text-blue-100' : 'text-green-100'}>Harga Jual: {formatRupiah(sellingPrice)}</span>
                <span className="bg-white/20 px-2 py-0.5 rounded font-bold text-white">
                  Margin: {margin.toFixed(0)}%
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => handleDelete(menu.id, menu.menu_name)}
              disabled={isDeleting === menu.id}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-black/20 text-white rounded-full hover:bg-red-500 transition shadow-sm z-10 disabled:opacity-50"
              title="Hapus Resep"
            >
              {isDeleting === menu.id ? '⌛' : '🗑️'}
            </button>
            
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
                <span className={`text-lg font-black ${isRecipeOnly ? 'text-blue-600' : 'text-[#00875A]'}`}>{formatRupiah(totalHpp)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
