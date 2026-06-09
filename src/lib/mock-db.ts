/* eslint-disable @typescript-eslint/no-explicit-any */
// Mock Database untuk mensimulasikan state global di memori server
// Menggunakan globalThis agar state tidak tereset saat Next.js melakukan Fast Refresh (Hot Reload) di environment development.

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  threshold: number;
};

export type DebtItem = {
  id: string;
  type: 'hutang' | 'piutang';
  counterparty: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: 'Belum Lunas' | 'Lunas';
  description: string;
};

const initialInventory: InventoryItem[] = [
  { id: 'INV-01', name: 'Biji Kopi Arabica', category: 'Bahan Baku', stock: 15, unit: 'Kg', threshold: 2 },
  { id: 'INV-02', name: 'Susu UHT', category: 'Bahan Baku', stock: 5, unit: 'Liter', threshold: 10 },
  { id: 'INV-03', name: 'Gula Aren Cair', category: 'Bahan Baku', stock: 8, unit: 'Liter', threshold: 2 },
  { id: 'INV-04', name: 'Cup Plastik 16oz', category: 'Packaging', stock: 150, unit: 'Pcs', threshold: 50 },
  { id: 'INV-05', name: 'Sedotan Kertas', category: 'Packaging', stock: 50, unit: 'Pcs', threshold: 100 },
  { id: 'INV-06', name: 'Teh Hitam', category: 'Bahan Baku', stock: 2, unit: 'Kg', threshold: 1 },
  { id: 'INV-07', name: 'Matcha Powder', category: 'Bahan Baku', stock: 1.5, unit: 'Kg', threshold: 0.5 },
];

const initialMenus = [
  { id: '1', name: 'Kopi Susu Gula Aren', price: 18000, icon: '☕' },
  { id: '2', name: 'Americano Dingin', price: 15000, icon: '🥤' },
  { id: '3', name: 'Matcha Latte', price: 22000, icon: '🍵' },
  { id: '4', name: 'Caffe Latte', price: 20000, icon: '☕' },
  { id: '5', name: 'Red Velvet Cake', price: 22000, icon: '🍰' },
  { id: '6', name: 'Roti Bakar Coklat', price: 15000, icon: '🍞' },
  { id: '7', name: 'Teh Leci', price: 16000, icon: '🍹' },
  { id: '8', name: 'Kentang Goreng', price: 18000, icon: '🍟' },
];

const initialRecipes = {
  '1': [
    { inventoryId: 'INV-01', qtyNeeded: 0.015 },
    { inventoryId: 'INV-02', qtyNeeded: 0.15 },
    { inventoryId: 'INV-03', qtyNeeded: 0.03 },
    { inventoryId: 'INV-04', qtyNeeded: 1 },
    { inventoryId: 'INV-05', qtyNeeded: 1 },
  ],
  '2': [
    { inventoryId: 'INV-01', qtyNeeded: 0.015 },
    { inventoryId: 'INV-04', qtyNeeded: 1 },
    { inventoryId: 'INV-05', qtyNeeded: 1 },
  ],
  '3': [
    { inventoryId: 'INV-07', qtyNeeded: 0.02 },
    { inventoryId: 'INV-02', qtyNeeded: 0.2 },
    { inventoryId: 'INV-04', qtyNeeded: 1 },
    { inventoryId: 'INV-05', qtyNeeded: 1 },
  ],
};

const initialDebts: DebtItem[] = [
  { id: 'DBT-01', type: 'hutang', counterparty: 'Supplier Kopi (Pak Budi)', amount: 1500000, paidAmount: 500000, dueDate: '2026-05-20', status: 'Belum Lunas', description: 'Pembelian Biji Kopi Arabica 10kg' },
  { id: 'DBT-02', type: 'piutang', counterparty: 'PT. Maju Mundur (Catering)', amount: 3500000, paidAmount: 0, dueDate: '2026-05-25', status: 'Belum Lunas', description: 'DP Catering 50 Pax' },
  { id: 'DBT-03', type: 'hutang', counterparty: 'Toko Packaging Sentosa', amount: 800000, paidAmount: 800000, dueDate: '2026-05-10', status: 'Lunas', description: 'Pelunasan Cup Plastik & Sedotan' },
];

declare global {
  var _globalDb: {
    inventory: InventoryItem[];
    menus: any[];
    recipes: any;
    debts: DebtItem[];
  } | undefined;
}

if (!globalThis._globalDb) { // NOSONAR
  // Deep clone agar state aman saat re-inisialisasi
  globalThis._globalDb = {
    inventory: structuredClone(initialInventory),
    menus: structuredClone(initialMenus),
    recipes: structuredClone(initialRecipes),
    debts: structuredClone(initialDebts)
  };
}

export const globalDb = globalThis._globalDb;
