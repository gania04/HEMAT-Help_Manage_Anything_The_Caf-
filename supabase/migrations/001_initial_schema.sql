-- 001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum Types
CREATE TYPE user_role AS ENUM ('owner', 'manager', 'kasir', 'admin');
CREATE TYPE transaction_status AS ENUM ('completed', 'pending_void', 'voided');
CREATE TYPE sale_channel AS ENUM ('dine_in', 'takeaway', 'grabfood', 'gofood', 'shopeefood');
CREATE TYPE payment_type AS ENUM ('tunai', 'debit', 'qris', 'murabahah');

-- 1. Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  business_id UUID, -- For multi-tenant if needed later
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Inventory Table (Bahan Baku)
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  quantity DECIMAL(10,3) NOT NULL DEFAULT 0.000,
  unit VARCHAR(50) NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  min_stock DECIMAL(10,3) NOT NULL DEFAULT 0.000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Menus Table (Produk Jual)
CREATE TABLE menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_name VARCHAR(255) NOT NULL,
  base_hpp DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  icon VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Menu Recipes (Komposisi / HPP Kalkulator)
CREATE TABLE menu_recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_id UUID REFERENCES menus(id) ON DELETE CASCADE,
  inventory_id UUID REFERENCES inventory(id) ON DELETE RESTRICT,
  qty_needed DECIMAL(10,3) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Menu Prices (Multi-channel Pricing)
CREATE TABLE menu_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_id UUID REFERENCES menus(id) ON DELETE CASCADE,
  channel sale_channel NOT NULL,
  price DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(menu_id, channel)
);

-- 6. Transactions (Header)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  channel sale_channel NOT NULL,
  payment_method payment_type NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  status transaction_status DEFAULT 'completed',
  evidence_doc_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Transaction Items (Detail)
CREATE TABLE transaction_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  menu_id UUID REFERENCES menus(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  price_at_sale DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  old_value JSONB,
  new_value JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Waste Logs (Pencatatan Limbah)
CREATE TABLE waste_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inventory_id UUID REFERENCES inventory(id) ON DELETE RESTRICT,
  quantity DECIMAL(10,3) NOT NULL,
  reason VARCHAR(255) NOT NULL,
  staff_id UUID REFERENCES users(id) ON DELETE SET NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inventory_modtime BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_menus_modtime BEFORE UPDATE ON menus FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_menu_prices_modtime BEFORE UPDATE ON menu_prices FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_transactions_modtime BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Optional: Initial Dummy Data (Admin)
-- INSERT INTO users (email, full_name, role) VALUES ('admin@hemat.cafe', 'Admin HEMAT', 'admin');
