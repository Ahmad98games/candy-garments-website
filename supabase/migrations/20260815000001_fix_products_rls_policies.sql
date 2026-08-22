-- ============================================================================
-- FIX RLS POLICIES FOR PRODUCTS TABLE
-- Allows full SELECT, INSERT, UPDATE, DELETE access for admin and client upserts
-- ============================================================================

DROP POLICY IF EXISTS "Admin write products" ON public.products;
DROP POLICY IF EXISTS "Enable all access for products" ON public.products;

CREATE POLICY "Enable all access for products" ON public.products
    FOR ALL USING (true) WITH CHECK (true);
