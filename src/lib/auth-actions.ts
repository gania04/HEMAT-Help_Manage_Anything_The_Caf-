'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginUser(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  // Validasi form sederhana
  if (!username || !password) {
    return { error: 'Username dan password tidak boleh kosong' };
  }

  // Mock proses autentikasi (misal delay 1 detik untuk simulasi loading)
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Membuat cookie sesi
  const cookieStore = await cookies();
  cookieStore.set('hemat_session', 'mock-session-id', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 Hari
    path: '/',
  });

  // Arahkan ke dashboard
  redirect('/');
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('hemat_session');
  redirect('/login');
}
