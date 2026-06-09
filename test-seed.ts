import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!.startsWith('http') 
    ? process.env.NEXT_PUBLIC_SUPABASE_URL! 
    : `https://${process.env.NEXT_PUBLIC_SUPABASE_URL}.supabase.co`,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function seedPosData() {
  console.log('Memulai seeder data POS...');

  const { data: invData, error: invError } = await supabase.from('inventory').select('id, item_name').limit(10);
  
  if (invError) throw new Error(invError.message);

  let coffeeId, milkId, cupId;

  if (!invData || invData.length === 0) {
    console.log('Inventory kosong. Membuat data bahan baku awal...');
    const { data: newInv, error: insertInvError } = await supabase.from('inventory').insert([
      { item_name: 'Biji Kopi Arabica', category: 'Bahan Baku', quantity: 15, unit: 'Kg', unit_price: 200000, min_stock: 2 },
      { item_name: 'Susu UHT', category: 'Bahan Baku', quantity: 10, unit: 'Liter', unit_price: 20000, min_stock: 5 },
      { item_name: 'Cup Plastik 16oz', category: 'Packaging', quantity: 500, unit: 'Pcs', unit_price: 1500, min_stock: 50 }
    ]).select();

    if (insertInvError) throw new Error(insertInvError.message);
    coffeeId = newInv[0].id;
    milkId = newInv[1].id;
    cupId = newInv[2].id;
  }

  const { data: menuData } = await supabase.from('menus').select('id').limit(1);
  if (!menuData || menuData.length === 0) {
    console.log('Menus kosong. Membuat menu awal...');
    const { data: newMenus, error: menuErr } = await supabase.from('menus').insert([
      { menu_name: 'Kopi Susu Gula Aren', base_hpp: 8000, icon: '☕' },
      { menu_name: 'Americano Dingin', base_hpp: 5000, icon: '🥤' }
    ]).select();

    if (menuErr) throw new Error(menuErr.message);

    const kopiSusuId = newMenus[0].id;
    const americanoId = newMenus[1].id;

    await supabase.from('menu_prices').insert([
      { menu_id: kopiSusuId, channel: 'dine_in', price: 18000 },
      { menu_id: americanoId, channel: 'dine_in', price: 15000 }
    ]);

    await supabase.from('menu_recipes').insert([
      { menu_id: kopiSusuId, inventory_id: coffeeId, qty_needed: 0.015 },
      { menu_id: kopiSusuId, inventory_id: milkId, qty_needed: 0.15 },
      { menu_id: kopiSusuId, inventory_id: cupId, qty_needed: 1 },
      { menu_id: americanoId, inventory_id: coffeeId, qty_needed: 0.015 },
      { menu_id: americanoId, inventory_id: cupId, qty_needed: 1 }
    ]);
  }
  console.log('Seeder selesai!');
}

seedPosData().catch(console.error);
