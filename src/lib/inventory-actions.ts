'use server'

import { supabase } from './supabase';
import { revalidatePath } from 'next/cache';

export async function getInventoryItems() {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching inventory:', error);
    return [];
  }

  return data.map((item: any) => ({
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

export async function addInventoryItem(formData: FormData) {
  const name = formData.get('name') as string;
  const category = formData.get('category') as string;
  const stock = Number(formData.get('stock'));
  const unit = formData.get('unit') as string;
  const threshold = Number(formData.get('threshold'));
  const unitPrice = Number(formData.get('unitPrice')) || 0;

  const { error } = await supabase
    .from('inventory')
    .insert({
      item_name: name,
      category,
      quantity: stock,
      unit,
      min_stock: threshold,
      unit_price: unitPrice
    });

  if (error) throw new Error(error.message);
  revalidatePath('/inventory');
}

export async function updateInventoryItem(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const category = formData.get('category') as string;
  const stock = Number(formData.get('stock'));
  const unit = formData.get('unit') as string;
  const threshold = Number(formData.get('threshold'));
  const unitPrice = Number(formData.get('unitPrice')) || 0;

  const { error } = await supabase
    .from('inventory')
    .update({
      item_name: name,
      category,
      quantity: stock,
      unit,
      min_stock: threshold,
      unit_price: unitPrice
    })
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
