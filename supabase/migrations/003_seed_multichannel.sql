-- 003_seed_multichannel.sql

-- Skrip ini akan menambahkan harga khusus untuk channel Takeaway, GrabFood, GoFood, dan ShopeeFood
-- pada menu-menu yang sudah ada di dalam tabel `menus`.
-- Ini akan mendemonstrasikan fitur Multi-Channel Pricing.

DO $$
DECLARE
    kopi_susu_id UUID;
    americano_id UUID;
BEGIN
    -- Cari ID Menu berdasarkan nama
    SELECT id INTO kopi_susu_id FROM menus WHERE menu_name ILIKE '%Kopi Susu%' LIMIT 1;
    SELECT id INTO americano_id FROM menus WHERE menu_name ILIKE '%Americano%' LIMIT 1;

    IF kopi_susu_id IS NOT NULL THEN
        -- Harga Takeaway (+10%)
        INSERT INTO menu_prices (menu_id, channel, price) VALUES (kopi_susu_id, 'takeaway', 19800) ON CONFLICT DO NOTHING;
        -- Harga GrabFood (+20%)
        INSERT INTO menu_prices (menu_id, channel, price) VALUES (kopi_susu_id, 'grabfood', 21600) ON CONFLICT DO NOTHING;
        -- Harga GoFood (+20%)
        INSERT INTO menu_prices (menu_id, channel, price) VALUES (kopi_susu_id, 'gofood', 21600) ON CONFLICT DO NOTHING;
        -- Harga ShopeeFood (+25%)
        INSERT INTO menu_prices (menu_id, channel, price) VALUES (kopi_susu_id, 'shopeefood', 22500) ON CONFLICT DO NOTHING;
    END IF;

    IF americano_id IS NOT NULL THEN
        -- Harga Takeaway (+10%)
        INSERT INTO menu_prices (menu_id, channel, price) VALUES (americano_id, 'takeaway', 16500) ON CONFLICT DO NOTHING;
        -- Harga GrabFood (+20%)
        INSERT INTO menu_prices (menu_id, channel, price) VALUES (americano_id, 'grabfood', 18000) ON CONFLICT DO NOTHING;
        -- Harga GoFood (+20%)
        INSERT INTO menu_prices (menu_id, channel, price) VALUES (americano_id, 'gofood', 18000) ON CONFLICT DO NOTHING;
        -- Harga ShopeeFood (+25%)
        INSERT INTO menu_prices (menu_id, channel, price) VALUES (americano_id, 'shopeefood', 18750) ON CONFLICT DO NOTHING;
    END IF;

END $$;
