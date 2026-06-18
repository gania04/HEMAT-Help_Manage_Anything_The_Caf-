'use client';

import { useState } from 'react';
import { addWasteLog } from '@/lib/waste-actions';

type WasteLog = {
  id: string;
  quantity: number;
  reason: string;
  date: string;
  inventory_id: string;
  item_name: string;
  unit: string;
};

type InventoryItem = {
  id: string;
  name: string;
  stock: number;
  unit: string;
};

export default function WasteClient({ 
  logs, 
  inventoryItems 
}: Readonly<{ 
  logs: WasteLog[], 
  inventoryItems: InventoryItem[] 
}>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<string>('');
  
  const selectedItemData = inventoryItems.find(i => i.id === selectedInventory);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    const formData = new FormData(e.currentTarget);

    try {
      await addWasteLog(formData);
      setIsModalOpen(false);
      globalThis.location.reload(); // Refresh the data
    } catch (_error: any) {
      alert((_error as Error).message || 'Terjadi kesalahan saat mencatat limbah');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-1">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#00875A]">MANAJEMEN LIMBAH</h1>
          <p className="text-gray-500 mt-1">Catat bahan baku yang basi, rusak, atau terbuang di sini.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-red-500 text-white px-5 py-2 rounded-lg font-bold shadow-md hover:bg-red-600 transition flex items-center gap-2"
        >
          <span>🗑️</span> Catat Limbah
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="w-full overflow-x-auto mb-4"><table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
              <th className="p-4 font-medium">Tanggal Pencatatan</th>
              <th className="p-4 font-medium">Nama Bahan Baku</th>
              <th className="p-4 font-medium">Jumlah Dibuang</th>
              <th className="p-4 font-medium">Alasan / Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                <td className="p-4 text-gray-600">{new Date(log.date).toLocaleString('id-ID')}</td>
                <td className="p-4 font-bold text-gray-800">{log.item_name}</td>
                <td className="p-4 font-bold text-red-500">-{log.quantity} <span className="text-gray-400 font-normal text-sm">{log.unit}</span></td>
                <td className="p-4">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm">
                    {log.reason}
                  </span>
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-400">Belum ada riwayat pembuangan bahan baku.</td>
              </tr>
            )}
          </tbody>
        </table></div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
                <span>🗑️</span> Form Catat Limbah
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="inventory_id">Pilih Bahan Baku</label>
              <select 
                  required 
                  name="inventory_id" id="inventory_id" 
                  value={selectedInventory}
                  onChange={(e) => setSelectedInventory(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="" disabled>-- Pilih Bahan --</option>
                  {inventoryItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} (Stok: {item.stock} {item.unit})
                    </option>
                  ))}
                </select>
                {selectedItemData && (
                  <p className="text-xs text-gray-500 mt-1">Sisa stok gudang: {selectedItemData.stock} {selectedItemData.unit}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="waste_quantity" className="block text-sm font-bold text-gray-700 mb-1">Jumlah yang Dibuang</label>
                <div className="relative">
                  <input 
                    id="waste_quantity"
                    required 
                    type="number" 
                    step="0.01" 
                    min="0.01"
                    max={selectedItemData?.stock || undefined}
                    name="quantity" 
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" 
                  />
                  <span className="absolute right-4 top-2 text-gray-400">{selectedItemData?.unit || ''}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="reason">Alasan Pembuangan</label>
              <select name="reason" id="reason" className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-red-500 outline-none mb-2">
                  <option>Kadaluarsa (Expired)</option>
                  <option>Tumpah / Jatuh</option>
                  <option>Rusak (Basi / Kualitas Buruk)</option>
                  <option>Eksperimen / Testing</option>
                  <option>Lainnya</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-lg font-bold hover:bg-gray-200 transition">Batal</button>
                <button type="submit" disabled={isProcessing} className="flex-1 bg-red-500 text-white py-3 rounded-lg font-bold hover:bg-red-600 transition disabled:opacity-50">
                  {isProcessing ? 'Memproses...' : 'Potong Stok & Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
