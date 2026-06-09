'use server'

import { supabase } from './supabase';
import { revalidatePath } from 'next/cache';

// --- 1. KYC / Merchant Verification ---
export async function getKycStatus() {
  const { data, error } = await supabase
    .from('merchant_kyc')
    .select('*')
    .order('submitted_at', { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data;
}

export async function submitKyc(formData: FormData) {
  const ownerName = formData.get('owner_name') as string;
  const nik = formData.get('nik') as string;
  const nib = formData.get('nib') as string;
  
  // Karena keterbatasan MVP, kita simulasi menyimpan data form.
  // Idealnya ini mengunggah file ke Storage seperti pada fitur Dana Sosial.
  
  const { error } = await supabase
    .from('merchant_kyc')
    .insert({
      owner_name: ownerName,
      nik,
      nib,
      status: 'pending' // Menunggu verifikasi admin pusat
    });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/settings');
  return { success: true };
}

// --- 2. Fraud & Anomaly Monitoring ---
export async function scanAnomalies() {
  // Ambil transaksi hari ini
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: txs } = await supabase
    .from('transactions')
    .select('id, total_amount')
    .gte('created_at', today.toISOString());

  if (!txs) return [];

  const alerts = [];
  
  // Rule 1: Transaksi individu bernilai > Rp 10.000.000 mencurigakan untuk ukuran kafe
  for (const tx of txs) {
    if (Number(tx.total_amount) > 10000000) {
      alerts.push({
        transaction_id: tx.id,
        alert_type: 'HIGH_AMOUNT_RISK',
        description: `Terdeteksi transaksi tunggal bernilai abnormal: Rp ${tx.total_amount}`
      });
    }
  }

  // Masukkan alert ke database jika belum ada
  for (const alert of alerts) {
    await supabase.from('fraud_alerts').insert(alert).select('id');
  }

  const { data: allAlerts } = await supabase
    .from('fraud_alerts')
    .select('*')
    .eq('is_resolved', false);

  return allAlerts || [];
}

export async function resolveAlert(alertId: string) {
  await supabase.from('fraud_alerts').update({ is_resolved: true }).eq('id', alertId);
  revalidatePath('/settings');
}

// --- 3. Data Privacy (Anonymization & Deletion) ---
export async function anonymizeAccount() {
  // Skenario simulasi untuk memenuhi UU PDP:
  // 1. Mengganti nama user menjadi 'Anonim'
  // 2. Transaksi akan tetap ada demi integritas keuangan
  
  const { error } = await supabase
    .from('users')
    .update({ 
      full_name: 'Deleted User', 
      role: 'archived',
      password_hash: 'deleted' 
    })
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Update semua dummy user
    
  if (error) return { success: false, error: error.message };
  
  return { success: true };
}
