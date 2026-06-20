import { getAllRecipes } from '@/lib/recipe-actions';
import { formatRupiah } from '@/lib/utils';
import Link from 'next/link';
import RecipeClient from './RecipeClient';

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
        <RecipeClient initialRecipes={recipes} />
      )}
    </main>
  );
}
