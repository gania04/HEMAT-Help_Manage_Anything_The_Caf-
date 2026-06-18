'use client'

import { useActionState, useEffect } from 'react';
import Image from 'next/image';
import { loginUser } from '@/lib/auth-actions';
import logoIcon from '../../../public/icon-192x192.png';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginUser, null);

  // Hapus Service Worker segera saat halaman login dimuat
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        for (let reg of regs) {
          reg.unregister();
        }
      });
    }
  }, []);

  return (
    <div className="flex h-screen items-center justify-center bg-soft-gray">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8 flex flex-col items-center">
          <Image src={logoIcon} alt="HEMAT Logo" width={80} height={80} className="mb-4" />
          <h1 className="text-4xl font-bold text-[#00875A] tracking-tight">HEMAT</h1>
          <p className="text-gray-500 mt-2">Help Manage Anything The Café</p>
        </div>
        
        <form action={formAction} className="space-y-6">
          {state?.error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg text-center font-medium">
              {state.error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="username">Username / Email</label>
              <input 
              name="username" id="username"
              type="text" 
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00875A] focus:border-transparent bg-[#F8F9FA]"
              placeholder="Masukkan username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="password">Password</label>
              <input 
              name="password" id="password"
              type="password" 
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00875A] focus:border-transparent bg-[#F8F9FA]"
              placeholder="Masukkan password"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-[#00875A] shadow-sm focus:border-[#00875A] focus:ring focus:ring-[#00875A] focus:ring-opacity-50" />
              <span className="ml-2 text-sm text-gray-600">Ingat Saya</span>
            </label>
            <button 
              type="button" 
              onClick={() => alert("Silakan hubungi Owner (Pemilik Kafe) atau Admin untuk mereset kata sandi Anda.")}
              className="text-sm font-medium text-[#00875A] hover:underline"
            >
              Lupa Password?
            </button>
          </div>
          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-[#00875A] text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-lg shadow-green-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isPending ? 'MEMPROSES...' : 'MASUK SEKARANG'}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
           <div className="inline-block p-3 rounded-xl border border-dashed border-blue-300 bg-blue-50">
             <p className="text-xs text-blue-700 flex items-center justify-center gap-2">
               <span>✨</span> Autentikasi terhubung dengan sistem
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}

