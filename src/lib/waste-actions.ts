 
 
'use server'

import { supabase } from './supabase';
import { revalidatePath } from 'next/cache';

export async function getWasteLogs() {
  const { data, error } = await supabase
    .from('waste_logs')
    .select(`
      id,
      quantity,
      reason,
      date,
      inventory:inventory_id(id, item_name, unit)
    `)
    .order('date', { ascending: false });

  if (error) {
    
    return [];
  }

  return data.map((log: any) => ({
    id: log.id,
    quantity: Number(log.quantity),
    reason: log.reason,
    date: log.date,
    inventory_id: log.inventory?.id,
    item_name: log.inventory?.item_name || 'Item Tidak Dikenal',
    unit: log.inventory?.unit || ''
  }));
}

export async function addWasteLog(formData: FormData) {
  const inventory_id = formData.get('inventory_id') as string;
  const quantity = Number(formData.get('quantity'));
  const reason = formData.get('reason') as string;

  if (!inventory_id || quantity <= 0 || !reason) {
    return { error: 'Data tidak lengkap' };
  }

  // 1. Dapatkan stok saat ini
  const { data: currentInventory, error: fetchError } = await supabase
    .from('inventory')
    .select('quantity')
    .eq('id', inventory_id)
    .single();

  if (fetchError) return { error: 'Gagal memeriksa stok bahan baku: ' + fetchError.message };

  const currentStock = Number(currentInventory.quantity);
  const newStock = currentStock - quantity;

  // 2. Update stok
  const { error: updateError } = await supabase
    .from('inventory')
    .update({ quantity: newStock })
    .eq('id', inventory_id);

  if (updateError) return { error: 'Gagal memotong stok bahan baku: ' + updateError.message };

  // 3. Catat di waste_logs
  const { error: insertError } = await supabase
    .from('waste_logs')
    .insert({
      inventory_id,
      quantity,
      reason,
      staff_id: null // MVP: blm handle auth spesifik staf
    });

  if (insertError) {
    // Kembalikan stok jika gagal catat log (rollback manual)
    await supabase.from('inventory').update({ quantity: currentStock }).eq('id', inventory_id);
    return { error: 'Gagal mencatat log limbah: ' + insertError.message };
  }

  revalidatePath('/waste');
  revalidatePath('/inventory');
  
  return { success: true };
}

