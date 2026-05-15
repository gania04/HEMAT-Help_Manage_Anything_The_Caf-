'use server'

import { revalidatePath } from 'next/cache';
import { globalDb } from './mock-db';

export async function processOrder(cartItems: any[], paymentMethod: string, totalAmount: number) {
  // Simulasi proses database / payment gateway (1.5 detik)
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Di masa depan, kode ini akan diganti dengan insert ke Supabase:
  // const { data, error } = await supabase.from('orders').insert({...})
  
  if (cartItems.length === 0) {
    return { success: false, error: 'Keranjang kosong' };
  }

  // LOGIKA INTEGRASI REAL-TIME: Mengurangi stok inventaris
  cartItems.forEach((cartItem) => {
    // Mencari resep (bahan yang dibutuhkan) untuk Menu ini
    const recipe = globalDb.recipes[cartItem.id];
    
    if (recipe) {
      recipe.forEach((ingredient) => {
        // Cari inventory berdasarkan ID
        const invItem = globalDb.inventory.find(i => i.id === ingredient.inventoryId);
        if (invItem) {
          // Kurangi stok berdasarkan kuantitas yang dibeli di kasir dikali kebutuhan resep
          invItem.stock -= (ingredient.qtyNeeded * cartItem.quantity);
          
          // Mencegah stok menjadi negatif (hanya untuk simulasi)
          if (invItem.stock < 0) invItem.stock = 0;
          
          // Membulatkan 3 angka di belakang koma (menghindari error presisi float JavaScript)
          invItem.stock = Math.round(invItem.stock * 1000) / 1000;
        }
      });
    }
  });

  // PENTING: Memaksa halaman inventaris untuk menghapus cache dan menarik data stok yang baru
  revalidatePath('/inventory');

  // Mengembalikan hasil yang sukses
  return {
    success: true,
    orderId: `ORD-${Date.now().toString().slice(-6)}`,
    message: `Pembayaran ${paymentMethod} berhasil sebesar Rp ${totalAmount.toLocaleString('id-ID')}`
  };
}

export async function getPosMenusWithStock() {
  return globalDb.menus.map((menu) => {
    const recipe = globalDb.recipes[menu.id];
    let maxPortions = Infinity;

    if (recipe && recipe.length > 0) {
      recipe.forEach((ingredient) => {
        const invItem = globalDb.inventory.find((i) => i.id === ingredient.inventoryId);
        if (invItem) {
          const portionsForThisIngredient = Math.floor(invItem.stock / ingredient.qtyNeeded);
          if (portionsForThisIngredient < maxPortions) {
            maxPortions = portionsForThisIngredient;
          }
        } else {
          maxPortions = 0;
        }
      });
    } else {
      // Jika belum ada resep, anggap stok tidak terbatas (99 porsi) untuk mockup
      maxPortions = 99; 
    }

    return {
      ...menu,
      maxPortions
    };
  });
}
