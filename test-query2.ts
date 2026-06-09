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
  const { data: invData, error: invError } = await supabase.from('inventory').select('id, item_name').limit(10);
  console.log('Inv:', invData);

  const { data: menuData, error: mError } = await supabase.from('menus').select('*');
  console.log('Menus:', menuData);

  const { data: pricesData, error: pError } = await supabase.from('menu_prices').select('*');
  console.log('Prices:', pricesData);
}

test();
