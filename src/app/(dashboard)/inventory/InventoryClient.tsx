'use client';

import { useState } from 'react';
import { addInventoryItem, updateInventoryItem, deleteInventoryItem } from '@/lib/inventory-actions';

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  threshold: number;
  unitPrice: number;
  status: string;
};

export default function InventoryClient({ initialItems }: Readonly<{ initialItems: InventoryItem[] }>) {
  const [items] = useState<InventoryItem[]>(initialItems);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOpenModal = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
    } else {
      setEditingItem(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    const formData = new FormData(e.currentTarget);

    try {
      if (editingItem) {
        await updateInventoryItem(editingItem.id, formData);
        // Optimistic UI update could be added here, but revalidatePath will refresh data.
      } else {
        await addInventoryItem(formData);
      }
      handleCloseModal();
      globalThis.location.reload(); // Simple refresh to get new server data after revalidate
    } catch (_error: unknown) {
      alert('Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus barang ini?')) {
      setIsProcessing(true);
      try {
        await deleteInventoryItem(id);
        globalThis.location.reload();
      } catch (_error: unknown) {
        alert('Gagal menghapus data');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="flex-1">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#00875A]">INVENTARIS</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#00875A] text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-green-700 transition"
        >
          + Tambah Barang
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
              <th className="p-4 font-medium">Nama Barang</th>
              <th className="p-4 font-medium">Kategori</th>
              <th className="p-4 font-medium">Stok</th>
              <th className="p-4 font-medium">Biaya/Unit</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                <td className="p-4 font-bold">{item.name}</td>
                <td className="p-4 text-gray-600">{item.category}</td>
                <td className="p-4 font-bold">{item.stock} <span className="text-gray-500 font-normal">{item.unit}</span></td>
                <td className="p-4 text-gray-600">Rp {item.unitPrice.toLocaleString('id-ID')}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.status === 'Aman' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleOpenModal(item)} className="text-[#00875A] font-bold text-sm hover:underline mr-4">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-500 font-bold text-sm hover:underline">Hapus</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">Belum ada data bahan baku.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-[#00875A]">
                {editingItem ? 'Edit Bahan Baku' : 'Tambah Bahan Baku Baru'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="name">Nama Barang</label>
              <input required type="text" name="name" id="name" defaultValue={editingItem?.name} className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#00875A] outline-none" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="category">Kategori</label>
              <select name="category" id="category" defaultValue={editingItem?.category || 'Bahan Baku'} className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#00875A] outline-none">
                    <option>Bahan Baku</option>
                    <option>Packaging</option>
                    <option>Bahan Tambahan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="unit">Satuan Dasar</label>
              <select name="unit" id="unit" defaultValue={editingItem?.unit || 'Gram'} className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#00875A] outline-none">
                    <option>Gram</option>
                    <option>Kg</option>
                    <option>ml</option>
                    <option>Liter</option>
                    <option>Pcs</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="stock">Kuantitas Stok</label>
              <input required type="number" step="0.01" name="stock" id="stock" defaultValue={editingItem?.stock} className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#00875A] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="threshold">Batas Minimum (Alert)</label>
              <input required type="number" step="0.01" name="threshold" id="threshold" defaultValue={editingItem?.threshold} className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#00875A] outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="unitPrice">Harga per Satuan (Rp)</label>
              <input required type="number" name="unitPrice" id="unitPrice" defaultValue={editingItem?.unitPrice} className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#00875A] outline-none" />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={handleCloseModal} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-lg font-bold hover:bg-gray-200 transition">Batal</button>
                <button type="submit" disabled={isProcessing} className="flex-1 bg-[#00875A] text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50">
                  {isProcessing ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
