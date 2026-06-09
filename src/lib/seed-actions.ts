'use server';

import { supabase } from './supabase';

export async function seedPosData() {
  console.log('Memulai seeder data POS...');

  // 1. Cek apakah inventory kosong
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
  } else {
    // Gunakan yang ada atau insert jika tidak ditemukan
    coffeeId = invData.find(i => i.item_name.includes('Kopi'))?.id;
    milkId = invData.find(i => i.item_name.includes('Susu'))?.id;
    cupId = invData.find(i => i.item_name.includes('Cup'))?.id;

    if (!coffeeId || !milkId || !cupId) {
      const { data: newInv } = await supabase.from('inventory').insert([
        { item_name: 'Biji Kopi Arabica (Seed)', category: 'Bahan Baku', quantity: 5, unit: 'Kg', unit_price: 200000, min_stock: 2 },
        { item_name: 'Susu UHT (Seed)', category: 'Bahan Baku', quantity: 5, unit: 'Liter', unit_price: 20000, min_stock: 5 },
        { item_name: 'Cup Plastik 16oz (Seed)', category: 'Packaging', quantity: 100, unit: 'Pcs', unit_price: 1500, min_stock: 50 }
      ]).select();
      coffeeId = newInv?.[0].id;
      milkId = newInv?.[1].id;
      cupId = newInv?.[2].id;
    }
  }

  // 2. Cek apakah menus kosong
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

    // 3. Masukkan harga menu
    await supabase.from('menu_prices').insert([
      { menu_id: kopiSusuId, channel: 'dine_in', price: 18000 },
      { menu_id: americanoId, channel: 'dine_in', price: 15000 }
    ]);

    // 4. Masukkan resep menu
    await supabase.from('menu_recipes').insert([
      // Kopi Susu: 0.015 Kg Kopi, 0.15 Liter Susu, 1 Cup
      { menu_id: kopiSusuId, inventory_id: coffeeId, qty_needed: 0.015 },
      { menu_id: kopiSusuId, inventory_id: milkId, qty_needed: 0.15 },
      { menu_id: kopiSusuId, inventory_id: cupId, qty_needed: 1 },
      
      // Americano: 0.015 Kg Kopi, 1 Cup
      { menu_id: americanoId, inventory_id: coffeeId, qty_needed: 0.015 },
      { menu_id: americanoId, inventory_id: cupId, qty_needed: 1 }
    ]);
  }

  console.log('Seeder selesai!');
  return { success: true };
}
