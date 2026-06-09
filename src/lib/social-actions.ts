'use server'

import { supabase } from './supabase';
import { revalidatePath } from 'next/cache';

export async function distributeFund(formData: FormData) {
  const recipientName = formData.get('recipient_name') as string;
  const category = formData.get('category') as string;
  const amount = Number(formData.get('amount'));
  const notes = formData.get('notes') as string;
  
  // Ambil file gambar struk
  const file = formData.get('receipt') as File;
  let proofImageUrl = '';

  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${category.toLowerCase()}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      return { success: false, error: 'Gagal mengunggah struk: ' + uploadError.message };
    }

    // Dapatkan Public URL
    const { data: publicUrlData } = supabase.storage
      .from('receipts')
      .getPublicUrl(filePath);
      
    proofImageUrl = publicUrlData.publicUrl;
  }

  // Simpan ke database
  const { error: dbError } = await supabase
    .from('social_funds')
    .insert({
      recipient_name: recipientName,
      category,
      amount,
      notes,
      proof_image_url: proofImageUrl
    });

  if (dbError) {
    return { success: false, error: 'Gagal merekam penyaluran: ' + dbError.message };
  }

  revalidatePath('/social');
  return { success: true };
}

export async function getSocialReport() {
  const { data, error } = await supabase
    .from('social_funds')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching social funds:', error);
    return [];
  }

  return data;
}
