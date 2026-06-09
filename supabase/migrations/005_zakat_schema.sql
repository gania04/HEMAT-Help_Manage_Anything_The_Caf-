-- 005_zakat_schema.sql

-- Tabel untuk menyimpan riwayat harga emas
CREATE TABLE IF NOT EXISTS gold_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  price_per_gram DECIMAL(15,2) NOT NULL,
  source VARCHAR(50) NOT NULL, -- 'API' atau 'MANUAL'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Berikan akses agar tidak terkena error RLS (seperti kasus sebelumnya)
ALTER TABLE gold_prices DISABLE ROW LEVEL SECURITY;

-- Insert harga emas default awal (estimasi Rp 1.250.000 per gram)
INSERT INTO gold_prices (price_per_gram, source) 
VALUES (1250000, 'MANUAL');
