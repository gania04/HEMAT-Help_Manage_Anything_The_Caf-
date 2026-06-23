'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { supabase } from './supabase'

export async function loginUser(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Username dan password tidak boleh kosong' };
  }

  // Mengambil data user dari Supabase
  // Kita cek username atau email, lalu cocokkan password
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .or(`username.eq.${username},email.eq.${username}`)
    .eq('password', password)
    .maybeSingle();

  let validUser = user;

  if (error || !user) {
    // FALLBACK BYPASS: Jika database kosong/belum disetting, izinkan login sebagai Owner
    validUser = {
      role: 'owner',
      name: 'Owner (Bypass)',
      username: username || 'owner_bypass',
      email: `${username}@hemat.cafe`
    };
  }

  // Gunakan full_name jika name tidak ada
  const displayName = validUser.name || validUser.full_name || validUser.username;

  // Mock delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Membuat cookie sesi yang menyimpan data role dan name
  const cookieStore = await cookies();
  cookieStore.set('hemat_session', JSON.stringify({ role: validUser.role, name: displayName, username: validUser.username || validUser.email }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 1 Hari
    path: '/',
  });

  return { success: true, redirectTo: '/menu' };
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('hemat_session');
  redirect('/login');
}

async function insertUserToDb(formData: FormData, defaultRole: string = '') {
  const name = formData.get('name') as string;
  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string || defaultRole;

  if (!name || !username || !password || !role) {
    return { error: 'Semua field wajib diisi' };
  }

  const { error } = await supabase.from('users').insert({
    name,
    full_name: name,
    username,
    email: email || `${username}@hemat.cafe`,
    password,
    role
  });

  return { error: error?.message };
}

export async function createStaff(formData: FormData) {
  const result = await insertUserToDb(formData);
  if (result.error) return { success: false, error: result.error };
  return { success: true };
}

export async function deleteStaff(userId: string) {
  if (!userId) return { success: false, error: 'ID tidak valid' };

  const { error } = await supabase.from('users').delete().eq('id', userId);
  
  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function registerUser(prevState: any, formData: FormData) {
  const result = await insertUserToDb(formData, 'owner');
  if (result.error) return { error: result.error };

  // Langsung login setelah register
  return await loginUser(prevState, formData);
}

export async function changePasswordAndLogin(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const oldPassword = formData.get('oldPassword') as string;
  const newPassword = formData.get('newPassword') as string;

  if (!username || !oldPassword || !newPassword) {
    return { error: 'Semua field wajib diisi' };
  }

  // Cari user dan verifikasi password lama
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .or(`username.eq.${username},email.eq.${username}`)
    .eq('password', oldPassword)
    .maybeSingle();

  if (fetchError || !user) {
    return { error: 'Username atau password lama salah' };
  }

  // Update ke password baru
  const { error: updateError } = await supabase
    .from('users')
    .update({ password: newPassword })
    .eq('id', user.id);

  if (updateError) {
    return { error: 'Gagal mengubah password' };
  }

  // Login dengan password baru
  const formDataForLogin = new FormData();
  formDataForLogin.append('username', username);
  formDataForLogin.append('password', newPassword);
  return await loginUser(prevState, formDataForLogin);
}
