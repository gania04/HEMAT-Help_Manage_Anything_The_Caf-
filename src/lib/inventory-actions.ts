'use server'

import { globalDb } from './mock-db';

export async function getInventoryItems() {
  // Simulasi network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Ambil data langsung dari mock database global dan kalkulasi statusnya
  return globalDb.inventory.map(item => ({
    ...item,
    status: item.stock > item.threshold ? 'Aman' : 'Kritis'
  }));
}
