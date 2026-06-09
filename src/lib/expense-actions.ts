'use server';

import { supabase } from './supabase';
import { revalidatePath } from 'next/cache';

export async function addExpense(category: string, amount: number, description: string) {
  // Jika lebih dari 5 juta, wajib approval (pending)
  const status = amount > 5000000 ? 'pending_approval' : 'approved';

  const { data: users } = await supabase.from('users').select('id').limit(1);
  const userId = users && users.length > 0 ? users[0].id : null;

  const { error } = await supabase.from('operational_expenses').insert({
    category,
    amount,
    description,
    status,
    created_by: userId
  });

  if (error) {
    console.error('Add expense error:', error);
    throw new Error('Gagal mencatat pengeluaran: ' + error.message);
  }

  revalidatePath('/expenses');
  revalidatePath('/expenses/approvals');
  
  return { success: true, requiresApproval: status === 'pending_approval' };
}

export async function getExpenses() {
  const { data, error } = await supabase
    .from('operational_expenses')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return [];
  return data;
}

export async function getBudgetAlerts() {
  // Ambil semua limit
  const { data: limits, error: limitErr } = await supabase.from('budget_limits').select('*');
  if (limitErr || !limits) return [];

  // Ambil semua pengeluaran "approved" bulan ini per kategori
  // Untuk MVP, kita ambil semua yang approved lalu kita filter di server (atau pakai RPC jika kompleks)
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0,0,0,0);

  const { data: expenses, error: expErr } = await supabase
    .from('operational_expenses')
    .select('category, amount')
    .eq('status', 'approved')
    .gte('created_at', startOfMonth.toISOString());

  if (expErr) return [];

  // Hitung total per kategori
  const expenseTotals: Record<string, number> = {};
  expenses?.forEach(exp => {
    expenseTotals[exp.category] = (expenseTotals[exp.category] || 0) + Number(exp.amount);
  });

  // Gabungkan dengan limit untuk mendapatkan rasio/alert
  return limits.map(limit => {
    const totalSpent = expenseTotals[limit.category] || 0;
    const ratio = totalSpent / Number(limit.monthly_limit);
    
    let alertLevel = 'aman'; // < 80%
    if (ratio >= 1) alertLevel = 'bahaya'; // >= 100%
    else if (ratio >= 0.8) alertLevel = 'waspada'; // 80% - 99%

    return {
      category: limit.category,
      limit: Number(limit.monthly_limit),
      spent: totalSpent,
      ratio,
      alertLevel
    };
  });
}

export async function getPendingExpenses() {
  const { data, error } = await supabase
    .from('operational_expenses')
    .select('*')
    .eq('status', 'pending_approval')
    .order('created_at', { ascending: false });

  if (error) return [];
  return data;
}

export async function approveExpense(id: string) {
  const { error } = await supabase
    .from('operational_expenses')
    .update({ status: 'approved' })
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/expenses');
  revalidatePath('/expenses/approvals');
}

export async function rejectExpense(id: string) {
  const { error } = await supabase
    .from('operational_expenses')
    .update({ status: 'rejected' })
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/expenses');
  revalidatePath('/expenses/approvals');
}
