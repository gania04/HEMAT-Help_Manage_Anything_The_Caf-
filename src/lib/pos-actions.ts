'use server'

import { supabase } from './supabase';
import { seedPosData } from './seed-actions';
import { revalidatePath } from 'next/cache';

function parsePaymentMethod(paymentMethod: string): string {
  const method = paymentMethod.toLowerCase();
  if (method.includes('qris')) return 'qris';
  if (method.includes('debit')) return 'debit';
  if (method.includes('murabahah')) return 'murabahah';
  return 'tunai';
}

async function deductStockForProduct(productId: string, quantity: number) {
  const { data: p } = await supabase.from('products').select('stock').eq('id', productId).single();
  if (p) {
    const newStock = Math.max(0, p.stock - quantity);
    await supabase.from('products').update({ stock: newStock }).eq('id', productId);
  }
}

export async function processOrder(cartItems: unknown[], paymentMethod: string, totalAmount: number, channel: string = 'dine_in') {
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

  // 3. Loop items dan potong stok dari products
  for (const item of cartItems) {
    // Insert detail transaksi
    await supabase.from('transaction_items').insert({
      transaction_id: trxData.id,
      product_id: item.id, // Menggunakan product_id bukan menu_id
      quantity: item.quantity,
      price_at_sale: item.price,
      sugar_level: item.sugar || 'Normal',
      ice_level: item.ice || 'Normal Ice'
    });

    // Potong stok
    await deductStockForProduct(item.id, item.quantity);
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
  const { data: products } = await supabase.from('products').select('*');

  if (!products || products.length === 0) {
    return [];
  }

  return products.map((p: unknown) => {
    return {
      id: p.id,
      name: p.name,
      icon: p.category === 'Coffee' ? '☕' : '🍵',
      prices: {
        'dine_in': Number(p.price),
        'takeaway': Number(p.price) + 2000,
        'gojek': Number(p.price) * 1.2
      },
      maxPortions: p.stock,
      options: p.options
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
        sugar_level,
        ice_level,
        products(name)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return [];
  }

  // Normalize data to match the old structure expected by frontend (menus(menu_name))
  return data.map(trx => ({
    ...trx,
    transaction_items: trx.transaction_items.map((item: unknown) => ({
      ...item,
      menus: { menu_name: item.products?.name + (item.sugar_level ? ` (${item.sugar_level}, ${item.ice_level})` : '') }
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

export async function createPosProduct(name: string, price: number) {
  const { error } = await supabase.from('products').insert({
    name,
    price,
    stock: 50, // Default stock for newly created HPP menus
    category: 'Custom',
    options: {"sugar": ["Less", "Normal", "High"], "ice": ["Hot", "Normal Ice", "Less Ice"]}
  });
  
  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/pos');
  return { success: true };
}
