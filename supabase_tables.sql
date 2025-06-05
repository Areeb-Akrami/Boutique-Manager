-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create bills table
CREATE TABLE IF NOT EXISTS bills (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    bill_number VARCHAR(50) NOT NULL,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(50),
    date DATE NOT NULL,
    delivery_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('paid', 'unpaid', 'advance')),
    payment_mode VARCHAR(20) NOT NULL CHECK (payment_mode IN ('cash', 'gpay')),
    total_amount NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    bill_id INTEGER NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('stitching', 'dupatta', 'handwork', 'embroidery', 'hanging', 'fabric')),
    amount NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create dupattas table
CREATE TABLE IF NOT EXISTS dupattas (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    order_number VARCHAR(50) NOT NULL,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(50),
    order_date DATE NOT NULL,
    delivery_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')),
    amount NUMERIC(10, 2) NOT NULL,
    payment_mode VARCHAR(20) NOT NULL CHECK (payment_mode IN ('cash', 'gpay')),
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create salaries table
CREATE TABLE IF NOT EXISTS salaries (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    worker_name VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO settings (name, phone, address) 
VALUES ('Elegance Boutique', '+91 98765 43210', '123 Fashion Street, Stylish City')
ON CONFLICT (id) DO NOTHING;

-- Enable row-level security for tables
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE dupattas ENABLE ROW LEVEL SECURITY;
ALTER TABLE salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS bills_policy ON bills;
DROP POLICY IF EXISTS services_policy ON services;
DROP POLICY IF EXISTS dupattas_policy ON dupattas;
DROP POLICY IF EXISTS salaries_policy ON salaries;
DROP POLICY IF EXISTS expenses_policy ON expenses;
DROP POLICY IF EXISTS settings_policy ON settings;

-- Create policies for bills table
CREATE POLICY bills_select_policy ON bills
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY bills_insert_policy ON bills
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY bills_update_policy ON bills
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY bills_delete_policy ON bills
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create policies for services table
CREATE POLICY services_select_policy ON services
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY services_insert_policy ON services
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY services_update_policy ON services
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY services_delete_policy ON services
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create policies for dupattas table
CREATE POLICY dupattas_select_policy ON dupattas
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY dupattas_insert_policy ON dupattas
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY dupattas_update_policy ON dupattas
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY dupattas_delete_policy ON dupattas
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create policies for salaries table
CREATE POLICY salaries_select_policy ON salaries
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY salaries_insert_policy ON salaries
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY salaries_update_policy ON salaries
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY salaries_delete_policy ON salaries
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create policies for expenses table
CREATE POLICY expenses_select_policy ON expenses
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY expenses_insert_policy ON expenses
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY expenses_update_policy ON expenses
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY expenses_delete_policy ON expenses
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create policies for settings table
CREATE POLICY settings_select_policy ON settings
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY settings_insert_policy ON settings
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY settings_update_policy ON settings
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY settings_delete_policy ON settings
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
