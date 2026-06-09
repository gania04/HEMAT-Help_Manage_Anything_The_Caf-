import { getInventoryItems } from "@/lib/inventory-actions";
import InventoryClient from "./InventoryClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function InventoryPage() {
  const items = await getInventoryItems();

  return (
    <main className="h-full overflow-y-auto p-10">
      <InventoryClient initialItems={items} />
    </main>
  );
}
