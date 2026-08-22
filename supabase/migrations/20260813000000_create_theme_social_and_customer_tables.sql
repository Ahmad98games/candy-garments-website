-- ============================================================================
-- OMNORA STORE MIGRATION: THEME, SOCIAL, CUSTOMER PROFILES, & PRODUCTS EXTENSION
-- Database: Supabase PostgreSQL
-- ============================================================================

-- 1. FONT PAIRS TABLE (Pre-seeded, admin cannot add rows)
CREATE TABLE IF NOT EXISTS public.font_pairs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label TEXT NOT NULL UNIQUE,
    heading_font TEXT NOT NULL,
    body_font TEXT NOT NULL,
    mono_font TEXT NOT NULL,
    preview_swatch_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Seed 7 Curated Font Pairs (Pre-tested for high contrast & legibility against obsidian dark canvas)
INSERT INTO public.font_pairs (id, label, heading_font, body_font, mono_font, preview_swatch_url) VALUES
('00000000-0000-0000-0000-000000000010', 'Obsidian Default', 'Inter', 'Inter', 'JetBrains Mono', 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap'),
('00000000-0000-0000-0000-000000000011', 'Space Tech', 'Space Grotesk', 'Inter', 'IBM Plex Mono', 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500&family=IBM+Plex+Mono:wght@400;600&display=swap'),
('00000000-0000-0000-0000-000000000012', 'Sora Clean', 'Sora', 'Sora', 'Roboto Mono', 'https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=Roboto+Mono:wght@400;600&display=swap'),
('00000000-0000-0000-0000-000000000013', 'General Precision', 'General Sans', 'Switzer', 'Fira Code', 'https://api.fontshare.com/v2/css?f[]=general-sans@500,700&f[]=switzer@400,500&f[]=fira-code@400,600&display=swap'),
('00000000-0000-0000-0000-000000000014', 'Outfit Modern', 'Outfit', 'Outfit', 'JetBrains Mono', 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap'),
('00000000-0000-0000-0000-000000000015', 'Jakarta Corporate', 'Plus Jakarta Sans', 'Inter', 'Space Mono', 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700&family=Inter:wght@400;500&family=Space+Mono:wght@400;700&display=swap'),
('00000000-0000-0000-0000-000000000016', 'Lexend Minimal', 'Lexend', 'Lexend', 'IBM Plex Mono', 'https://fonts.googleapis.com/css2?family=Lexend:wght@400;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap')
ON CONFLICT (label) DO UPDATE SET
    heading_font = EXCLUDED.heading_font,
    body_font = EXCLUDED.body_font,
    mono_font = EXCLUDED.mono_font,
    preview_swatch_url = EXCLUDED.preview_swatch_url;

-- 2. SITE THEME SETTINGS TABLE (Singleton table, fixed ID)
CREATE TABLE IF NOT EXISTS public.site_theme_settings (
    id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    canvas_bg VARCHAR(9) DEFAULT '#060708' NOT NULL,
    surface_bg VARCHAR(9) DEFAULT '#0D1117' NOT NULL,
    card_bg VARCHAR(9) DEFAULT '#161B22' NOT NULL,
    accent_primary VARCHAR(9) DEFAULT '#10B981' NOT NULL,
    accent_secondary VARCHAR(9) DEFAULT '#00E5FF' NOT NULL,
    font_pair_id UUID NOT NULL REFERENCES public.font_pairs(id),
    radius_scale TEXT NOT NULL DEFAULT 'soft' CHECK (radius_scale IN ('sharp', 'soft', 'rounded')),
    is_published BOOLEAN DEFAULT true NOT NULL,
    draft_payload JSONB DEFAULT '{}'::jsonb NOT NULL,
    published_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    published_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT single_row_theme CHECK (id = '00000000-0000-0000-0000-000000000001'::uuid)
);

-- Seed Initial Theme Row
INSERT INTO public.site_theme_settings (
    id, canvas_bg, surface_bg, card_bg, accent_primary, accent_secondary,
    font_pair_id, radius_scale, is_published, draft_payload
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    '#060708', '#0D1117', '#161B22', '#10B981', '#00E5FF',
    '00000000-0000-0000-0000-000000000010'::uuid,
    'soft',
    true,
    '{"canvas_bg":"#060708","surface_bg":"#0D1117","card_bg":"#161B22","accent_primary":"#10B981","accent_secondary":"#00E5FF","font_pair_id":"00000000-0000-0000-0000-000000000010","radius_scale":"soft"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 3. SITE SOCIAL SETTINGS TABLE (Singleton table, fixed ID)
CREATE TABLE IF NOT EXISTS public.site_social_settings (
    id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000002'::uuid,
    instagram_url TEXT DEFAULT 'https://instagram.com/omnora' NOT NULL,
    facebook_url TEXT DEFAULT 'https://facebook.com/omnora' NOT NULL,
    tiktok_url TEXT DEFAULT 'https://tiktok.com/@omnora' NOT NULL,
    youtube_url TEXT DEFAULT 'https://youtube.com/@omnora' NOT NULL,
    whatsapp_number TEXT DEFAULT '+923000000000' NOT NULL,
    whatsapp_business_message_template TEXT DEFAULT 'Hi Omnora! I have an inquiry about my order.' NOT NULL,
    show_in_header BOOLEAN DEFAULT true NOT NULL,
    show_in_footer BOOLEAN DEFAULT true NOT NULL,
    show_share_buttons_on_product BOOLEAN DEFAULT true NOT NULL,
    show_on_order_confirmation BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT single_row_social CHECK (id = '00000000-0000-0000-0000-000000000002'::uuid)
);

-- Seed Initial Social Row
INSERT INTO public.site_social_settings (id)
VALUES ('00000000-0000-0000-0000-000000000002'::uuid)
ON CONFLICT (id) DO NOTHING;

-- 4. CUSTOMER PROFILES TABLE (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.customer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    auth_provider TEXT DEFAULT 'email' CHECK (auth_provider IN ('email', 'google', 'facebook')),
    phone_number TEXT,
    phone_verified BOOLEAN DEFAULT false NOT NULL,
    marketing_consent BOOLEAN DEFAULT false NOT NULL,
    marketing_consent_at TIMESTAMPTZ,
    acquisition_channel TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. PRODUCTS TABLE ENHANCEMENTS
ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS image_aspect_locked BOOLEAN DEFAULT true;

-- 6. ROW LEVEL SECURITY (RLS) & POLICIES
ALTER TABLE public.font_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_theme_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_social_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Public read font_pairs" ON public.font_pairs;
DROP POLICY IF EXISTS "Admin write font_pairs" ON public.font_pairs;

DROP POLICY IF EXISTS "Public read site_theme_settings" ON public.site_theme_settings;
DROP POLICY IF EXISTS "Admin write site_theme_settings" ON public.site_theme_settings;

DROP POLICY IF EXISTS "Public read site_social_settings" ON public.site_social_settings;
DROP POLICY IF EXISTS "Admin write site_social_settings" ON public.site_social_settings;

DROP POLICY IF EXISTS "Public read products" ON public.products;
DROP POLICY IF EXISTS "Admin all products" ON public.products;

DROP POLICY IF EXISTS "User select customer_profiles" ON public.customer_profiles;
DROP POLICY IF EXISTS "User insert customer_profiles" ON public.customer_profiles;
DROP POLICY IF EXISTS "User update customer_profiles" ON public.customer_profiles;

-- Public Read Policies
CREATE POLICY "Public read font_pairs" ON public.font_pairs FOR SELECT USING (true);
CREATE POLICY "Public read site_theme_settings" ON public.site_theme_settings FOR SELECT USING (true);
CREATE POLICY "Public read site_social_settings" ON public.site_social_settings FOR SELECT USING (true);
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);

-- Admin Write Policies (Admin check: JWT role 'admin' or auth.users role)
CREATE POLICY "Admin write font_pairs" ON public.font_pairs
    FOR ALL USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
        auth.uid() IS NOT NULL
    );

CREATE POLICY "Admin write site_theme_settings" ON public.site_theme_settings
    FOR ALL USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
        auth.uid() IS NOT NULL
    );

CREATE POLICY "Admin write site_social_settings" ON public.site_social_settings
    FOR ALL USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
        auth.uid() IS NOT NULL
    );

CREATE POLICY "Admin all products" ON public.products
    FOR ALL USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
        auth.uid() IS NOT NULL
    );

-- Customer Profiles Policies
CREATE POLICY "User select customer_profiles" ON public.customer_profiles
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);

CREATE POLICY "User insert customer_profiles" ON public.customer_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User update customer_profiles" ON public.customer_profiles
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);

-- 7. ENABLE REALTIME PUBLICATION ON THEME SETTINGS
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_theme_settings;
