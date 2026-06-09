/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/Card";
import { submitKyc, getKycStatus, scanAnomalies, resolveAlert, anonymizeAccount } from "@/lib/compliance-actions";

export function CompliancePanel() {
  const [activeTab, setActiveTab] = useState<'kyc' | 'aml' | 'gdpr'>('kyc');
  
  // KYC State
  const [kycStatus, setKycStatus] = useState<any>(null);
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);

  // AML State
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  // GDPR State
  const [isAnonymizing, setIsAnonymizing] = useState(false);

  useEffect(() => {
    async function loadData() {
      const status = await getKycStatus();
      setKycStatus(status);
    }
    loadData();
  }, []);

  const handleKycSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingKyc(true);
    const formData = new FormData(e.currentTarget);
    const res = await submitKyc(formData);
    if (res.success) {
      alert("Dokumen KYC berhasil diunggah dan sedang diproses.");
      setKycStatus({ status: 'pending', owner_name: formData.get('owner_name') });
    }
    setIsSubmittingKyc(false);
  };

  const handleScanAml = async () => {
    setIsScanning(true);
    const newAlerts = await scanAnomalies();
    setAlerts(newAlerts || []);
    setIsScanning(false);
  };

  const handleResolveAlert = async (id: string) => {
    await resolveAlert(id);
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const handleAnonymize = async () => {
    if (confirm("PERINGATAN: Aksi ini akan mengubah nama semua akun menjadi 'Deleted User' sesuai hak penghapusan data (UU PDP). Laporan keuangan tidak akan terpengaruh. Lanjutkan?")) {
      setIsAnonymizing(true);
      await anonymizeAccount();
      alert("Akun berhasil dianonimkan secara permanen.");
      setIsAnonymizing(false);
    }
  };

  return (
    <Card className="p-0 overflow-hidden shadow-sm border border-gray-200">
      {/* Tabs Header */}
      <div className="flex border-b bg-gray-50">
        <button 
          onClick={() => setActiveTab('kyc')}
          className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'kyc' ? 'border-b-2 border-blue-600 text-blue-700 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
        >
          🛡️ KYC & Verifikasi
        </button>
        <button 
          onClick={() => setActiveTab('aml')}
          className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'aml' ? 'border-b-2 border-red-600 text-red-700 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
        >
          🚨 Pemantauan AML
        </button>
        <button 
          onClick={() => setActiveTab('gdpr')}
          className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'gdpr' ? 'border-b-2 border-purple-600 text-purple-700 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
        >
          🔐 Privasi & Retensi Data
        </button>
      </div>

      {/* Tabs Content */}
      <div className="p-6 min-h-[300px]">
        
        {/* KYC Content */}
        {activeTab === 'kyc' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Verifikasi Bisnis (Merchant KYC)</h3>
              <p className="text-sm text-gray-500">Unggah dokumen legalitas Anda untuk mematuhi regulasi keuangan.</p>
            </div>

            {kycStatus ? (
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-center gap-4">
                <div className="text-3xl">⏳</div>
                <div>
                  <h4 className="font-bold text-blue-800">Status: Menunggu Peninjauan</h4>
                  <p className="text-sm text-blue-600">Terima kasih, <strong>{kycStatus.owner_name}</strong>. Dokumen NIK dan NIB Anda sedang ditinjau oleh tim Kepatuhan kami (1x24 jam).</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleKycSubmit} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="owner_name">Nama Pemilik Sesuai KTP</label>
              <input type="text" name="owner_name" id="owner_name" required className="w-full border rounded p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="nik">Nomor Induk Kependudukan (NIK)</label>
              <input type="text" name="nik" id="nik" required maxLength={16} minLength={16} className="w-full border rounded p-2 text-sm" placeholder="16 Digit NIK" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="nib">Nomor Induk Berusaha (NIB)</label>
              <input type="text" name="nib" id="nib" required className="w-full border rounded p-2 text-sm" placeholder="NIB Bisnis" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Upload KTP & NIB (Foto/PDF)</label>
                  <input type="file" required multiple className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                </div>
                <button type="submit" disabled={isSubmittingKyc} className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 disabled:opacity-50">
                  {isSubmittingKyc ? 'Mengunggah...' : 'Kirim Dokumen KYC'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* AML Content */}
        {activeTab === 'aml' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Pemantauan Anti-Pencucian Uang (AML)</h3>
                <p className="text-sm text-gray-500">Scan riwayat transaksi untuk mendeteksi anomali pendanaan gelap.</p>
              </div>
              <button 
                onClick={handleScanAml}
                disabled={isScanning}
                className="bg-red-100 text-red-700 font-bold px-4 py-2 rounded-lg text-sm hover:bg-red-200 transition disabled:opacity-50"
              >
                {isScanning ? 'Memindai...' : '🔍 Jalankan Audit AML'}
              </button>
            </div>

            {alerts.length > 0 ? (
              <div className="space-y-3 mt-4">
                {alerts.map(alert => (
                  <div key={alert.id} className="border-l-4 border-red-500 bg-red-50 p-3 rounded flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-red-600 uppercase">{alert.alert_type}</span>
                      <p className="text-sm text-gray-800 font-medium">{alert.description}</p>
                    </div>
                    <button 
                      onClick={() => handleResolveAlert(alert.id)}
                      className="text-xs font-bold bg-white text-gray-600 border px-3 py-1 rounded hover:bg-gray-100"
                    >
                      Abaikan (Aman)
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-green-50 text-green-700 p-8 rounded-lg text-center mt-4 border border-green-100">
                <span className="text-4xl block mb-2">✅</span>
                <p className="font-bold">Tidak Ditemukan Anomali</p>
                <p className="text-sm mt-1">Semua transaksi Anda berada di bawah batas kewajaran operasional kafe.</p>
              </div>
            )}
          </div>
        )}

        {/* GDPR Content */}
        {activeTab === 'gdpr' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Privasi & Retensi Data (UU PDP)</h3>
              <p className="text-sm text-gray-500">Penuhi standar kepatuhan pengelolaan data pribadi pengguna dan retensi catatan keuangan (5 Tahun).</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                <h4 className="font-bold text-gray-800 mb-2">Arsip Data Keuangan Lama (Cold Storage)</h4>
                <p className="text-xs text-gray-500 mb-4">Pindahkan transaksi yang berumur lebih dari 5 tahun ke Cold Storage untuk meringankan database utama.</p>
                <button className="w-full border border-gray-300 bg-white text-gray-700 font-bold py-2 rounded text-sm hover:bg-gray-100 transition">
                  📦 Pindahkan ke Arsip
                </button>
              </div>

              <div className="border border-red-200 p-4 rounded-lg bg-red-50/30">
                <h4 className="font-bold text-red-700 mb-2">Anonimisasi Data & Hapus Akun</h4>
                <p className="text-xs text-red-600/80 mb-4">Hak Penghapusan Data (Right to Erasure). Hapus identitas staf namun pertahankan data keuangannya secara anonim.</p>
                <button 
                  onClick={handleAnonymize}
                  disabled={isAnonymizing}
                  className="w-full bg-red-600 text-white font-bold py-2 rounded text-sm hover:bg-red-700 transition disabled:opacity-50"
                >
                  {isAnonymizing ? 'Memproses...' : '⚠️ Hapus Akun & Anonimkan'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Card>
  );
}
