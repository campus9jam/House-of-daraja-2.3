-- ============================================================
-- HOUSE OF DARAJA — Full Schema Migration v1.0
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- fuzzy text search
CREATE EXTENSION IF NOT EXISTS "unaccent"; -- multilingual search

-- ── Enums ──────────────────────────────────────────────────
CREATE TYPE prestige_tier  AS ENUM ('citizen','patron','curator','vanguard','elite');
CREATE TYPE user_role      AS ENUM ('user','artisan','curator','admin','moderator');
CREATE TYPE auction_status AS ENUM ('upcoming','live','ended','cancelled');
CREATE TYPE order_status   AS ENUM ('submitted','cutting','sewing','finishing','ready','shipped','delivered');
CREATE TYPE media_status   AS ENUM ('pending','reviewing','approved','rejected','archived');
CREATE TYPE vault_type     AS ENUM ('outfit_ref','tailoring_history','ceremonial_wear','heritage_style','fabric_receipt','collection');
CREATE TYPE lang_code      AS ENUM ('en','ha','yo','ig','fr','ar');

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE profiles (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  username            TEXT UNIQUE NOT NULL,
  display_name        TEXT NOT NULL,
  avatar_url          TEXT,
  bio                 TEXT,
  role                user_role DEFAULT 'user',
  prestige_tier       prestige_tier DEFAULT 'citizen',
  xp                  INTEGER DEFAULT 0,
  lee_balance         NUMERIC(18,4) DEFAULT 0,
  cultural_interests  TEXT[] DEFAULT '{}',
  preferred_language  lang_code DEFAULT 'en',
  preferred_languages lang_code[] DEFAULT '{en}',
  artisan_trust_score NUMERIC(3,2) DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── Trigger: auto-create profile on signup ─────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (user_id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1) || '_' || substr(NEW.id::text, 1, 4)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Trigger: updated_at ────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- WALLETS & XP
-- ============================================================
CREATE TABLE user_wallets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  lee_balance     NUMERIC(18,4) DEFAULT 0,
  xp_total        INTEGER DEFAULT 0,
  xp_this_month   INTEGER DEFAULT 0,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create wallet with profile
CREATE OR REPLACE FUNCTION handle_new_user_wallet()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO user_wallets (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_profile_created AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_wallet();

CREATE TABLE xp_events (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type    TEXT NOT NULL,
  xp_earned     INTEGER DEFAULT 0,
  lee_earned    NUMERIC(18,4) DEFAULT 0,
  reference_id  UUID,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE prestige_tiers (
  tier          prestige_tier PRIMARY KEY,
  min_xp        INTEGER NOT NULL,
  label         TEXT NOT NULL,
  benefits      JSONB DEFAULT '{}',
  color         TEXT NOT NULL
);

INSERT INTO prestige_tiers VALUES
  ('citizen',  0,    'Citizen',      '{"delivery_discount":0}',  '#FFFFFF'),
  ('patron',   500,  'Patron',       '{"delivery_discount":5}',  '#F59E0B'),
  ('curator',  2000, 'Curator',      '{"delivery_discount":10,"auction_priority":true}', '#C5A059'),
  ('vanguard', 7500, 'Vanguard',     '{"delivery_discount":15,"auction_priority":true,"artisan_grants":true}', '#A855F7'),
  ('elite',    25000,'Daraja Elite', '{"delivery_discount":25,"auction_priority":true,"artisan_grants":true,"governance_access":true}', '#C5A059');

-- Auto XP prestige upgrade
CREATE OR REPLACE FUNCTION update_prestige_on_xp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_tier prestige_tier;
BEGIN
  SELECT tier INTO v_tier FROM prestige_tiers
  WHERE min_xp <= NEW.xp ORDER BY min_xp DESC LIMIT 1;
  UPDATE profiles SET prestige_tier = v_tier, xp = NEW.xp_total WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_xp_update AFTER UPDATE OF xp_total ON user_wallets
  FOR EACH ROW EXECUTE FUNCTION update_prestige_on_xp();

-- ============================================================
-- ATELIER
-- ============================================================
CREATE TABLE atelier_artisans (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  store_name         TEXT NOT NULL,
  specialty          TEXT[] DEFAULT '{}',
  location           TEXT,
  trust_score        NUMERIC(3,2) DEFAULT 0,
  portfolio_images   TEXT[] DEFAULT '{}',
  price_range        JSONB DEFAULT '{"min":5000,"max":500000}',
  turnaround_days    INTEGER DEFAULT 14,
  is_verified        BOOLEAN DEFAULT false,
  rating             NUMERIC(2,1) DEFAULT 0,
  orders_completed   INTEGER DEFAULT 0,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE atelier_measurements (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label           TEXT DEFAULT 'Default',
  chest           NUMERIC(5,1),
  waist           NUMERIC(5,1),
  hips            NUMERIC(5,1),
  shoulder        NUMERIC(5,1),
  sleeve          NUMERIC(5,1),
  inseam          NUMERIC(5,1),
  neck            NUMERIC(5,1),
  wrist           NUMERIC(5,1),
  thigh           NUMERIC(5,1),
  arm_length      NUMERIC(5,1),
  outfit_length   NUMERIC(5,1),
  ankle           NUMERIC(5,1),
  fit_preference  TEXT DEFAULT 'regular' CHECK (fit_preference IN ('slim','regular','relaxed','oversized')),
  body_type       TEXT DEFAULT 'regular' CHECK (body_type IN ('slim','athletic','regular','full')),
  is_default      BOOLEAN DEFAULT false,
  ai_notes        TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE atelier_orders (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  artisan_id            UUID REFERENCES atelier_artisans(id) ON DELETE SET NULL,
  measurement_id        UUID REFERENCES atelier_measurements(id),
  serial_number         TEXT UNIQUE NOT NULL DEFAULT 'HD_ATEL_' || substr(md5(random()::text), 1, 8),
  occasion              TEXT NOT NULL,
  outfit_type           TEXT NOT NULL,
  fabric                TEXT,
  color                 TEXT,
  embroidery_notes      TEXT,
  special_instructions  TEXT,
  reference_images      TEXT[] DEFAULT '{}',
  status                order_status DEFAULT 'submitted',
  estimated_delivery    DATE,
  price_quote           NUMERIC(12,2),
  ai_suggestions        JSONB DEFAULT '{}',
  payment_status        TEXT DEFAULT 'pending',
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE atelier_styles (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  outfit_type  TEXT NOT NULL,
  region       TEXT,
  description  TEXT,
  image_url    TEXT,
  tags         TEXT[] DEFAULT '{}',
  ai_profile   JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Seed outfit styles
INSERT INTO atelier_styles (name, outfit_type, region, description, tags) VALUES
  ('Grand Agbada',     'Agbada',    'West Africa', 'Three-piece flowing gown — prestige ceremonial wear', ARRAY['ceremonial','yoruba','prestige']),
  ('Hausa Kaftan',     'Kaftan',    'North Africa', 'Embroidered kaftan with Aso-Oke detail', ARRAY['wedding','hausa','embroidered']),
  ('Senator Two-Piece','Senator',   'Nigeria',      'Structured senator suit with damask fabric', ARRAY['corporate','modern','senator']),
  ('Grand Boubou',     'Boubou',    'Sahel',        'Full flowing boubou with gold trim', ARRAY['sahel','ceremonial','mali']),
  ('Dashiki Fusion',   'Dashiki',   'Pan-African',  'Modern dashiki with afro-fusion cut', ARRAY['casual','modern','colorful']),
  ('Isiagu Heritage',  'Isiagu',    'Igbo',         'Tiger-patterned prestige wear for titled men', ARRAY['igbo','titled','ceremonial']);

-- ============================================================
-- CULTURAL VAULT
-- ============================================================
CREATE TABLE cultural_vault (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title          TEXT NOT NULL,
  description    TEXT,
  type           vault_type NOT NULL,
  file_url       TEXT NOT NULL,
  thumbnail_url  TEXT,
  tags           TEXT[] DEFAULT '{}',
  is_private     BOOLEAN DEFAULT true,
  metadata       JSONB DEFAULT '{}',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUCTIONS
-- ============================================================
CREATE TABLE auctions (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title                    TEXT NOT NULL,
  description              TEXT,
  seller_id                UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  image_url                TEXT NOT NULL,
  gallery_urls             TEXT[] DEFAULT '{}',
  starting_bid             NUMERIC(12,2) NOT NULL,
  current_bid              NUMERIC(12,2) NOT NULL,
  bid_count                INTEGER DEFAULT 0,
  reserve_price            NUMERIC(12,2),
  status                   auction_status DEFAULT 'upcoming',
  start_time               TIMESTAMPTZ NOT NULL,
  end_time                 TIMESTAMPTZ NOT NULL,
  category                 TEXT DEFAULT 'fashion',
  provenance_report        JSONB DEFAULT '{}',
  anti_snipe_extension     INTEGER DEFAULT 2,
  min_prestige_tier        prestige_tier DEFAULT 'citizen',
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE auction_bids (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id  UUID REFERENCES auctions(id) ON DELETE CASCADE NOT NULL,
  bidder_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  amount      NUMERIC(12,2) NOT NULL,
  is_auto     BOOLEAN DEFAULT false,
  auto_max    NUMERIC(12,2),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE auto_bid_profiles (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id  UUID REFERENCES auctions(id) ON DELETE CASCADE NOT NULL,
  bidder_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  max_bid     NUMERIC(12,2) NOT NULL,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(auction_id, bidder_id)
);

CREATE TABLE auction_chat (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id  UUID REFERENCES auctions(id) ON DELETE CASCADE NOT NULL,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Anti-snipe trigger ─────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_anti_snipe()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_auction auctions%ROWTYPE;
  v_window  INTERVAL;
BEGIN
  SELECT * INTO v_auction FROM auctions WHERE id = NEW.auction_id;
  v_window := (v_auction.anti_snipe_extension || ' minutes')::INTERVAL;
  
  -- If bid placed within anti_snipe window of end_time, extend
  IF NOW() > (v_auction.end_time - v_window) AND v_auction.status = 'live' THEN
    UPDATE auctions SET end_time = end_time + v_window WHERE id = NEW.auction_id;
  END IF;
  
  -- Update current bid
  UPDATE auctions SET current_bid = NEW.amount, bid_count = bid_count + 1
  WHERE id = NEW.auction_id AND NEW.amount > current_bid;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER auction_anti_snipe AFTER INSERT ON auction_bids
  FOR EACH ROW EXECUTE FUNCTION handle_anti_snipe();

-- ============================================================
-- MEDIA NETWORK
-- ============================================================
CREATE TABLE media_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  youtube_id      TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  thumbnail_url   TEXT,
  channel_id      TEXT,
  category        TEXT DEFAULT 'heritage',
  status          media_status DEFAULT 'pending',
  published_at    TIMESTAMPTZ,
  view_count      INTEGER DEFAULT 0,
  ai_enrichment   JSONB DEFAULT '{}',
  translations    JSONB DEFAULT '{}',
  tags            TEXT[] DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE media_translations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  media_id    UUID REFERENCES media_items(id) ON DELETE CASCADE,
  language    lang_code NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(media_id, language)
);

CREATE TABLE editorial_reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  media_id    UUID REFERENCES media_items(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id),
  status      media_status NOT NULL,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE media_recommendations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  media_id    UUID REFERENCES media_items(id) ON DELETE CASCADE,
  score       NUMERIC(3,2) DEFAULT 0,
  reason      TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- GOVERNANCE
-- ============================================================
CREATE TABLE governance_proposals (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  description  TEXT NOT NULL,
  proposer_id  UUID REFERENCES auth.users(id),
  status       TEXT DEFAULT 'active' CHECK (status IN ('draft','active','passed','rejected','archived')),
  votes_for    INTEGER DEFAULT 0,
  votes_against INTEGER DEFAULT 0,
  min_tier     prestige_tier DEFAULT 'patron',
  ends_at      TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE governance_votes (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id  UUID REFERENCES governance_proposals(id) ON DELETE CASCADE,
  voter_id     UUID REFERENCES auth.users(id),
  vote         TEXT CHECK (vote IN ('for','against','abstain')),
  weight       NUMERIC(4,2) DEFAULT 1.0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(proposal_id, voter_id)
);

-- ============================================================
-- REWARD ACTIVATIONS
-- ============================================================
CREATE TABLE reward_activations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_type   TEXT NOT NULL,
  cost_lee      NUMERIC(18,4) DEFAULT 0,
  cost_xp       INTEGER DEFAULT 0,
  is_active     BOOLEAN DEFAULT true,
  expires_at    TIMESTAMPTZ,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SEARCH INDEXES
-- ============================================================
CREATE INDEX idx_products_search  ON media_items USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_auctions_status  ON auctions(status, end_time);
CREATE INDEX idx_bids_auction     ON auction_bids(auction_id, amount DESC);
CREATE INDEX idx_vault_user       ON cultural_vault(user_id, created_at DESC);
CREATE INDEX idx_atelier_user     ON atelier_orders(user_id, created_at DESC);
CREATE INDEX idx_media_status     ON media_items(status, published_at DESC);
CREATE INDEX idx_xp_user_date     ON xp_events(user_id, created_at DESC);

-- ============================================================
-- AUDIT LOG
-- ============================================================
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID,
  action      TEXT NOT NULL,
  table_name  TEXT NOT NULL,
  record_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
