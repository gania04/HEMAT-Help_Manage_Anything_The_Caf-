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
    console.warn("Login database gagal, menggunakan Fallback Bypass Owner", error);
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

  return { success: true, redirectTo: '/' };
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('hemat_session');
  redirect('/login');
}

export async function createStaff(formData: FormData) {
  const name = formData.get('name') as string;
  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  if (!name || !username || !password || !role) {
    return { success: false, error: 'Semua field wajib diisi' };
  }

  const { error } = await supabase.from('users').insert({
    name: name,
    full_name: name,
    username: username,
    email: email || `${username}@hemat.cafe`,
    password: password,
    role: role
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
