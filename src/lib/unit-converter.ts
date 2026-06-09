// src/lib/unit-converter.ts

/**
 * Mendefinisikan rasio konversi unit (ke unit dasar).
 * Contoh: 1 Kg = 1000 Gram, jadi rasionya 1000.
 */
export const UNIT_CONVERSIONS: Record<string, number> = {
  'Kg': 1000,
  'Gram': 1,
  'Liter': 1000,
  'ml': 1,
  'Pcs': 1,
  'Dus': 24, // asumsi 1 dus = 24 pcs
};

export const BASE_UNITS: Record<string, string> = {
  'Kg': 'Gram',
  'Gram': 'Gram',
  'Liter': 'ml',
  'ml': 'ml',
  'Pcs': 'Pcs',
  'Dus': 'Pcs',
};

/**
 * Mengonversi kuantitas dari satu satuan ke satuan lain.
 * @param quantity Jumlah stok awal
 * @param fromUnit Satuan awal
 * @param toUnit Satuan target
 * @returns Jumlah stok setelah dikonversi
 */
export function convertUnit(quantity: number, fromUnit: string, toUnit: string): number {
  if (fromUnit === toUnit) return quantity;

  const baseUnitFrom = BASE_UNITS[fromUnit];
  const baseUnitTo = BASE_UNITS[toUnit];

  if (!baseUnitFrom || !baseUnitTo || baseUnitFrom !== baseUnitTo) {
    throw new Error(`Tidak dapat mengonversi ${fromUnit} ke ${toUnit}. Kategori satuan berbeda.`);
  }

  const valueInBase = quantity * UNIT_CONVERSIONS[fromUnit];
  const convertedValue = valueInBase / UNIT_CONVERSIONS[toUnit];

  return convertedValue;
}
