'use server';

import { supabase } from './supabase';
import { revalidatePath } from 'next/cache';

export async function getPendingVoids() {
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
        menus(menu_name)
      )
    `)
    .eq('status', 'pending_void')
    .order('created_at', { ascending: false });

  if (error) {
    
    return [];
  }

  return data;
}

export async function approveVoid(transactionId: string) {
  // 1. Ambil detail transaksi dan itemnya
  const { data: trx, error: trxError } = await supabase
    .from('transactions')
    .select(`
      order_number,
      transaction_items(menu_id, quantity)
    `)
    .eq('id', transactionId)
    .single();

  if (trxError || !trx) throw new Error('Transaksi tidak ditemukan');

  // 2. Kembalikan Stok Inventory
  for (const item of trx.transaction_items) {
    const { data: recipes } = await supabase
      .from('menu_recipes')
      .select('inventory_id, qty_needed')
      .eq('menu_id', item.menu_id);

    if (recipes && recipes.length > 0) {
      for (const req of recipes) {
        // Ambil stok saat ini
        const { data: inv } = await supabase
          .from('inventory')
          .select('quantity')
          .eq('id', req.inventory_id)
          .single();

        if (inv) {
          // Tambahkan stok kembali (rollback)
          const addition = req.qty_needed * item.quantity;
          const newStock = Number(inv.quantity) + addition;
          await supabase.from('inventory').update({ quantity: newStock }).eq('id', req.inventory_id);
        }
      }
    }
  }

  // 3. Ubah status menjadi voided
  await supabase.from('transactions').update({ status: 'voided' }).eq('id', transactionId);

  // 4. Catat di audit_logs
  // Dapatkan admin user ID (MVP)
  const { data: users } = await supabase.from('users').select('id').limit(1);
  const userId = users && users.length > 0 ? users[0].id : null;

  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: `Approve Void Transaksi ${trx.order_number}`,
    old_value: { status: 'pending_void' },
    new_value: { status: 'voided' }
  });

  revalidatePath('/void-approvals');
  revalidatePath('/pos/history');
  revalidatePath('/inventory');
}
