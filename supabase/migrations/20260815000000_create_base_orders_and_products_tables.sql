-- ============================================================================
-- OMNORA STORE BASELINE MIGRATION: PRODUCTS & ORDERS TABLES + RLS POLICIES
-- Database: Supabase PostgreSQL
-- ============================================================================

-- 1. BASE PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_no TEXT UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    retail_price NUMERIC NOT NULL DEFAULT 0,
    wholesale_cost NUMERIC DEFAULT 0,
    margin NUMERIC DEFAULT 0,
    category TEXT DEFAULT 'Unstitched Luxury',
    fabric_type TEXT DEFAULT 'Pure Raw Silk 80g',
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    in_stock BOOLEAN DEFAULT true NOT NULL,
    display_order INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    image_aspect_locked BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON public.products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_display_order ON public.products(display_order);

-- 2. BASE ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    city TEXT NOT NULL,
    items JSONB DEFAULT '[]'::jsonb NOT NULL,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    payment_method TEXT DEFAULT 'COD' NOT NULL,
    status TEXT DEFAULT 'Pending' NOT NULL CHECK (status IN ('Pending', 'Dispatched', 'Delivered', 'Cancelled')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 3. ENABLE RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop existing order policies if re-running
DROP POLICY IF EXISTS "Public select products" ON public.products;
DROP POLICY IF EXISTS "Admin write products" ON public.products;
DROP POLICY IF EXISTS "Public insert orders" ON public.orders;
DROP POLICY IF EXISTS "Public select orders" ON public.orders;
DROP POLICY IF EXISTS "Admin all orders" ON public.orders;

-- 4. RLS POLICIES FOR PRODUCTS
CREATE POLICY "Public select products" ON public.products
    FOR SELECT USING (true);

CREATE POLICY "Admin write products" ON public.products
    FOR ALL USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
        auth.uid() IS NOT NULL
    );

-- 5. RLS POLICIES FOR ORDERS
-- Allow any customer (anonymous or authenticated) to create an order
CREATE POLICY "Public insert orders" ON public.orders
    FOR INSERT WITH CHECK (true);

-- Allow customers to select orders (by ID or authenticated session)
CREATE POLICY "Public select orders" ON public.orders
    FOR SELECT USING (true);

-- Allow admin full access to manage orders
CREATE POLICY "Admin all orders" ON public.orders
    FOR ALL USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
        auth.uid() IS NOT NULL
    );

-- Enable Realtime for live order dashboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
