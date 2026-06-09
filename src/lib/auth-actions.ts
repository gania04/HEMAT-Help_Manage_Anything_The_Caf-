'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginUser(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Username dan password tidak boleh kosong' };
  }

  // Akun akses dummy untuk berbagai bagian (sesuai role)
  const ACCOUNTS = [
    { username: 'owner', password: '123', role: 'owner', name: 'Gania (Owner)' },
    { username: 'kasir1', password: '123', role: 'kasir', name: 'Siti (Kasir)' },
    { username: 'kasir2', password: '123', role: 'kasir', name: 'Budi (Kasir)' },
    { username: 'admin', password: '123', role: 'admin', name: 'Andi (Admin)' }
  ];

  const user = ACCOUNTS.find(u => u.username === username && u.password === password);

  if (!user) {
    // Memberikan error jika tidak ada yg cocok
    return { error: 'Username atau password salah! Coba: owner/123, kasir1/123, admin/123' };
  }

  // Mock delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Membuat cookie sesi yang menyimpan data role dan name
  const cookieStore = await cookies();
  cookieStore.set('hemat_session', JSON.stringify({ role: user.role, name: user.name, username: user.username }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 1 Hari
    path: '/',
  });

  redirect('/');
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('hemat_session');
  redirect('/login');
}
