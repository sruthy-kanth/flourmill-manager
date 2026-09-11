-- ==========================================================
-- MALAYALAM FLOUR MILL MANAGEMENT SYSTEM (മില്ല് മാനേജ്‌മെന്റ്)
-- Database Schema for Supabase Postgres
-- ==========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create 'mills' table
CREATE TABLE IF NOT EXISTS mills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL DEFAULT 'ഞങ്ങളുടെ മില്ല്',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create 'operations' table
CREATE TABLE IF NOT EXISTS operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mill_id UUID NOT NULL REFERENCES mills(id) ON DELETE CASCADE,
    name_ml TEXT NOT NULL,
    unit TEXT NOT NULL DEFAULT 'കിലോ',
    price_per_unit NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create 'customers' table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mill_id UUID NOT NULL REFERENCES mills(id) ON DELETE CASCADE,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_mill_customer_phone UNIQUE (mill_id, phone)
);

-- 5. Create 'transactions' table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mill_id UUID NOT NULL REFERENCES mills(id) ON DELETE CASCADE,
    operation_id UUID NOT NULL REFERENCES operations(id) ON DELETE RESTRICT,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Indexes for High Performance
CREATE INDEX IF NOT EXISTS idx_transactions_mill_date ON transactions(mill_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_operation ON transactions(operation_id);
CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(mill_id, phone);
CREATE INDEX IF NOT EXISTS idx_operations_mill_active ON operations(mill_id, is_active);

-- 7. Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_operations_updated_at ON operations;
CREATE TRIGGER trg_operations_updated_at
    BEFORE UPDATE ON operations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_customers_updated_at ON customers;
CREATE TRIGGER trg_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_transactions_updated_at ON transactions;
CREATE TRIGGER trg_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Seed Initial Data
DO $$
DECLARE
    default_mill_id UUID;
BEGIN
    -- Check if a mill already exists
    SELECT id INTO default_mill_id FROM mills LIMIT 1;
    
    IF default_mill_id IS NULL THEN
        INSERT INTO mills (name) VALUES ('ശ്രീ മില്ല് (Flour Mill)')
        RETURNING id INTO default_mill_id;
    END IF;

    -- Seed the 7 Initial Operations if table is empty for this mill
    IF NOT EXISTS (SELECT 1 FROM operations WHERE mill_id = default_mill_id) THEN
        INSERT INTO operations (mill_id, name_ml, unit, price_per_unit, is_active)
        VALUES 
            (default_mill_id, 'അരി പൊടിക്കാൻ', 'കിലോ', 12.00, true),
            (default_mill_id, 'ഗോതമ്പ് പൊടിക്കാൻ', 'കിലോ', 14.00, true),
            (default_mill_id, 'മുളക് പൊടിക്കാൻ', 'കിലോ', 35.00, true),
            (default_mill_id, 'മഞ്ഞൾ പൊടിക്കാൻ', 'കിലോ', 40.00, true),
            (default_mill_id, 'തേങ്ങ ആട്ടിക്കാൻ', 'കിലോ', 25.00, true),
            (default_mill_id, 'അരി വറുക്കാൻ', 'കിലോ', 15.00, true),
            (default_mill_id, 'അവലോസ് വറുക്കാൻ', 'കിലോ', 20.00, true);
    END IF;
END $$;

-- 9. Row Level Security (RLS) Configuration for No-Auth Single Owner MVP
-- Note: As specified, anon key is allowed full access for single-owner standalone use.
ALTER TABLE mills ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public anon access on mills" ON mills FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public anon access on operations" ON operations FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public anon access on customers" ON customers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public anon access on transactions" ON transactions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
