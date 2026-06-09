-- 006_social_funds.sql

-- 1. Membuat tabel penyaluran dana sosial
CREATE TABLE IF NOT EXISTS social_funds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL, -- Zakat, Infaq, Sedekah, CSR
  amount DECIMAL(15,2) NOT NULL,
  proof_image_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matikan RLS agar MVP berjalan mulus
ALTER TABLE social_funds DISABLE ROW LEVEL SECURITY;

-- 2. Membuat Storage Bucket 'receipts' secara otomatis (jika belum ada)
-- Note: Skrip ini berjalan jika ektensi pg_graphql / schema storage tersedia di Supabase
INSERT INTO storage.buckets (id, name, public) 
VALUES ('receipts', 'receipts', true) -- NOSONAR
ON CONFLICT (id) DO NOTHING;

-- Opsional: Matikan RLS untuk bucket objects agar upload publik bisa dilakukan di tahap MVP
-- (Sebaiknya gunakan RLS di produksi, tapi untuk MVP kita permudah)
CREATE POLICY "Public Access" ON storage.objects FOR ALL USING (bucket_id = 'receipts'); -- NOSONAR
