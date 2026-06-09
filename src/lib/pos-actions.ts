'use server'

import { supabase } from './supabase';
import { seedPosData } from './seed-actions';
import { revalidatePath } from 'next/cache';

export async function processOrder(cartItems: Record<string, any>[], paymentMethod: string, totalAmount: number, channel: string = 'dine_in') {
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
    payment_method: paymentMethod.toLowerCase().includes('qris') ? 'qris' :
                    paymentMethod.toLowerCase().includes('debit') ? 'debit' :
                    paymentMethod.toLowerCase().includes('murabahah') ? 'murabahah' : 'tunai',
    total_amount: totalAmount,
    status: 'completed'
  }).select('id').single();

  if (trxError) return { success: false, error: 'Gagal membuat transaksi: ' + trxError.message };

  // 3. Loop items dan potong stok
  for (const item of cartItems) {
    // Insert detail transaksi
    await supabase.from('transaction_items').insert({
      transaction_id: trxData.id,
      menu_id: item.id,
      quantity: item.quantity,
      price_at_sale: item.price
    });

    // Ambil resep untuk item ini
    const { data: recipes } = await supabase.from('menu_recipes').select('inventory_id, qty_needed').eq('menu_id', item.id);
    
    if (recipes && recipes.length > 0) {
      for (const req of recipes) {
        // Ambil stok saat ini
        const { data: inv } = await supabase.from('inventory').select('quantity').eq('id', req.inventory_id).single();
        if (inv) {
          const deduction = req.qty_needed * item.quantity;
          let newStock = Number(inv.quantity) - deduction;
          if (newStock < 0) newStock = 0;
          newStock = Math.round(newStock * 1000) / 1000;
          
          await supabase.from('inventory').update({ quantity: newStock }).eq('id', req.inventory_id);
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
  // Cek apakah ada menu
  let { data: menus } = await supabase.from('menus').select(`
    id,
    menu_name,
    icon,
    menu_prices(channel, price),
    menu_recipes(
      inventory_id,
      qty_needed,
      inventory(quantity)
    )
  `);

  if (!menus || menus.length === 0) {
    try {
      await seedPosData();
      // fetch ulang
      const res = await supabase.from('menus').select(`
        id,
        menu_name,
        icon,
        menu_prices(channel, price),
        menu_recipes(
          inventory_id,
          qty_needed,
          inventory(quantity)
        )
      `);
      menus = res.data;
    } catch (e) {
      
      return [];
    }
  }

  return (menus || []).map((m: Record<string, any>) => {
    // Kumpulkan semua harga berdasarkan channel
    const prices: Record<string, number> = {};
    if (m.menu_prices && m.menu_prices.length > 0) {
      m.menu_prices.forEach((mp: Record<string, any>) => {
        prices[mp.channel] = Number(mp.price);
      });
    } else {
      prices['dine_in'] = 0; // fallback default
    }
    
    let maxPortions = Infinity;
    if (m.menu_recipes && m.menu_recipes.length > 0) {
      m.menu_recipes.forEach((req: Record<string, any>) => {
        const stock = req.inventory?.quantity || 0;
        const possible = Math.floor(stock / req.qty_needed);
        if (possible < maxPortions) maxPortions = possible;
      });
    } else {
      maxPortions = 99; // mock jika resep kosong
    }

    return {
      id: m.id,
      name: m.menu_name,
      icon: m.icon || '🍵',
      prices, // Object harga berbagai channel
      maxPortions
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

  return data;
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
