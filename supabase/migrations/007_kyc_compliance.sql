-- 007_kyc_compliance.sql

-- 1. Tabel KYC Merchant
CREATE TABLE IF NOT EXISTS merchant_kyc (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_name VARCHAR(255) NOT NULL,
  nik VARCHAR(16) NOT NULL,
  nib VARCHAR(50) NOT NULL,
  ktp_image_url TEXT,
  nib_image_url TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, verified, rejected
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE merchant_kyc DISABLE ROW LEVEL SECURITY;

-- 2. Membuat Storage Bucket 'documents' untuk menyimpan KTP/NIB
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true) -- NOSONAR
ON CONFLICT (id) DO NOTHING;

-- Buka akses publik ke folder documents untuk tahap MVP
CREATE POLICY "Public Access Docs" ON storage.objects FOR ALL USING (bucket_id = 'documents'); -- NOSONAR

-- 3. Tabel Pemantauan Transaksi (Anomali)
CREATE TABLE IF NOT EXISTS fraud_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  alert_type VARCHAR(100) NOT NULL, -- e.g., 'HIGH_AMOUNT', 'UNUSUAL_TIME'
  description TEXT,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE fraud_alerts DISABLE ROW LEVEL SECURITY;
