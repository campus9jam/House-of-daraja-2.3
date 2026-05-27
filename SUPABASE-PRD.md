# House of Daraja — Supabase Backend PRD
**Version:** 3.0 | **Date:** 2026-05-27 | **Authored by:** R2 Build Agent

---

## 1. ENVIRONMENT VARIABLES

Create a `.env` file in `hd-users-app/` root with these values:

```env
# Supabase (get from Project > Settings > API)
PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJ...YOUR_ANON_KEY

# OPay Payment Gateway
PUBLIC_OPAY_MERCHANT_ID=YOUR_OPAY_MERCHANT_ID
PUBLIC_OPAY_BASE_URL=https://api.opaycheckout.com

# Private (server-side only — Edge Functions)
OPAY_SECRET_KEY=YOUR_OPAY_SECRET_KEY
OPENROUTER_API_KEY=sk-or-v1-YOUR_KEY     # for Leema AI
YOUTUBE_API_KEY=YOUR_YOUTUBE_API_KEY       # for Media page RSS feed

# App config
PUBLIC_APP_NAME=House of Daraja
PUBLIC_APP_URL=https://houseofdaraja.com
```

---

## 2. DATABASE SCHEMA — FULL SQL MIGRATIONS

### Migration 001 — Core Schema

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- fuzzy search
CREATE EXTENSION IF NOT EXISTS "unaccent";  -- search normalisation

-- ============================================================
-- USERS (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT,
  username        TEXT UNIQUE,
  avatar_url      TEXT,
  bio             TEXT,
  phone           TEXT,
  preferred_lang  TEXT DEFAULT 'en' CHECK (preferred_lang IN ('en','ha','yo','ig','fr','ar')),
  currency        TEXT DEFAULT 'NGN',
  role            TEXT DEFAULT 'customer' CHECK (role IN ('customer','artisan','admin')),
  tier            TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze','silver','gold','obsidian')),
  xp_points       INTEGER DEFAULT 0,
  wallet_balance  NUMERIC(12,2) DEFAULT 0.00,
  is_verified     BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE public.products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE GENERATED ALWAYS AS (lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))) STORED,
  description     TEXT,
  price           NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  original_price  NUMERIC(12,2),
  category        TEXT NOT NULL CHECK (category IN ('clothing','accessories','art','fabric','jewelry','home')),
  sub_category    TEXT,
  images          TEXT[] DEFAULT '{}',
  sizes           TEXT[] DEFAULT '{}',
  stock           INTEGER DEFAULT 0 CHECK (stock >= 0),
  material        TEXT,
  origin          TEXT,
  tags            TEXT[] DEFAULT '{}',
  is_featured     BOOLEAN DEFAULT FALSE,
  status          TEXT DEFAULT 'draft' CHECK (status IN ('draft','active','archived')),
  views_count     INTEGER DEFAULT 0,
  orders_count    INTEGER DEFAULT 0,
  rating          NUMERIC(3,2) DEFAULT 0.00 CHECK (rating BETWEEN 0 AND 5),
  -- AI translations (JSONB keyed by lang code)
  translations    JSONB DEFAULT '{}'::JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX products_vendor_id_idx    ON public.products(vendor_id);
