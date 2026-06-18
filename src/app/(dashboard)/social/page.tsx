'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/Card";
import { distributeFund, getSocialReport } from "@/lib/social-actions";
import { formatRupiah } from '@/lib/utils';

export default function SocialFundsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const fetchReports = async () => {
    const data = await getSocialReport();
    setReports(data);
  };

  useEffect(() => {
        fetchReports();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await distributeFund(formData);

    if (result.success) {
      setMessage({ type: 'success', text: 'Berhasil mencatat penyaluran dana sosial!' });
      (e.target as HTMLFormElement).reset();
       
    fetchReports();
    } else {
      setMessage({ type: 'error', text: result.error || 'Terjadi kesalahan' });
    }

    setIsSubmitting(false);
  };

return (
    <main className="h-full overflow-y-auto p-4 md:p-10 bg-soft-gray">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary-green">Penyaluran Dana Sosial 🤝</h1>
          <p className="text-gray-500 mt-1">Pemisahan uang Zakat, Infaq, dan Sedekah dari laporan kas operasional.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Penyaluran */}
        <div className="lg:col-span-1">
          <Card className="border-t-4 border-t-[#8E24AA] shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-[#8E24AA]">Catat Penyaluran Baru</h2>
            
            {message && (
              <div className={`p-3 rounded mb-4 text-sm font-bold ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="category">Kategori</label>
              <select name="category" id="category" required className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50 text-gray-700 focus:outline-none focus:border-[#8E24AA]">
                  <option value="Zakat">Zakat Maal</option>
                  <option value="Infaq">Infaq</option>
                  <option value="Sedekah">Sedekah</option>
                  <option value="CSR">CSR / Donasi</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="recipient_name">Nama Penerima / Lembaga</label>
              <input type="text" name="recipient_name" id="recipient_name" required placeholder="Contoh: BAZNAS / Panti Asuhan Yatim" className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-[#8E24AA]"/>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="amount">Nominal (Rp)</label>
              <input type="number" name="amount" id="amount" required min="1000" placeholder="Contoh: 1500000" className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-[#8E24AA]"/>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="notes">Catatan Tambahan</label>
              <textarea name="notes" id="notes" rows={2} placeholder="Keterangan..." className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-[#8E24AA]"></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="receipt">Unggah Struk / Bukti Transfer</label>
              <input type="file" name="receipt" id="receipt" accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer border border-gray-200 rounded-lg p-1"/>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#8E24AA] text-white font-bold py-3 rounded-lg hover:bg-purple-800 transition shadow-md disabled:opacity-50 mt-4"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Penyaluran'}
              </button>
            </form>
          </Card>
        </div>

        {/* Laporan Penyaluran */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm min-h-[500px]">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Riwayat Penyaluran</h2>
            
            {reports.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <span className="text-4xl mb-2">📄</span>
                <p>Belum ada riwayat penyaluran dana sosial.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-100 text-gray-500">
                      <th className="p-3 font-bold">Tanggal</th>
                      <th className="p-3 font-bold">Kategori</th>
                      <th className="p-3 font-bold">Penerima</th>
                      <th className="p-3 font-bold">Nominal</th>
                      <th className="p-3 font-bold">Bukti Struk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                        <td className="p-3 text-sm text-gray-600">
                          {new Date(report.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-700">
                            {report.category}
                          </span>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-gray-800">{report.recipient_name}</p>
                          <p className="text-xs text-gray-500">{report.notes || '-'}</p>
                        </td>
                        <td className="p-3 font-bold text-[#8E24AA]">{formatRupiah(report.amount)}</td>
                        <td className="p-3 text-center">
                          {report.proof_image_url ? (
                            <a href={report.proof_image_url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-500 hover:underline">
                              Lihat Struk
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400">Tidak ada</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </main>
  );
}
