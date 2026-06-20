'use server';

import { supabase } from './supabase';

export async function getAllRecipes() {
  const { data, error } = await supabase
    .from('menus')
    .select(`
      id,
      menu_name,
      menu_prices ( price ),
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
