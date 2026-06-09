-- 002_expenses_schema.sql (Versi Revisi - Anti Error)

-- Buat tipe ENUM (Hanya buat jika belum ada)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'expense_status') THEN
        CREATE TYPE expense_status AS ENUM ('pending_approval', 'approved', 'rejected');
    END IF;
END$$;

-- 1. Tabel Operational Expenses
CREATE TABLE IF NOT EXISTS operational_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  status expense_status DEFAULT 'approved',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabel Budget Limits
CREATE TABLE IF NOT EXISTS budget_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(100) UNIQUE NOT NULL,
  monthly_limit DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger updated_at (Hapus dulu jika sudah ada agar tidak error duplicate)
DROP TRIGGER IF EXISTS update_expenses_modtime ON operational_expenses;
CREATE TRIGGER update_expenses_modtime 
BEFORE UPDATE ON operational_expenses 
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_budget_limits_modtime ON budget_limits;
CREATE TRIGGER update_budget_limits_modtime 
BEFORE UPDATE ON budget_limits 
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Seed data dummy (Hanya masukkan jika datanya belum ada)
INSERT INTO budget_limits (category, monthly_limit)
SELECT 'Operasional (Listrik, Air)', 3000000
WHERE NOT EXISTS (SELECT 1 FROM budget_limits WHERE category = 'Operasional (Listrik, Air)');

INSERT INTO budget_limits (category, monthly_limit)
SELECT 'Gaji Karyawan', 10000000
WHERE NOT EXISTS (SELECT 1 FROM budget_limits WHERE category = 'Gaji Karyawan');

INSERT INTO budget_limits (category, monthly_limit)
SELECT 'Lain-lain', 1000000
WHERE NOT EXISTS (SELECT 1 FROM budget_limits WHERE category = 'Lain-lain');
