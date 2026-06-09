/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { supabase } from './supabase';

export async function getDashboardStats() {
  // Ambil total pengeluaran (semua waktu)
  const { data: expenses } = await supabase
    .from('operational_expenses')
    .select('amount')
    .eq('status', 'approved');
  
  const totalExpense = expenses?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

  // Ambil transaksi untuk menghitung omzet
  const { data: txs } = await supabase
    .from('transactions')
    .select('total_amount, created_at')
    .eq('status', 'completed');

  const todayStr = new Date().toISOString().split('T')[0];
  
  let totalOmzet = 0;
  let omzetHariIni = 0;

  if (txs) {
    txs.forEach(tx => {
      const amount = Number(tx.total_amount);
      totalOmzet += amount;
      if (tx.created_at.startsWith(todayStr)) {
        omzetHariIni += amount;
      }
    });
  }

  // Ambil HPP riil berdasarkan base_hpp dari menu yang terjual
  const { data: completedTxs } = await supabase
    .from('transactions')
    .select(`
      status,
      transaction_items (
        quantity,
        menus (
          base_hpp
        )
      )
    `)
    .eq('status', 'completed');

  let totalHpp = 0;
  if (completedTxs) {
    completedTxs.forEach((tx: any) => {
      if (tx.transaction_items) {
        tx.transaction_items.forEach((item: any) => {
          const hpp = item.menus?.base_hpp || 0;
          totalHpp += (hpp * item.quantity);
        });
      }
    });
  }
  
  // Kas riil murni berdasarkan arus kas masuk (omzet) - keluar (pengeluaran)
  const totalKas = totalOmzet - totalExpense;
  const labaBersih = totalOmzet - totalHpp - totalExpense;

  let auditStatus = 'aman';
  let auditMsg = 'Keuangan stabil. Laba bersih positif.';
  if (labaBersih < 0) {
    auditStatus = 'bahaya';
    auditMsg = 'Beban operasional/HPP melebihi pendapatan. Periksa pos pengeluaran dan harga jual!';
  }

  return {
    totalKas,
    omzetHariIni,
    totalHpp,
    labaBersih,
    audit: {
      status: auditStatus,
      message: auditMsg
    }
  };
}

export async function getRevenueTrend() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const { data: txs } = await supabase
    .from('transactions')
    .select('created_at, total_amount')
    .eq('status', 'completed')
    .gte('created_at', sevenDaysAgo.toISOString());

  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const trendMap = new Map<string, { name: string, omzet: number }>();

  // Inisialisasi 7 hari terakhir dengan omzet 0
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayName = i === 0 ? 'Hari Ini' : days[d.getDay()];
    const dateKey = d.toISOString().split('T')[0];
    trendMap.set(dateKey, { name: dayName, omzet: 0 });
  }

  if (txs) {
    txs.forEach(tx => {
      const dateKey = tx.created_at.split('T')[0];
      if (trendMap.has(dateKey)) {
        const item = trendMap.get(dateKey)!;
        item.omzet += Number(tx.total_amount);
      }
    });
  }

  return Array.from(trendMap.values());
}

export async function getPaymentRatios() {
  const { data: txs } = await supabase
    .from('transactions')
    .select('payment_method, total_amount')
    .eq('status', 'completed');

  const ratios: Record<string, number> = {};

  if (txs) {
    txs.forEach(tx => {
      const method = tx.payment_method || 'Lainnya';
      ratios[method] = (ratios[method] || 0) + Number(tx.total_amount);
    });
  }

  const result = Object.keys(ratios).map(key => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: ratios[key]
  }));

  if (result.length === 0) {
    return [{ name: 'Belum ada transaksi', value: 1 }];
  }

  return result;
}
