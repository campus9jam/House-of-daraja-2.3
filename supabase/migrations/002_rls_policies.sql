-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wallets        ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_events           ENABLE ROW LEVEL SECURITY;
ALTER TABLE atelier_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE atelier_orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultural_vault      ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_bids        ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_bid_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_chat        ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_votes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_activations  ENABLE ROW LEVEL SECURITY;

-- ── Helper function: get user role ─────────────────────────
CREATE OR REPLACE FUNCTION get_user_role(uid UUID)
RETURNS user_role LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE v_role user_role;
BEGIN
  SELECT role INTO v_role FROM profiles WHERE user_id = uid;
  RETURN COALESCE(v_role, 'user');
END;
$$;

CREATE OR REPLACE FUNCTION get_user_tier(uid UUID)
RETURNS prestige_tier LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE v_tier prestige_tier;
BEGIN
  SELECT prestige_tier INTO v_tier FROM profiles WHERE user_id = uid;
  RETURN COALESCE(v_tier, 'citizen');
END;
$$;

-- ── PROFILES ────────────────────────────────────────────────
-- Anyone can read public profiles
CREATE POLICY "profiles_read_public"   ON profiles FOR SELECT USING (true);
-- Users can only update their own profile
CREATE POLICY "profiles_update_own"    ON profiles FOR UPDATE USING (auth.uid() = user_id);
-- Only service role inserts (via trigger)
CREATE POLICY "profiles_insert_trigger" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── WALLETS ──────────────────────────────────────────────────
CREATE POLICY "wallet_read_own"     ON user_wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wallet_update_own"   ON user_wallets FOR UPDATE USING (auth.uid() = user_id);

-- ── XP EVENTS ────────────────────────────────────────────────
CREATE POLICY "xp_read_own"         ON xp_events FOR SELECT USING (auth.uid() = user_id);
-- Only system/admin can insert XP events
CREATE POLICY "xp_insert_admin"     ON xp_events FOR INSERT WITH CHECK (
  get_user_role(auth.uid()) IN ('admin', 'moderator')
);

-- ── ATELIER MEASUREMENTS ────────────────────────────────────
CREATE POLICY "measurements_own"    ON atelier_measurements FOR ALL USING (auth.uid() = user_id);

-- ── ATELIER ORDERS ───────────────────────────────────────────
-- Users see their own orders; artisans see orders assigned to them; admins see all
CREATE POLICY "orders_read" ON atelier_orders FOR SELECT USING (
  auth.uid() = user_id
  OR auth.uid() IN (SELECT user_id FROM atelier_artisans WHERE id = artisan_id)
  OR get_user_role(auth.uid()) IN ('admin', 'moderator')
);
CREATE POLICY "orders_insert_own"   ON atelier_orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_update_own"   ON atelier_orders FOR UPDATE USING (
  auth.uid() = user_id OR get_user_role(auth.uid()) IN ('admin', 'artisan')
);

-- ── CULTURAL VAULT ───────────────────────────────────────────
-- Private vault items only visible to owner; public ones visible to all
CREATE POLICY "vault_read" ON cultural_vault FOR SELECT USING (
  auth.uid() = user_id OR is_private = false
);
CREATE POLICY "vault_insert_own"    ON cultural_vault FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "vault_update_own"    ON cultural_vault FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "vault_delete_own"    ON cultural_vault FOR DELETE USING (auth.uid() = user_id);

-- ── AUCTIONS ─────────────────────────────────────────────────
-- Live/ended auctions visible to all; admins see all
CREATE POLICY "auctions_read_live"  ON auctions FOR SELECT USING (
  status IN ('live', 'ended', 'upcoming')
  OR auth.uid() = seller_id
  OR get_user_role(auth.uid()) IN ('admin')
);
CREATE POLICY "auctions_insert_curator" ON auctions FOR INSERT WITH CHECK (
  get_user_role(auth.uid()) IN ('admin', 'curator')
);
CREATE POLICY "auctions_update" ON auctions FOR UPDATE USING (
  auth.uid() = seller_id OR get_user_role(auth.uid()) = 'admin'
);

-- ── AUCTION BIDS ─────────────────────────────────────────────
-- All authenticated users can read bids; only own insert
CREATE POLICY "bids_read_all"       ON auction_bids FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "bids_insert_auth"    ON auction_bids FOR INSERT WITH CHECK (auth.uid() = bidder_id);

-- ── AUCTION CHAT ─────────────────────────────────────────────
CREATE POLICY "chat_read_all"       ON auction_chat FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "chat_insert_auth"    ON auction_chat FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── AUTO BID PROFILES ────────────────────────────────────────
CREATE POLICY "autobid_own"         ON auto_bid_profiles FOR ALL USING (auth.uid() = bidder_id);

-- ── MEDIA ────────────────────────────────────────────────────
CREATE POLICY "media_read_approved" ON media_items FOR SELECT USING (
  status = 'approved'
  OR get_user_role(auth.uid()) IN ('admin', 'moderator', 'curator')
);
CREATE POLICY "media_manage_admin"  ON media_items FOR ALL USING (
  get_user_role(auth.uid()) IN ('admin', 'moderator')
);

-- ── GOVERNANCE ───────────────────────────────────────────────
CREATE POLICY "proposals_read_all"  ON governance_proposals FOR SELECT USING (true);
CREATE POLICY "proposals_insert_curator" ON governance_proposals FOR INSERT WITH CHECK (
  get_user_role(auth.uid()) IN ('admin', 'curator') OR
  get_user_tier(auth.uid()) IN ('curator', 'vanguard', 'elite')
);
CREATE POLICY "votes_insert_own"    ON governance_votes FOR INSERT WITH CHECK (auth.uid() = voter_id);
CREATE POLICY "votes_read_own"      ON governance_votes FOR SELECT USING (auth.uid() = voter_id);

-- ── REWARDS ──────────────────────────────────────────────────
CREATE POLICY "rewards_own"         ON reward_activations FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- REALTIME PUBLICATIONS
-- Enable realtime for auction bidding and chat
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE auctions;
ALTER PUBLICATION supabase_realtime ADD TABLE auction_bids;
ALTER PUBLICATION supabase_realtime ADD TABLE auction_chat;
ALTER PUBLICATION supabase_realtime ADD TABLE user_wallets;
