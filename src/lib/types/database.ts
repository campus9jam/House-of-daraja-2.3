export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// ── Prestige Tier ──────────────────────────────────────────
export type PrestigeTier = 'citizen' | 'patron' | 'curator' | 'vanguard' | 'elite';
export type UserRole     = 'user' | 'artisan' | 'curator' | 'admin' | 'moderator';
export type AuctionStatus = 'upcoming' | 'live' | 'ended' | 'cancelled';
export type OrderStatus  = 'submitted' | 'cutting' | 'sewing' | 'finishing' | 'ready' | 'shipped' | 'delivered';
export type MediaStatus  = 'pending' | 'reviewing' | 'approved' | 'rejected' | 'archived';
export type Language     = 'en' | 'ha' | 'yo' | 'ig' | 'fr' | 'ar';

// ── Profile ────────────────────────────────────────────────
export interface HDProfile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  role: UserRole;
  prestige_tier: PrestigeTier;
  xp: number;
  lee_balance: number;
  cultural_interests: string[];
  preferred_language: Language;
  preferred_languages: Language[];
  artisan_trust_score?: number;
  created_at: string;
  updated_at: string;
}

// ── Atelier ────────────────────────────────────────────────
export interface AtelierOrder {
  id: string;
  user_id: string;
  artisan_id?: string;
  occasion: string;
  outfit_type: string;
  fabric: string;
  color: string;
  special_instructions?: string;
  status: OrderStatus;
  estimated_delivery?: string;
  price_quote?: number;
  serial_number: string;
  ai_suggestions?: Json;
  created_at: string;
}

export interface AtelierMeasurement {
  id: string;
  user_id: string;
  label: string;
  chest?: number;
  waist?: number;
  hips?: number;
  shoulder?: number;
  sleeve?: number;
  inseam?: number;
  neck?: number;
  wrist?: number;
  thigh?: number;
  arm_length?: number;
  outfit_length?: number;
  ankle?: number;
  fit_preference: 'slim' | 'regular' | 'relaxed' | 'oversized';
  body_type: 'slim' | 'athletic' | 'regular' | 'full';
  is_default: boolean;
  created_at: string;
}

export interface AtelierArtisan {
  id: string;
  user_id: string;
  store_name: string;
  specialty: string[];
  location: string;
  trust_score: number;
  portfolio_images: string[];
  price_range: { min: number; max: number };
  turnaround_days: number;
  is_verified: boolean;
  rating: number;
  orders_completed: number;
  created_at: string;
}

// ── Cultural Vault ─────────────────────────────────────────
export interface CulturalVaultItem {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  type: 'outfit_ref' | 'tailoring_history' | 'ceremonial_wear' | 'heritage_style' | 'fabric_receipt' | 'collection';
  file_url: string;
  thumbnail_url?: string;
  tags: string[];
  is_private: boolean;
  metadata: Json;
  created_at: string;
}

// ── Auction ────────────────────────────────────────────────
export interface Auction {
  id: string;
  title: string;
  description: string;
  seller_id: string;
  image_url: string;
  gallery_urls: string[];
  starting_bid: number;
  current_bid: number;
  bid_count: number;
  reserve_price?: number;
  status: AuctionStatus;
  start_time: string;
  end_time: string;
  category: 'fashion' | 'fabric' | 'digital' | 'artifact' | 'ceremonial';
  provenance_report?: Json;
  anti_snipe_extension: number; // minutes
  created_at: string;
}

export interface AuctionBid {
  id: string;
  auction_id: string;
  bidder_id: string;
  amount: number;
  is_auto: boolean;
  auto_max?: number;
  created_at: string;
}

// ── LEE Prestige ───────────────────────────────────────────
export interface UserWallet {
  id: string;
  user_id: string;
  lee_balance: number;
  xp_total: number;
  xp_this_month: number;
  updated_at: string;
}

export interface XPEvent {
  id: string;
  user_id: string;
  event_type: string;
  xp_earned: number;
  lee_earned: number;
  reference_id?: string;
  created_at: string;
}

// ── Media ──────────────────────────────────────────────────
export interface MediaItem {
  id: string;
  youtube_id: string;
  title: string;
  description?: string;
  thumbnail_url: string;
  category: 'dandali' | 'zare_global' | 'co_creators' | 'heritage' | 'fashion';
  status: MediaStatus;
  published_at: string;
  view_count: number;
  ai_enrichment?: MediaAIEnrichment;
  translations: Partial<Record<Language, { title: string; description: string }>>;
  tags: string[];
  created_at: string;
}

export interface MediaAIEnrichment {
  cultural_summary: string;
  emotional_tone: string;
  region_tags: string[];
  fashion_category: string;
  artisan_relevance: number;
  commerce_recommendations: string[];
}

// ── Leema AI ───────────────────────────────────────────────
export interface LeemaSession {
  id: string;
  user_id: string;
  messages: LeemaMessage[];
  context: 'atelier' | 'auction' | 'media' | 'general' | 'cultural';
  created_at: string;
}

export interface LeemaMessage {
  role: 'user' | 'assistant';
  content: string;
  language: Language;
  timestamp: string;
}

// ── Database type map ──────────────────────────────────────
export interface Database {
  public: {
    Tables: {
      profiles:              { Row: HDProfile;           Insert: Partial<HDProfile>;           Update: Partial<HDProfile> };
      atelier_orders:        { Row: AtelierOrder;        Insert: Partial<AtelierOrder>;        Update: Partial<AtelierOrder> };
      atelier_measurements:  { Row: AtelierMeasurement;  Insert: Partial<AtelierMeasurement>;  Update: Partial<AtelierMeasurement> };
      atelier_artisans:      { Row: AtelierArtisan;      Insert: Partial<AtelierArtisan>;      Update: Partial<AtelierArtisan> };
      cultural_vault:        { Row: CulturalVaultItem;   Insert: Partial<CulturalVaultItem>;   Update: Partial<CulturalVaultItem> };
      auctions:              { Row: Auction;             Insert: Partial<Auction>;             Update: Partial<Auction> };
      auction_bids:          { Row: AuctionBid;          Insert: Partial<AuctionBid>;          Update: Partial<AuctionBid> };
      user_wallets:          { Row: UserWallet;          Insert: Partial<UserWallet>;          Update: Partial<UserWallet> };
      xp_events:             { Row: XPEvent;             Insert: Partial<XPEvent>;             Update: Partial<XPEvent> };
      media_items:           { Row: MediaItem;           Insert: Partial<MediaItem>;           Update: Partial<MediaItem> };
    };
  };
}
