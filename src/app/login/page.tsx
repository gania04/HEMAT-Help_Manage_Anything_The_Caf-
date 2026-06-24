'use client'

import { useActionState, useEffect, useState } from 'react';
import Image from 'next/image';
import { loginUser, changePasswordAndLogin } from '@/lib/auth-actions';
import { redirectWithSwCleanup } from '@/lib/utils';
import logoIcon from '../../../public/icon-192x192.png';

export default function LoginPage() {
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loginState, loginAction, isLoginPending] = useActionState(loginUser, null);
  const [resetState, resetAction, isResetPending] = useActionState(changePasswordAndLogin, null);

  const state = isForgotPassword ? resetState : loginState;
  const isPending = isForgotPassword ? isResetPending : isLoginPending;
  const formAction = isForgotPassword ? resetAction : loginAction;

  // Redirect jika berhasil login, sekaligus hapus SW
  useEffect(() => {
    if (state && 'redirectTo' in state && state.redirectTo) {
      // Tunggu sampai SW dihapus, baru force hard reload ke dashboard
      redirectWithSwCleanup(state.redirectTo);
    } else {
      // Hapus SW saat halaman pertama kali dimuat
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((regs) => {
          for (const reg of regs) {
            reg.unregister();
          }
        }).catch(() => {});
      }
    }
  }, [state]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-soft-gray py-8 px-4 overflow-y-auto">
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 my-auto">
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

          {!isForgotPassword ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="password">Password</label>
              <input 
                name="password" id="password"
                type="password" 
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00875A] focus:border-transparent bg-[#F8F9FA]"
                placeholder="Masukkan password"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="oldPassword">Password Lama</label>
                <input 
                  name="oldPassword" id="oldPassword"
                  type="password" 
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00875A] focus:border-transparent bg-[#F8F9FA]"
                  placeholder="Masukkan password lama"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="newPassword">Password Baru</label>
                <input 
                  name="newPassword" id="newPassword"
                  type="password" 
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00875A] focus:border-transparent bg-[#F8F9FA]"
                  placeholder="Masukkan password baru"
                />
              </div>
            </>
          )}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-[#00875A] shadow-sm focus:border-[#00875A] focus:ring focus:ring-[#00875A] focus:ring-opacity-50" />
              <span className="ml-2 text-sm text-gray-600">Ingat Saya</span>
            </label>
            <button 
              type="button" 
              onClick={() => setIsForgotPassword(!isForgotPassword)}
              className="text-sm font-medium text-[#00875A] hover:underline"
            >
              {isForgotPassword ? "Kembali ke Login" : "Lupa Password?"}
            </button>
          </div>
          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-[#006A4E] text-white py-3 rounded-lg font-bold hover:bg-green-800 transition shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPending ? 'MEMPROSES...' : (
              <>
                {isForgotPassword ? "Ubah Password & Masuk" : "Masuk"} <span>&gt;</span>
              </>
            )}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
           <div className="inline-block p-3 rounded-xl border border-dashed border-blue-300 bg-blue-50 w-full mb-4">
             <p className="text-xs text-blue-700 flex items-center justify-center gap-2">
               <span>✨</span> Autentikasi terhubung dengan sistem
             </p>
           </div>
           <div className="text-center w-full">
             <a href="/api/clean" className="inline-block w-full py-2 bg-red-100 text-red-700 text-xs font-bold rounded-lg border border-red-200 hover:bg-red-200 transition">
               🔧 KLIK DI SINI JIKA APLIKASI ERROR / BLANK
             </a>
           </div>
        </div>
      </div>
    </div>
  );
}

