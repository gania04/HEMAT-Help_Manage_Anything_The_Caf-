import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!.startsWith('http') 
    ? process.env.NEXT_PUBLIC_SUPABASE_URL! 
    : `https://${process.env.NEXT_PUBLIC_SUPABASE_URL}.supabase.co`,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function test() {
  const { data, error } = await supabase.from('menus').select(`
    id,
    menu_name,
    icon,
    menu_prices(channel, price),
    menu_recipes(
      inventory_id,
      qty_needed,
      inventory(quantity)
    )
  `);
  console.log('Error:', error);
  console.log('Data:', JSON.stringify(data, null, 2));
}

test();
