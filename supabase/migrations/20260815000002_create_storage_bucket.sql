-- ============================================================================
-- CREATE STORAGE BUCKET & PERMISSIVE STORAGE RLS POLICIES
-- Target: Supabase Storage
-- ============================================================================

-- Create product-media storage bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-media', 'product-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow public access to product-media storage bucket
DROP POLICY IF EXISTS "Public access to product media" ON storage.objects;
CREATE POLICY "Public access to product media" ON storage.objects
    FOR ALL USING (bucket_id = 'product-media') WITH CHECK (bucket_id = 'product-media');
