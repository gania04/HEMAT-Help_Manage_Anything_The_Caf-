import { getInventoryItems } from "@/lib/inventory-actions";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function InventoryPage() {
  const items = await getInventoryItems();

  return (
    <main className="h-full overflow-y-auto p-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#00875A]">INVENTARIS</h1>
        <button className="bg-[#00875A] text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-green-700 transition">
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
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.status === 'Aman' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="text-[#00875A] font-bold text-sm hover:underline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
