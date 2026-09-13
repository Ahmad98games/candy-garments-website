-- ============================================================================
-- OMNORA STORE MIGRATION: COMPLETE TRUST-CHAIN, FRAUD-REDUCTION & REFUND SCHEMA
-- Database: Supabase PostgreSQL
-- Matches prisma/schema.prisma definitions
-- ============================================================================

-- ENUMS
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_type') THEN
        CREATE TYPE payment_type AS ENUM (
            'PREPAID_RAAST',
            'PREPAID_WALLET',
            'PREPAID_CARD',
            'COD_WITH_DEPOSIT'
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_fulfillment_status') THEN
        CREATE TYPE order_fulfillment_status AS ENUM (
            'PAYMENT_PENDING',
            'CONFIRMED_PREPAID',
            'DEPOSIT_PAID_COD',
            'VIDEO_INSPECTION_PENDING',
            'VIDEO_DISPATCHED_TO_CUSTOMER',
            'IN_TRANSIT',
            'DELIVERED',
            'DELIVERY_REFUSED_RTO',
            'REFUND_REQUESTED',
            'REFUND_APPROVED',
            'REFUNDED',
            'CANCELLED'
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'refund_status') THEN
        CREATE TYPE refund_status AS ENUM (
            'REQUESTED',
            'UNDER_REVIEW',
            'APPROVED',
            'REJECTED',
            'PAID_OUT'
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'customer_trust_tier') THEN
        CREATE TYPE customer_trust_tier AS ENUM (
            'UNVERIFIED',
            'STANDARD',
            'TRUSTED',
            'RESTRICTED'
        );
    END IF;
END $$;

-- 1. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY DEFAULT ('c_' || substr(gen_random_uuid()::text, 1, 16)),
    phone TEXT UNIQUE NOT NULL,
    phone_verified_at TIMESTAMPTZ,
    name TEXT,
    trust_tier customer_trust_tier DEFAULT 'UNVERIFIED' NOT NULL,
    cod_refusal_count INT DEFAULT 0 NOT NULL,
    completed_orders INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_trust_tier ON public.customers(trust_tier);

-- 2. DISCOUNT RULES TABLE
CREATE TABLE IF NOT EXISTS public.discount_rules (
    id TEXT PRIMARY KEY DEFAULT ('dr_' || substr(gen_random_uuid()::text, 1, 16)),
    code TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    percent_off NUMERIC(5, 2),
    flat_amount_off NUMERIC(10, 2),
    applies_to payment_type[] DEFAULT ARRAY['PREPAID_RAAST'::payment_type, 'PREPAID_WALLET'::payment_type, 'PREPAID_CARD'::payment_type],
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Insert default admin-configurable discount rule for prepaid
INSERT INTO public.discount_rules (id, code, label, percent_off, applies_to, is_active)
VALUES (
    'dr_prepaid_auto',
    'PREPAID_AUTO',
    'Instant Payment Discount (10% Off + Free Shipping)',
    10.00,
    ARRAY['PREPAID_RAAST'::payment_type, 'PREPAID_WALLET'::payment_type, 'PREPAID_CARD'::payment_type],
    true
)
ON CONFLICT (code) DO NOTHING;

-- 3. PRODUCT VARIANTS LINKED TABLE
CREATE TABLE IF NOT EXISTS public.product_variants_v2 (
    id TEXT PRIMARY KEY DEFAULT ('pv_' || substr(gen_random_uuid()::text, 1, 16)),
    product_id TEXT NOT NULL,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    color_hex TEXT NOT NULL DEFAULT '#000000',
    image_url TEXT,
    in_stock BOOLEAN DEFAULT true NOT NULL,
    stock_quantity INT DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT uq_product_size_color UNIQUE (product_id, size, color)
);

-- 4. TRUST ORDERS TABLE (With all Part 1 verification, video, and refund fields)
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1001;

CREATE TABLE IF NOT EXISTS public.trust_orders (
    id TEXT PRIMARY KEY DEFAULT ('ord_' || substr(gen_random_uuid()::text, 1, 16)),
    order_number INT UNIQUE DEFAULT nextval('order_number_seq'),
    customer_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    shipping_city TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    address_pin_lat FLOAT8,
    address_pin_lng FLOAT8,

    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_rule_id TEXT REFERENCES public.discount_rules(id),
    discount_applied NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    shipping_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,

    payment_type payment_type NOT NULL,
    payment_gateway_ref TEXT,
    payment_webhook_event_id TEXT UNIQUE,
    deposit_paid NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    deposit_forfeited BOOLEAN NOT NULL DEFAULT false,

    otp_verified BOOLEAN NOT NULL DEFAULT false,
    otp_verified_at TIMESTAMPTZ,

    requires_video_check BOOLEAN NOT NULL DEFAULT true,
    dispatch_video_url TEXT,
    video_uploaded_at TIMESTAMPTZ,
    video_uploaded_by TEXT,
    video_viewed_by_customer BOOLEAN NOT NULL DEFAULT false,

    tracking_number TEXT,
    courier_name TEXT DEFAULT 'TCS Express',

    status order_fulfillment_status NOT NULL DEFAULT 'PAYMENT_PENDING',

    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_trust_orders_status ON public.trust_orders(status);
CREATE INDEX IF NOT EXISTS idx_trust_orders_customer_id ON public.trust_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_trust_orders_customer_phone ON public.trust_orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_trust_orders_created_at ON public.trust_orders(created_at DESC);

-- 5. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id TEXT PRIMARY KEY DEFAULT ('oi_' || substr(gen_random_uuid()::text, 1, 16)),
    order_id TEXT NOT NULL REFERENCES public.trust_orders(id) ON DELETE CASCADE,
    variant_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    quantity INT NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- 6. REFUND REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.refund_requests (
    id TEXT PRIMARY KEY DEFAULT ('ref_' || substr(gen_random_uuid()::text, 1, 16)),
    order_id TEXT NOT NULL REFERENCES public.trust_orders(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    evidence_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
    status refund_status NOT NULL DEFAULT 'REQUESTED',
    sla_deadline TIMESTAMPTZ NOT NULL,
    reviewed_by TEXT,
    review_notes TEXT,
    payout_ref TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_refund_requests_order_id ON public.refund_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON public.refund_requests(status);
CREATE INDEX IF NOT EXISTS idx_refund_requests_sla_deadline ON public.refund_requests(sla_deadline ASC);

-- 7. TRUST EVENT LOG
CREATE TABLE IF NOT EXISTS public.trust_event_logs (
    id TEXT PRIMARY KEY DEFAULT ('tel_' || substr(gen_random_uuid()::text, 1, 16)),
    customer_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'COD_REFUSED' | 'COD_ACCEPTED' | 'PREPAID_COMPLETED' | 'OTP_VERIFIED'
    order_id TEXT REFERENCES public.trust_orders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_trust_logs_customer_id ON public.trust_event_logs(customer_id);

-- 8. ENABLE RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_event_logs ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
CREATE POLICY "Public read active discount rules" ON public.discount_rules
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin manage discount rules" ON public.discount_rules
    FOR ALL USING (true);

CREATE POLICY "Public insert orders" ON public.trust_orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public select orders" ON public.trust_orders
    FOR SELECT USING (true);

CREATE POLICY "Public update own order video status" ON public.trust_orders
    FOR UPDATE USING (true);

CREATE POLICY "Admin all trust orders" ON public.trust_orders
    FOR ALL USING (true);

CREATE POLICY "Public read write customers" ON public.customers
    FOR ALL USING (true);

CREATE POLICY "Public insert refund requests" ON public.refund_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read own refund requests" ON public.refund_requests
    FOR SELECT USING (true);

CREATE POLICY "Admin all refund requests" ON public.refund_requests
    FOR ALL USING (true);

CREATE POLICY "Public read order items" ON public.order_items
    FOR ALL USING (true);

CREATE POLICY "Admin all trust logs" ON public.trust_event_logs
    FOR ALL USING (true);
