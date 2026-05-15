'use server'

export async function getDashboardStats() {
  // Simulasi fetch database (1 detik)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    totalKas: 12500000,
    omzetHariIni: 4500000,
    totalHpp: 1500000,
    labaBersih: 3000000,
    audit: {
      status: 'aman',
      message: 'Margin operasional berada di atas batas aman (65%). Tidak terdeteksi pembengkakan biaya bahan baku.'
    }
  };
}
