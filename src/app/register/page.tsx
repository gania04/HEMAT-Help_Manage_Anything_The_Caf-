'use client'

import { useActionState, useEffect } from 'react';
import Image from 'next/image';
import { registerUser } from '@/lib/auth-actions';
import { redirectWithSwCleanup } from '@/lib/utils';
import logoIcon from '../../../public/icon-192x192.png';

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerUser, null);

  // Redirect jika berhasil register dan login
  useEffect(() => {
    if (state && 'redirectTo' in state && state.redirectTo) {
      redirectWithSwCleanup(state.redirectTo);
    }
  }, [state]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-soft-gray py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8 flex flex-col items-center">
          <Image src={logoIcon} alt="HEMAT Logo" width={60} height={60} className="mb-4" />
          <h1 className="text-3xl font-bold text-[#00875A] tracking-tight">Buat Akun HEMAT</h1>
          <p className="text-gray-500 mt-2 text-sm">Daftarkan kafe Anda sekarang juga</p>
        </div>
        
        <form action={formAction} className="space-y-5">
          {state?.error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg text-center font-medium">
              {state.error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">Nama Lengkap / Nama Kafe</label>
            <input 
              name="name" id="name"
              type="text" 
              required
              className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00875A] focus:border-transparent bg-[#F8F9FA]"
              placeholder="Masukkan nama"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="username">Username</label>
            <input 
              name="username" id="username"
              type="text" 
              required
              className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00875A] focus:border-transparent bg-[#F8F9FA]"
              placeholder="Pilih username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email (Opsional)</label>
            <input 
              name="email" id="email"
              type="email" 
              className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00875A] focus:border-transparent bg-[#F8F9FA]"
              placeholder="email@contoh.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
            <input 
              name="password" id="password"
              type="password" 
              required
              className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00875A] focus:border-transparent bg-[#F8F9FA]"
              placeholder="Buat password"
            />
          </div>

          <input type="hidden" name="role" value="owner" />
          
          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-[#00875A] text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-lg shadow-green-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center mt-6"
          >
            {isPending ? 'MEMPROSES...' : 'DAFTAR SEKARANG'}
          </button>

          <div className="text-center pt-4">
            <span className="text-sm text-gray-600">Sudah punya akun? </span>
            <a href="/login" className="text-sm font-bold text-[#00875A] hover:underline">
              Login di sini
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
