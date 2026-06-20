CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
  movement_type VARCHAR(10) NOT NULL, -- 'IN' or 'OUT'
  qty DECIMAL(10,3) NOT NULL,
  balance_after DECIMAL(10,3) NOT NULL,
  reference VARCHAR(255), -- 'POS Checkout', 'Manual Update', 'Waste', 'Stok Awal'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger function to log inventory movements
CREATE OR REPLACE FUNCTION log_inventory_movement()
RETURNS TRIGGER AS $$
BEGIN
    -- For UPDATE
    IF TG_OP = 'UPDATE' THEN
        IF NEW.quantity <> OLD.quantity THEN
            INSERT INTO inventory_movements (inventory_id, movement_type, qty, balance_after, reference)
            VALUES (
                NEW.id,
                CASE WHEN NEW.quantity > OLD.quantity THEN 'IN' ELSE 'OUT' END,
                ABS(NEW.quantity - OLD.quantity),
                NEW.quantity,
                'Penyesuaian Sistem/Kasir'
            );
        END IF;
        RETURN NEW;
    END IF;

    -- For INSERT
    IF TG_OP = 'INSERT' THEN
        INSERT INTO inventory_movements (inventory_id, movement_type, qty, balance_after, reference)
        VALUES (
            NEW.id,
            'IN',
            NEW.quantity,
            NEW.quantity,
            'Stok Awal (Baru)'
        );
        RETURN NEW;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS inventory_movement_trigger ON inventory;
CREATE TRIGGER inventory_movement_trigger
AFTER INSERT OR UPDATE ON inventory
FOR EACH ROW
EXECUTE PROCEDURE log_inventory_movement();
