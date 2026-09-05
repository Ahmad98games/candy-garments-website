-- ============================================================================
-- OMNORA STORE MIGRATION: PRODUCT COLORS & VARIANTS STOCK SYSTEM
-- Database: Supabase PostgreSQL
-- ============================================================================

-- 1. PRODUCT COLORS TABLE
CREATE TABLE IF NOT EXISTS public.product_colors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    color_name TEXT NOT NULL,
    color_hex TEXT NOT NULL,
    image_url TEXT,
    display_order INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT product_colors_product_id_color_name_key UNIQUE (product_id, color_name)
);

-- 2. PRODUCT VARIANTS TABLE (EXACT SIZE x COLOR STOCK COMBINATIONS)
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    size_value INT NOT NULL CHECK (size_value >= 22 AND size_value <= 48),
    color_id UUID NOT NULL REFERENCES public.product_colors(id) ON DELETE CASCADE,
    in_stock BOOLEAN DEFAULT true NOT NULL,
    stock_quantity INT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT product_variants_product_id_size_color_key UNIQUE (product_id, size_value, color_id)
);

-- Indexes for maximum query performance
CREATE INDEX IF NOT EXISTS idx_product_colors_product ON public.product_colors(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_color ON public.product_variants(color_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_lookup ON public.product_variants(product_id, color_id, size_value);

-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-applying
DROP POLICY IF EXISTS "Public select product_colors" ON public.product_colors;
DROP POLICY IF EXISTS "Enable all access for product_colors" ON public.product_colors;
DROP POLICY IF EXISTS "Public select product_variants" ON public.product_variants;
DROP POLICY IF EXISTS "Enable all access for product_variants" ON public.product_variants;

-- 4. RLS POLICIES FOR PRODUCT COLORS
CREATE POLICY "Public select product_colors" ON public.product_colors
    FOR SELECT USING (true);

CREATE POLICY "Enable all access for product_colors" ON public.product_colors
    FOR ALL USING (true) WITH CHECK (true);

-- 5. RLS POLICIES FOR PRODUCT VARIANTS
CREATE POLICY "Public select product_variants" ON public.product_variants
    FOR SELECT USING (true);

CREATE POLICY "Enable all access for product_variants" ON public.product_variants
    FOR ALL USING (true) WITH CHECK (true);

-- 6. AUTO-GENERATION TRIGGER: ON ADDING A NEW COLOR TO A PRODUCT
-- Auto-generates variant rows for sizes 22 through 48 (default even size steps: 22,24,26,28,30,32,34,36,38,40,42,44,46,48)
CREATE OR REPLACE FUNCTION public.fn_auto_generate_product_variants()
RETURNS TRIGGER AS $$
DECLARE
    sz INT;
    standard_sizes INT[] := ARRAY[22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48];
BEGIN
    FOREACH sz IN ARRAY standard_sizes LOOP
        INSERT INTO public.product_variants (product_id, size_value, color_id, in_stock)
        VALUES (NEW.product_id, sz, NEW.id, true)
        ON CONFLICT (product_id, size_value, color_id) DO NOTHING;
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_auto_generate_product_variants ON public.product_colors;

CREATE TRIGGER trg_auto_generate_product_variants
AFTER INSERT ON public.product_colors
FOR EACH ROW
EXECUTE FUNCTION public.fn_auto_generate_product_variants();

-- 7. ENABLE SUPABASE REALTIME FOR LIVE STOCK SYNC ACROSS ADMIN AND STOREFRONT
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_colors;
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_variants;