CREATE INDEX products_category_idx     ON public.products(category);
CREATE INDEX products_status_idx       ON public.products(status);
CREATE INDEX products_tags_idx         ON public.products USING GIN(tags);
CREATE INDEX products_translations_idx ON public.products USING GIN(translations);
CREATE INDEX products_search_idx       ON public.products USING GIN(to_tsvector('english', name || ' ' || COALESCE(description,'')));

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE public.orders (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  items             JSONB NOT NULL DEFAULT '[]'::JSONB,
  -- item shape: [{product_id, name, price, quantity, size, image, vendor_id}]
  subtotal          NUMERIC(12,2) NOT NULL,
  delivery_fee      NUMERIC(12,2) DEFAULT 0.00,
  total_amount      NUMERIC(12,2) NOT NULL,
  status            TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
  payment_status    TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','paid','failed','refunded')),
  payment_ref       TEXT,
  payment_method    TEXT CHECK (payment_method IN ('opay','wallet','card','bank_transfer')),
  shipping_address  JSONB,
  -- address shape: {name, phone, street, city, state, country}
  tracking_number   TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX orders_user_id_idx       ON public.orders(user_id);
CREATE INDEX orders_status_idx        ON public.orders(status);
CREATE INDEX orders_payment_ref_idx   ON public.orders(payment_ref);
CREATE INDEX orders_created_at_idx    ON public.orders(created_at DESC);

-- ============================================================
-- ATELIER ORDERS (Bespoke custom garments)
-- ============================================================
CREATE TABLE public.atelier_orders (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  product_id            UUID REFERENCES public.products(id) ON DELETE SET NULL,
  serial_number         TEXT UNIQUE DEFAULT 'HOD-' || to_char(NOW(),'YYMM') || '-' || floor(random()*9000+1000)::TEXT,
  -- Fabric & design choices
  fabric                TEXT,
  color                 TEXT,
  style_notes           TEXT,
  reference_images      TEXT[] DEFAULT '{}',
  -- Measurements (all in cm)
  bust_chest            NUMERIC(6,2),
  waist                 NUMERIC(6,2),
  hips                  NUMERIC(6,2),
  shoulder              NUMERIC(6,2),
  sleeve_length         NUMERIC(6,2),
  length                NUMERIC(6,2),
  inseam                NUMERIC(6,2),
  special_instructions  TEXT,
  -- Workflow
  status                TEXT DEFAULT 'quote_requested' CHECK (status IN (
    'quote_requested','quoted','deposit_paid','in_progress',
    'quality_check','shipped','delivered','cancelled'
  )),
  price_quote           NUMERIC(12,2),
  deposit_paid          NUMERIC(12,2) DEFAULT 0.00,
  estimated_delivery    DATE,
  assigned_artisan_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  artisan_notes         TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX atelier_orders_user_id_idx   ON public.atelier_orders(user_id);
CREATE INDEX atelier_orders_status_idx    ON public.atelier_orders(status);
CREATE INDEX atelier_orders_artisan_idx   ON public.atelier_orders(assigned_artisan_id);

-- ============================================================
-- DROPS (Limited-edition flash sales)
-- ============================================================
CREATE TABLE public.drops (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    UUID REFERENCES public.products(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  image         TEXT,
  drop_type     TEXT DEFAULT 'flash' CHECK (drop_type IN ('flash','auction','exclusive','preorder')),
  price         NUMERIC(12,2) NOT NULL,
  start_time    TIMESTAMPTZ NOT NULL,
  end_time      TIMESTAMPTZ NOT NULL,
  stock         INTEGER NOT NULL CHECK (stock >= 0),
  units_sold    INTEGER DEFAULT 0,
  status        TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','live','ended','sold_out')),
  minimum_tier  TEXT DEFAULT 'bronze' CHECK (minimum_tier IN ('bronze','silver','gold','obsidian')),
  is_featured   BOOLEAN DEFAULT FALSE,
  -- Translations
  translations  JSONB DEFAULT '{}'::JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  CHECK (end_time > start_time)
);

CREATE INDEX drops_status_idx     ON public.drops(status);
CREATE INDEX drops_start_time_idx ON public.drops(start_time);
CREATE INDEX drops_product_idx    ON public.drops(product_id);

-- ============================================================
-- AUCTIONS (Real-time bidding)
-- ============================================================
CREATE TABLE public.auctions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  drop_id         UUID REFERENCES public.drops(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES public.products(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  start_price     NUMERIC(12,2) NOT NULL,
  reserve_price   NUMERIC(12,2),
  current_bid     NUMERIC(12,2),
  current_bidder  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  bid_count       INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','live','ended','cancelled')),
  start_time      TIMESTAMPTZ NOT NULL,
  end_time        TIMESTAMPTZ NOT NULL,
  winner_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  final_price     NUMERIC(12,2),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.auction_bids (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id  UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  bidder_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount      NUMERIC(12,2) NOT NULL,
  is_winning  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX auction_bids_auction_id_idx ON public.auction_bids(auction_id);
CREATE INDEX auction_bids_bidder_id_idx  ON public.auction_bids(bidder_id);
CREATE INDEX auction_bids_amount_idx     ON public.auction_bids(amount DESC);

-- ============================================================
-- WISHLIST
-- ============================================================
CREATE TABLE public.wishlist_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX wishlist_user_id_idx    ON public.wishlist_items(user_id);
CREATE INDEX wishlist_product_id_idx ON public.wishlist_items(product_id);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE public.reviews (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id          UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id            UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  rating              INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment             TEXT,
  images              TEXT[] DEFAULT '{}',
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  helpful_count       INTEGER DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (product_id, user_id, order_id)
);

CREATE INDEX reviews_product_id_idx ON public.reviews(product_id);
CREATE INDEX reviews_user_id_idx    ON public.reviews(user_id);
CREATE INDEX reviews_rating_idx     ON public.reviews(rating);

-- ============================================================
-- VENDOR PROFILES
-- ============================================================
CREATE TABLE public.vendor_profiles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  store_name      TEXT UNIQUE NOT NULL,
  slug            TEXT UNIQUE,
  logo_url        TEXT,
  banner_url      TEXT,
  description     TEXT,
  specialization  TEXT[],    -- ['kente','adire','aso-oke','leather']
  location        TEXT,
  social_links    JSONB DEFAULT '{}'::JSONB,  -- {instagram, twitter, website}
  total_sales     INTEGER DEFAULT 0,
  total_revenue   NUMERIC(14,2) DEFAULT 0.00,
  products_count  INTEGER DEFAULT 0,
  rating          NUMERIC(3,2) DEFAULT 0.00,
  is_verified     BOOLEAN DEFAULT FALSE,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','active','suspended')),
  -- Translations
  translations    JSONB DEFAULT '{}'::JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX vendor_profiles_user_id_idx ON public.vendor_profiles(user_id);
CREATE INDEX vendor_profiles_status_idx  ON public.vendor_profiles(status);

-- ============================================================
-- HERITAGE POSTS (Editorial / cultural content)
-- ============================================================
CREATE TABLE public.heritage_posts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  slug          TEXT UNIQUE,
  content       TEXT NOT NULL,
  excerpt       TEXT,
  cover_image   TEXT,
  category      TEXT CHECK (category IN ('history','craft','fashion','ritual','music','food','travel')),
  tags          TEXT[] DEFAULT '{}',
  is_published  BOOLEAN DEFAULT FALSE,
  views_count   INTEGER DEFAULT 0,
  read_time_min INTEGER,
  -- Translations
  translations  JSONB DEFAULT '{}'::JSONB,
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX heritage_posts_category_idx    ON public.heritage_posts(category);
CREATE INDEX heritage_posts_published_idx   ON public.heritage_posts(is_published, published_at DESC);
CREATE INDEX heritage_posts_tags_idx        ON public.heritage_posts USING GIN(tags);
CREATE INDEX heritage_posts_search_idx      ON public.heritage_posts USING GIN(to_tsvector('english', title || ' ' || COALESCE(excerpt,'')));

-- ============================================================
-- WALLET TRANSACTIONS
-- ============================================================
CREATE TABLE public.wallet_transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('credit','debit','refund','reward','withdrawal')),
  amount          NUMERIC(12,2) NOT NULL,
  balance_before  NUMERIC(12,2) NOT NULL,
  balance_after   NUMERIC(12,2) NOT NULL,
  reference       TEXT,
  description     TEXT,
  status          TEXT DEFAULT 'completed' CHECK (status IN ('pending','completed','failed')),
  metadata        JSONB DEFAULT '{}'::JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX wallet_tx_user_id_idx    ON public.wallet_transactions(user_id);
CREATE INDEX wallet_tx_type_idx       ON public.wallet_transactions(type);
CREATE INDEX wallet_tx_created_at_idx ON public.wallet_transactions(created_at DESC);

-- ============================================================
-- XP & REWARDS (Prestige tier system)
-- ============================================================
CREATE TABLE public.xp_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL,  -- 'purchase','review','referral','atelier_order','login_streak'
  xp_amount   INTEGER NOT NULL,
  reference   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX xp_events_user_id_idx ON public.xp_events(user_id);
CREATE INDEX xp_events_type_idx    ON public.xp_events(event_type);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE public.notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,  -- 'order_update','drop_live','auction_bid','reward'
  title       TEXT NOT NULL,
  body        TEXT,
  data        JSONB DEFAULT '{}'::JSONB,
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX notifications_user_id_idx  ON public.notifications(user_id);
CREATE INDEX notifications_is_read_idx  ON public.notifications(user_id, is_read);
CREATE INDEX notifications_created_idx  ON public.notifications(created_at DESC);

-- ============================================================
-- MEDIA POSTS (Media Network / creator content)
-- ============================================================
CREATE TABLE public.media_posts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type          TEXT NOT NULL CHECK (type IN ('video','article','lookbook','reel')),
  title         TEXT NOT NULL,
  description   TEXT,
  thumbnail     TEXT,
  media_url     TEXT,  -- YouTube URL, Vimeo, or direct
  duration_sec  INTEGER,
  views_count   INTEGER DEFAULT 0,
  likes_count   INTEGER DEFAULT 0,
  is_published  BOOLEAN DEFAULT FALSE,
  tags          TEXT[] DEFAULT '{}',
  translations  JSONB DEFAULT '{}'::JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX media_posts_type_idx      ON public.media_posts(type);
CREATE INDEX media_posts_published_idx ON public.media_posts(is_published, created_at DESC);

-- ============================================================
-- AUTOMATIC updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ 
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles','products','orders','atelier_orders','drops','auctions',
    'vendor_profiles','heritage_posts','media_posts'
  ] LOOP
    EXECUTE format('
      CREATE TRIGGER trg_%s_updated_at
      BEFORE UPDATE ON public.%s
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
    ', t, t);
  END LOOP;
END $$;

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- PRODUCT RATING AUTO-UPDATE
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
  SET rating = (
    SELECT ROUND(AVG(rating)::NUMERIC, 2)
    FROM public.reviews
    WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
  )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_product_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();
```

---

### Migration 002 — Row Level Security (RLS)

```sql
-- Enable RLS on all user-data tables
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atelier_orders    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_events         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_bids      ENABLE ROW LEVEL SECURITY;

-- Public read-only tables (no RLS needed — use policies instead)
ALTER TABLE public.products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drops          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auctions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heritage_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_posts    ENABLE ROW LEVEL SECURITY;

-- ==================== PROFILES ====================
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR role = 'admin');

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ==================== PRODUCTS ====================
CREATE POLICY "products_select_active" ON public.products
  FOR SELECT USING (status = 'active' OR auth.uid() = vendor_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "products_insert_vendor" ON public.products
  FOR INSERT WITH CHECK (auth.uid() = vendor_id AND
    EXISTS (SELECT 1 FROM public.vendor_profiles WHERE user_id = auth.uid() AND status = 'active'));

CREATE POLICY "products_update_vendor" ON public.products
  FOR UPDATE USING (auth.uid() = vendor_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "products_delete_vendor" ON public.products
  FOR DELETE USING (auth.uid() = vendor_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ==================== ORDERS ====================
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "orders_insert_own" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "orders_update_own" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ==================== ATELIER ORDERS ====================
CREATE POLICY "atelier_select_own" ON public.atelier_orders
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = assigned_artisan_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','artisan')));

CREATE POLICY "atelier_insert_own" ON public.atelier_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "atelier_update_own" ON public.atelier_orders
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = assigned_artisan_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ==================== WISHLIST ====================
CREATE POLICY "wishlist_own" ON public.wishlist_items
  USING (auth.uid() = user_id);

-- ==================== REVIEWS ====================
CREATE POLICY "reviews_select_all" ON public.reviews
  FOR SELECT USING (TRUE);

CREATE POLICY "reviews_insert_own" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_update_own" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "reviews_delete_own" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ==================== DROPS / AUCTIONS ====================
CREATE POLICY "drops_select_all" ON public.drops
  FOR SELECT USING (status IN ('live','scheduled','ended') OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "drops_manage_admin" ON public.drops
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "auctions_select_all" ON public.auctions
  FOR SELECT USING (TRUE);

CREATE POLICY "auction_bids_select" ON public.auction_bids
  FOR SELECT USING (TRUE);

CREATE POLICY "auction_bids_insert" ON public.auction_bids
  FOR INSERT WITH CHECK (auth.uid() = bidder_id);

-- ==================== HERITAGE POSTS ====================
CREATE POLICY "heritage_select_published" ON public.heritage_posts
  FOR SELECT USING (is_published = TRUE OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "heritage_manage_admin" ON public.heritage_posts
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ==================== VENDOR PROFILES ====================
CREATE POLICY "vendor_select_active" ON public.vendor_profiles
  FOR SELECT USING (status = 'active' OR auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "vendor_update_own" ON public.vendor_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "vendor_insert_own" ON public.vendor_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==================== WALLET ====================
CREATE POLICY "wallet_tx_own" ON public.wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- ==================== NOTIFICATIONS ====================
CREATE POLICY "notifications_own" ON public.notifications
  USING (auth.uid() = user_id);

-- ==================== MEDIA POSTS ====================
CREATE POLICY "media_select_published" ON public.media_posts
  FOR SELECT USING (is_published = TRUE OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ==================== XP EVENTS ====================
CREATE POLICY "xp_events_own" ON public.xp_events
  FOR SELECT USING (auth.uid() = user_id);
```

---

### Migration 003 — Realtime & Storage

```sql
-- Enable Realtime on live-data tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.drops;
ALTER PUBLICATION supabase_realtime ADD TABLE public.auctions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_bids;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.atelier_orders;
```

**Storage Buckets to Create in Dashboard:**

| Bucket Name      | Public | Max File Size | Allowed MIME Types                    |
|------------------|--------|---------------|---------------------------------------|
| `products`       | ✅ Yes  | 10MB          | image/jpeg, image/png, image/webp     |
| `avatars`        | ✅ Yes  | 5MB           | image/jpeg, image/png, image/webp     |
| `atelier-styles` | ✅ Yes  | 15MB          | image/*, application/pdf              |
| `fabrics`        | ✅ Yes  | 10MB          | image/jpeg, image/png, image/webp     |
| `media`          | ✅ Yes  | 50MB          | image/*, video/mp4, video/webm        |

**Storage RLS Policies:**
```sql
-- avatars: users manage their own
CREATE POLICY "avatars_own" ON storage.objects FOR ALL
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- products: vendors manage their own product folder
CREATE POLICY "products_vendor_upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'products' AND 
    EXISTS (SELECT 1 FROM public.vendor_profiles WHERE user_id = auth.uid() AND status = 'active'));

CREATE POLICY "products_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

-- atelier-styles: user's own measurements/reference images
CREATE POLICY "atelier_own" ON storage.objects FOR ALL
  USING (bucket_id = 'atelier-styles' AND auth.uid()::text = (storage.foldername(name))[1]);

-- fabrics & media: public read, admin/artisan write
CREATE POLICY "fabrics_public_read" ON storage.objects FOR SELECT
  USING (bucket_id IN ('fabrics','media'));
```

---

## 3. EDGE FUNCTIONS

Deploy 3 Edge Functions from `hd-users-app/supabase/functions/`:

### 3a. `leema-ai` — AI Fashion Assistant
**Trigger:** HTTP POST  
**Path:** `/functions/v1/leema-ai`

```typescript
// supabase/functions/leema-ai/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  
  const { message, language = 'en', context = [] } = await req.json()
  
  const systemPrompt = `You are Leema, the AI luxury fashion assistant for House of Daraja — Africa's premier heritage fashion platform. 
You speak with elegance, warmth and cultural knowledge. You understand Hausa, Yoruba, Igbo, French, Arabic and English.
Current language: ${language}.
You help customers with: product discovery, atelier consultations, styling advice, cultural fabric knowledge, and order support.
Always maintain a luxury brand tone — never casual or slangy.`

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENROUTER_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        ...context,
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 600,
    })
  })
  
  const data = await response.json()
  return new Response(JSON.stringify({
    reply: data.choices?.[0]?.message?.content ?? 'Leema is unavailable right now.',
    usage: data.usage
  }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
})
```

### 3b. `award-xp` — Prestige Tier XP Engine
**Trigger:** HTTP POST (called from order/review completion)

```typescript
// XP Award table:
// purchase: 50 XP per ₦1000 spent
// review: 25 XP
// atelier_order: 200 XP
// referral: 150 XP
// login_streak_7d: 50 XP
// login_streak_30d: 200 XP

// Tier thresholds:
// Bronze:   0 – 499 XP
// Silver:   500 – 1999 XP
// Gold:     2000 – 4999 XP
// Obsidian: 5000+ XP
```

### 3c. `youtube-rss` — Media Network Feed
**Trigger:** HTTP GET  
**Path:** `/functions/v1/youtube-rss`  
Fetches YouTube playlist/channel RSS, parses to JSON, caches for 1h in Supabase table `media_posts`.

---

## 4. AUTHENTICATION SETUP

In Supabase Dashboard → **Authentication** → **Settings**:

| Setting                  | Value                                      |
|--------------------------|---------------------------------------------|
| Site URL                 | `https://houseofdaraja.com`                 |
| Redirect URLs            | `https://houseofdaraja.com/**`              |
|                          | `http://localhost:5173/**` (dev)            |
| JWT Expiry               | `3600` seconds (1 hour)                     |
| Refresh token rotation   | ✅ Enabled                                   |
| Email confirmation       | ✅ Required                                  |
| Phone auth               | ✅ Enable (OTP via Twilio for Nigeria)       |

**OAuth Providers to Enable:**
- Google (for social login)

**Email Templates to Customize:**
- Confirmation email — use HD black/gold branding
- Magic link — House of Daraja letterhead style
- Password reset — luxury editorial tone

---

## 5. SUPABASE CLIENT CONFIG (already in codebase)

```typescript
// src/lib/supabase.ts — already configured
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types/database'

export const supabase = createClient<Database>(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: { eventsPerSecond: 10 }
    }
  }
)
```

---

## 6. OPAY CHECKOUT INTEGRATION

**API Endpoints used:**

| Action          | Endpoint                                        | Method |
|-----------------|-------------------------------------------------|--------|
| Create order    | `/api/v1/international/payment/create`          | POST   |
| Verify payment  | `/api/v1/international/payment/query`           | POST   |
| Wallet balance  | `/api/v1/international/cashier/user/queryBalance` | POST |

**Headers required:**
```
MerchantId: YOUR_MERCHANT_ID
Authorization: Bearer {HMAC-SHA512 signature}
Content-Type: application/json
```

**Signature generation (in Edge Function):**
```typescript
const payload = JSON.stringify(requestBody)
const signature = await crypto.subtle.sign(
  'HMAC', 
  await crypto.subtle.importKey('raw', 
    new TextEncoder().encode(OPAY_SECRET_KEY), 
    { name: 'HMAC', hash: 'SHA-512' }, 
    false, ['sign']
  ),
  new TextEncoder().encode(payload)
)
```

**Webhook URL to register in OPay:**
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/opay-webhook
```

---

## 7. STEP-BY-STEP SETUP CHECKLIST

```
SUPABASE PROJECT SETUP
□ 1. Create new Supabase project at https://supabase.com/dashboard
□ 2. Region: choose closest to Nigeria (EU West London / Frankfurt recommended)
□ 3. Copy Project URL and anon key → paste into .env file

DATABASE
□ 4. Open SQL Editor → paste + run Migration 001 (core schema)
□ 5. Run Migration 002 (RLS policies)
□ 6. Run Migration 003 (realtime)

STORAGE
□ 7. Create 5 buckets: products, avatars, atelier-styles, fabrics, media
□ 8. Set each bucket to Public
□ 9. Apply storage RLS policies

AUTHENTICATION
□ 10. Set Site URL and Redirect URLs
□ 11. Enable Google OAuth (add Google Client ID + Secret)
□ 12. Enable Phone auth (add Twilio credentials)
□ 13. Customize email templates

EDGE FUNCTIONS
□ 14. Install Supabase CLI: npm install -g supabase
□ 15. supabase login
□ 16. supabase link --project-ref YOUR_PROJECT_REF
□ 17. supabase secrets set OPENROUTER_API_KEY=sk-or-v1-...
□ 18. supabase secrets set OPAY_SECRET_KEY=...
□ 19. supabase secrets set YOUTUBE_API_KEY=...
□ 20. supabase functions deploy leema-ai
□ 21. supabase functions deploy award-xp
□ 22. supabase functions deploy youtube-rss

VERCEL DEPLOYMENT
□ 23. Connect github.com/campus9jam/House-of-daraja-2.3 to Vercel
□ 24. Set Root Directory to: hd-users-app
□ 25. Framework Preset: Other (SvelteKit handles it)
□ 26. Add all env vars from .env to Vercel Environment Variables
□ 27. Set Build Command: npm run build
□ 28. Set Output Directory: build
□ 29. Deploy → assign custom domain houseofdaraja.com

OPAY
□ 30. Register merchant at merchant.opaycheckout.com
□ 31. Get Merchant ID and Secret Key
□ 32. Register webhook URL (Supabase Edge Function URL)
□ 33. Test with sandbox credentials first

SEED DATA
□ 34. Run the seeding script or use Supabase Table Editor to add:
      - 1 admin profile (set role = 'admin')
      - 3-5 products with images
      - 1-2 active drops
      - 3 heritage posts (is_published = true)
```

---

## 8. REALTIME SUBSCRIPTION PATTERNS

```typescript
// Auction bidding — live bid updates
const channel = supabase
  .channel('auction-bids')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'auction_bids',
    filter: `auction_id=eq.${auctionId}`
  }, (payload) => {
    currentBid = payload.new.amount
    bidCount++
  })
  .subscribe()

// Drop stock countdown
supabase.channel('drop-stock')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'drops',
    filter: `id=eq.${dropId}`
  }, (payload) => {
    stockRemaining = payload.new.stock - payload.new.units_sold
  })
  .subscribe()

// User notifications (bell icon)
supabase.channel('user-notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    notifications = [payload.new, ...notifications]
    unreadCount++
  })
  .subscribe()
```

---

## 9. XP TIER SYSTEM REFERENCE

| Tier     | XP Range   | Color  | Benefits                                     |
|----------|------------|--------|----------------------------------------------|
| Bronze   | 0–499      | #CD7F32 | Early access to drops                        |
| Silver   | 500–1999   | #C0C0C0 | 5% wallet cashback, exclusive collections    |
| Gold     | 2000–4999  | #C5A059 | 10% discount, priority atelier queue         |
| Obsidian | 5000+      | #1A1A1A | Free shipping, private sale access, 15% off  |

**XP Award Schedule:**

| Event              | XP       |
|--------------------|----------|
| Place order        | +50 per ₦1,000 spent |
| Complete review    | +25      |
| Atelier order      | +200     |
| Refer a friend     | +150     |
| 7-day login streak | +50      |
| 30-day streak      | +200     |
| First purchase     | +100     |
| Profile completion | +50      |

---

## 10. CULTURAL FEED PRIORITY LOGIC

```typescript
// In marketplace/shop pages — reorder products by language
function culturalSort(products: Product[], lang: string): Product[] {
  const priorityTags: Record<string, string[]> = {
    ha: ['northern', 'hausa', 'kano', 'kaduna', 'babariga', 'kaftan'],
    yo: ['yoruba', 'aso-oke', 'lagos', 'southwest', 'adire', 'gele'],
    ig: ['igbo', 'akwete', 'george', 'southeast', 'uli', 'chi'],
    fr: ['luxury', 'paris', 'couture', 'editorial'],
    ar: ['kaftan', 'abaya', 'modest', 'embroidered'],
    en: [] // no special priority — default sort by featured
  }
  const tags = priorityTags[lang] ?? []
  if (!tags.length) return products
  
  return [...products].sort((a, b) => {
    const aScore = a.tags?.filter(t => tags.includes(t)).length ?? 0
    const bScore = b.tags?.filter(t => tags.includes(t)).length ?? 0
    return bScore - aScore
  })
}
```

---

## 11. TRANSLATION SCHEMA (JSONB)

All `translations` columns follow this shape:
```json
{
  "ha": {
    "name": "Kayan Sawa na Zaki",
    "description": "Tufafi na musamman daga Arewacin Najeriya",
    "confidence": 0.95,
    "translated_at": "2026-05-27T00:00:00Z"
  },
  "yo": {
    "name": "Aṣọ Ìbejì Alásiri",
    "description": "Ẹwù ìdárayá tí a ṣe ní àwọn ọlọpàá",
    "confidence": 0.92,
    "translated_at": "2026-05-27T00:00:00Z"
  }
}
```

Translations auto-generated by `translateContent` Edge Function using OpenRouter/DeepSeek with HD brand voice constraints. Minimum confidence threshold: **0.80**.

---

*PRD generated by R2 Build Agent | House of Daraja v3.0*
