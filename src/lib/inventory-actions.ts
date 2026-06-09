'use server'

import { supabase } from './supabase';
import { revalidatePath } from 'next/cache';

export async function getInventoryItems() {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    
    return [];
  }

  return data.map((item: Record<string, any>) => ({
    id: item.id,
    name: item.item_name,
    category: item.category,
    stock: Number(item.quantity),
    unit: item.unit,
    threshold: Number(item.min_stock),
    unitPrice: Number(item.unit_price),
    status: Number(item.quantity) > Number(item.min_stock) ? 'Aman' : 'Kritis'
  }));
}

function parseInventoryFormData(formData: FormData) {
  return {
    item_name: formData.get('name') as string,
    category: formData.get('category') as string,
    quantity: Number(formData.get('stock')),
    unit: formData.get('unit') as string,
    min_stock: Number(formData.get('threshold')),
    unit_price: Number(formData.get('unitPrice')) || 0
  };
}

export async function addInventoryItem(formData: FormData) {
  const { error } = await supabase
    .from('inventory')
    .insert(parseInventoryFormData(formData));

  if (error) throw new Error(error.message);
  revalidatePath('/inventory');
}

export async function updateInventoryItem(id: string, formData: FormData) {
  const { error } = await supabase
    .from('inventory')
    .update(parseInventoryFormData(formData))
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/inventory');
}

export async function deleteInventoryItem(id: string) {
  const { error } = await supabase
    .from('inventory')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/inventory');
}
