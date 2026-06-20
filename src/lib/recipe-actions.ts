'use server';

import { supabase } from './supabase';

export async function getAllRecipes() {
  const { data, error } = await supabase
    .from('menus')
    .select(`
      id,
      menu_name,
      menu_prices ( price, channel ),
      menu_recipes (
        qty_needed,
        inventory (
          item_name,
          unit,
          unit_price
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('Error fetching recipes:', error);
    return [];
  }

  // Filter only menus that have recipes
  return data.filter(menu => menu.menu_recipes && menu.menu_recipes.length > 0);
}

import { revalidatePath } from 'next/cache';

export async function deleteRecipe(menuId: string) {
  const { error } = await supabase
    .from('menus')
    .delete()
    .eq('id', menuId);

  if (error) {
    throw new Error('Gagal menghapus resep: ' + error.message);
  }

  revalidatePath('/recipes');
  revalidatePath('/pos');
}
