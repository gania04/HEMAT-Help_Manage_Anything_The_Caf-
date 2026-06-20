'use server'

import { supabase } from './supabase';
import { revalidatePath } from 'next/cache';

function parsePaymentMethod(paymentMethod: string): string {
  const method = paymentMethod.toLowerCase();
  if (method.includes('qris')) return 'qris';
  if (method.includes('debit')) return 'debit';
  return 'tunai';
}

export async function processOrder(cartItems: any[], paymentMethod: string, totalAmount: number, channel: string = 'dine_in') {
  if (cartItems.length === 0) return { success: false, error: 'Keranjang kosong' };

  // 1. Dapatkan user admin (untuk simulasi MVP)
  const { data: users } = await supabase.from('users').select('id').limit(1);
  const userId = users && users.length > 0 ? users[0].id : null;

  const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
  
  // 2. Insert transaksi ke Supabase
  const { data: trxData, error: trxError } = await supabase.from('transactions').insert({
    order_number: orderNumber,
    created_by: userId,
    channel: channel,
    payment_method: parsePaymentMethod(paymentMethod),
    total_amount: totalAmount,
    status: 'completed'
  }).select('id').single();

  if (trxError) return { success: false, error: 'Gagal membuat transaksi: ' + trxError.message };

  // 3. Loop items dan potong stok dari inventory
  for (const item of cartItems) {
    // Insert detail transaksi
    await supabase.from('transaction_items').insert({
      transaction_id: trxData.id,
      menu_id: item.id, // Menggunakan menu_id
      quantity: item.quantity,
      price_at_sale: item.price
    });

    // Ambil resep menu ini
    const { data: recipes } = await supabase
      .from('menu_recipes')
      .select('inventory_id, qty_needed')
      .eq('menu_id', item.id);

    if (recipes && recipes.length > 0) {
      for (const recipe of recipes) {
        // Ambil stok inventory saat ini
        const { data: inv } = await supabase
          .from('inventory')
          .select('quantity')
          .eq('id', recipe.inventory_id)
          .single();
        
        if (inv) {
          const newQty = Math.max(0, Number(inv.quantity) - (Number(recipe.qty_needed) * item.quantity));
          await supabase.from('inventory').update({ quantity: newQty }).eq('id', recipe.inventory_id);
        }
      }
    }
  }

  revalidatePath('/inventory');
  revalidatePath('/pos');

  return {
    success: true,
    orderId: orderNumber,
    message: `Pembayaran ${paymentMethod} berhasil sebesar Rp ${totalAmount.toLocaleString('id-ID')}`
  };
}

export async function getPosMenusWithStock() {
  const { data: menusData, error } = await supabase
    .from('menus')
    .select(`
      id,
      menu_name,
      icon,
      menu_prices ( channel, price ),
      menu_recipes (
        qty_needed,
        inventory ( id, quantity )
      )
    `);

  if (error || !menusData || menusData.length === 0) {
    return [];
  }

  return menusData
    .filter((m: any) => m.menu_prices && m.menu_prices.some((p: any) => p.channel !== 'recipe_only'))
    .map((m: any) => {
      const prices: Record<string, number> = {};
      if (m.menu_prices) {
        m.menu_prices.forEach((mp: any) => {
          if (mp.channel !== 'recipe_only') {
            prices[mp.channel] = Number(mp.price);
          }
        });
      }

      let maxPortions = 99999;
    if (m.menu_recipes && m.menu_recipes.length > 0) {
      m.menu_recipes.forEach((mr: any) => {
        const invQty = Number(mr.inventory?.quantity || 0);
        const needed = Number(mr.qty_needed || 1);
        const portions = Math.floor(invQty / needed);
        if (portions < maxPortions) {
          maxPortions = portions;
        }
      });
    } else {
      maxPortions = 999; // Jika tidak ada resep, anggap tak terbatas (MVP)
    }

    return {
      id: m.id,
      name: m.menu_name,
      icon: m.icon || '🍵',
      prices: prices,
      maxPortions: Math.max(0, maxPortions),
      options: {"sugar": ["Less", "Normal", "High"], "ice": ["Hot", "Normal Ice", "Less Ice"]}
    };
  });
}

export async function getPosHistory() {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      id,
      order_number,
      payment_method,
      total_amount,
      status,
      created_at,
      transaction_items(
        quantity,
        price_at_sale,
        menus(menu_name)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return [];
  }

  // Normalize data for frontend expected structure
  return data.map(trx => ({
    ...trx,
    transaction_items: trx.transaction_items.map((item: any) => ({
      ...item,
      menus: { menu_name: item.menus?.menu_name || 'Item Dihapus' }
    }))
  }));
}

export async function requestVoid(transactionId: string) {
  const { error } = await supabase
    .from('transactions')
    .update({ status: 'pending_void' })
    .eq('id', transactionId);

  if (error) throw new Error(error.message);

  revalidatePath('/pos/history');
  revalidatePath('/void-approvals');
}

export async function createPosProduct(
  name: string, 
  price: number,
  recipes?: { name: string; quantity: number; unit: string; pricePerUnit: number; }[],
  addToPos: boolean = true
) {
  const { data: menuData, error: menuError } = await supabase.from('menus').insert({
    menu_name: name,
    base_hpp: 0,
    icon: '☕'
  }).select('id').single();
  
  if (menuError) {
    return { success: false, error: menuError.message };
  }

  await supabase.from('menu_prices').insert({
    menu_id: menuData.id,
    channel: addToPos ? 'dine_in' : 'recipe_only',
    price: price
  });

  if (recipes && recipes.length > 0) {
    for (const recipe of recipes) {
      if (!recipe.name) continue;
      
      let inventoryId;
      // Find existing inventory item by name
      const { data: existingInv } = await supabase
        .from('inventory')
        .select('id')
        .ilike('item_name', recipe.name)
        .limit(1)
        .single();
        
      if (existingInv) {
        inventoryId = existingInv.id;
        // Update the unit price to match the new recipe input
        await supabase.from('inventory').update({ unit_price: recipe.pricePerUnit }).eq('id', inventoryId);
      } else {
        // Create new inventory item
        const { data: newInv, error: invError } = await supabase.from('inventory').insert({
          item_name: recipe.name,
          category: 'Bahan Baku',
          quantity: 0, // Starts at 0, user can restock later
          unit: recipe.unit,
          unit_price: recipe.pricePerUnit,
          min_stock: 0
        }).select('id').single();
        
        if (!invError && newInv) {
          inventoryId = newInv.id;
        }
      }

      // Link recipe to menu
      if (inventoryId) {
        await supabase.from('menu_recipes').insert({
          menu_id: menuData.id,
          inventory_id: inventoryId,
          qty_needed: recipe.quantity
        });
      }
    }
  }

  revalidatePath('/pos');
  revalidatePath('/inventory');
  return { success: true };
}
