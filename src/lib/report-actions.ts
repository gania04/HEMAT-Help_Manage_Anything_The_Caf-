'use server'

export async function getFinancialReports() {
  await new Promise((resolve) => setTimeout(resolve, 800));

  return [
    { period: 'Januari 2026', omzet: 45000000, hpp: 15000000, laba: 30000000, status: 'Naik' },
    { period: 'Februari 2026', omzet: 48000000, hpp: 16000000, laba: 32000000, status: 'Naik' },
    { period: 'Maret 2026', omzet: 42000000, hpp: 14500000, laba: 27500000, status: 'Turun' },
  ];
}
