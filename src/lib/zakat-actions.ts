'use server'

import { supabase } from './supabase';
import { revalidatePath } from 'next/cache';
import { getDashboardStats } from './dashboard-actions';

export async function getLatestGoldPrice() {
  const { data, error } = await supabase
    .from('gold_prices')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return { price: 1250000, source: 'DEFAULT' }; // Default fallback
  }

  return {
    price: Number(data.price_per_gram),
    source: data.source,
    updatedAt: data.created_at
  };
}

export async function saveGoldPrice(price: number, source: string = 'MANUAL') {
  const { error } = await supabase
    .from('gold_prices')
    .insert({
      price_per_gram: price,
      source: source
    });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/'); // Refresh dashboard
  return { success: true };
}

export async function calculateZakatNisab() {
  // 1. Ambil Total Kas
  const stats = await getDashboardStats();
  const totalKas = stats.totalKas;

  // 2. Ambil Total Nilai Inventaris (Bahan Baku)
  const { data: inventory } = await supabase.from('inventory').select('quantity, unit_price');
  const totalInventoryValue = inventory?.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unit_price)), 0) || 0;

  // 3. Hitung Aset Lancar
  // Asumsi tidak ada hutang jangka pendek (0) di MVP ini, atau jika ada ambil dari modul hutang
  const totalAssets = totalKas + totalInventoryValue;

  // 4. Ambil Harga Emas & Hitung Nisab (85 gram)
  const gold = await getLatestGoldPrice();
  const nisab = 85 * gold.price;

  const isNisabReached = totalAssets >= nisab;
  const zakatAmount = isNisabReached ? (totalAssets * 0.025) : 0;

  return {
    totalAssets,
    nisab,
    goldPrice: gold.price,
    isNisabReached,
    zakatAmount
  };
}
