import { getInventoryItems } from "@/lib/inventory-actions";
import { getWasteLogs } from "@/lib/waste-actions";
import WasteClient from "./WasteClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function WastePage() {
  // Ambil data bahan baku (untuk pilihan form dropdown) dan data riwayat limbah (untuk tabel)
  const [inventoryItems, logs] = await Promise.all([
    getInventoryItems(),
    getWasteLogs()
  ]);

  return (
    <main className="h-full overflow-y-auto p-10 bg-soft-gray">
      <WasteClient inventoryItems={inventoryItems} logs={logs} />
    </main>
  );
}
