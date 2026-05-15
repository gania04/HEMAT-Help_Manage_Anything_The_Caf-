'use server'

import { revalidatePath } from 'next/cache';
import { globalDb, DebtItem } from './mock-db';

export async function getDebts() {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return globalDb.debts || [];
}

export async function payDebt(id: string, amount: number) {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const debt = globalDb.debts.find(d => d.id === id);
  if (!debt) return { success: false, error: 'Tagihan tidak ditemukan' };

  if (debt.status === 'Lunas') return { success: false, error: 'Tagihan sudah lunas' };

  debt.paidAmount += amount;
  
  if (debt.paidAmount >= debt.amount) {
    debt.paidAmount = debt.amount;
    debt.status = 'Lunas';
  }

  // Jika Hutang, maka bayar pakai Total Kas. (Untuk kesederhanaan simulasi, kita lewati update Kas. Nanti dihubungkan ke Kas).
  
  revalidatePath('/debts');

  return { success: true, message: `Berhasil mencatat pembayaran sejumlah Rp ${amount.toLocaleString('id-ID')}` };
}
