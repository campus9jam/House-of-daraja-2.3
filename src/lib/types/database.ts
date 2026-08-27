export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];
export type PrestigeTier = 'citizen' | 'patron' | 'curator' | 'vanguard' | 'elite';
export type UserRole = 'user' | 'artisan' | 'curator' | 'admin' | 'moderator';
export type AuctionStatus = 'upcoming' | 'live' | 'ended' | 'cancelled';
export type OrderStatus = 'submitted' | 'quoted' | 'deposit_paid' | 'cutting' | 'sewing' | 'finishing' | 'quality_check' | 'ready' | 'shipped' | 'delivered' | 'cancelled';
export type Language = 'en' | 'ha' | 'yo' | 'ig' | 'fr' | 'ar';
export type Gender = 'female' | 'male';
export type GarmentType = 'dress' | 'skirt' | 'skate' | 'trouser' | 'shirt' | 'native' | 'jumpsuit' | 'other';
export type FitPreference = 'slim' | 'regular' | 'relaxed' | 'oversized';
export type BodyType = 'slim' | 'athletic' | 'regular' | 'full';

export interface HDProfile {
  id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  role: UserRole;
  prestige_tier: PrestigeTier;
  lee_balance: number;
  lee_lifetime_earned: number;
  lee_lifetime_spent: number;
  cultural_interests: string[];
  preferred_language: Language;
  created_at: string;
  updated_at: string;
}

export interface AtelierMeasurement {
  id: string;
  user_id: string;
  label: string;
  gender: Gender;
  garment_type: GarmentType;
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
  fit_preference: FitPreference;
  body_type: BodyType;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AtelierOrder {
  id: string;
  user_id: string;
  artisan_id?: string;
  measurement_profile_id?: string;
  gender: Gender;
  garment_type: GarmentType;
  occasion?: string;
  fabric?: string;
  color?: string;
  bust_chest?: number;
  waist?: number;
  hips?: number;
  shoulder?: number;
  sleeve_length?: number;
  inseam?: number;
  length?: number;
  neck?: number;
  thigh?: number;
  arm_length?: number;
  ankle?: number;
  body_type?: BodyType;
  fit_preference?: FitPreference;
  reference_images: string[];
  special_instructions?: string;
  ai_suggestions: Json;
  status: OrderStatus;
  estimated_delivery?: string;
  price_quote?: number;
  deposit_paid: number;
  serial_number: string;
  created_at: string;
  updated_at: string;
}

export interface AtelierArtisan {
  id: string;
  user_id: string;
  store_name: string;
  specialty: string[];
  location?: string;
  trust_score: number;
  portfolio_images: string[];
  price_range: { min: number; max: number };
  turnaround_days: number;
  is_verified: boolean;
  rating: number;
  orders_completed: number;
  created_at: string;
  updated_at: string;
}

export interface UserWallet {
  id: string;
  user_id: string;
  lee_balance: number;
  updated_at: string;
}

export interface LeeTransaction {
  id: string;
  user_id: string;
  type: 'earn' | 'spend' | 'refund' | 'bonus' | 'adjustment' | 'expiry';
  amount: number;
  balance_before: number;
  balance_after: number;
  event_type: string;
  reference_id?: string;
  description?: string;
  metadata: Json;
  created_at: string;
}

export interface Auction {
  id: string;
  title: string;
  description?: string;
  seller_id?: string;
  image_url?: string;
  gallery_urls: string[];
  starting_bid: number;
  current_bid: number;
  current_bidder_id?: string;
  bid_count: number;
  reserve_price?: number;
  status: AuctionStatus;
  start_time: string;
  end_time: string;
  category: 'fashion' | 'fabric' | 'digital' | 'artifact' | 'ceremonial';
  anti_snipe_extension: number;
  winner_id?: string;
  final_price?: number;
  created_at: string;
  updated_at: string;
}

export interface AuctionBid { id: string; auction_id: string; bidder_id: string; amount: number; is_auto: boolean; auto_max?: number; created_at: string; }
export interface Notification { id: string; user_id: string; type: string; title: string; body?: string; data: Json; is_read: boolean; created_at: string; }

export interface Database {
  public: {
    Tables: {
      profiles: { Row: HDProfile; Insert: Partial<HDProfile>; Update: Partial<HDProfile> };
      atelier_measurements: { Row: AtelierMeasurement; Insert: Partial<AtelierMeasurement>; Update: Partial<AtelierMeasurement> };
      atelier_orders: { Row: AtelierOrder; Insert: Partial<AtelierOrder>; Update: Partial<AtelierOrder> };
      atelier_artisans: { Row: AtelierArtisan; Insert: Partial<AtelierArtisan>; Update: Partial<AtelierArtisan> };
      user_wallets: { Row: UserWallet; Insert: Partial<UserWallet>; Update: Partial<UserWallet> };
      lee_transactions: { Row: LeeTransaction; Insert: Partial<LeeTransaction>; Update: Partial<LeeTransaction> };
      auctions: { Row: Auction; Insert: Partial<Auction>; Update: Partial<Auction> };
      auction_bids: { Row: AuctionBid; Insert: Partial<AuctionBid>; Update: Partial<AuctionBid> };
      notifications: { Row: Notification; Insert: Partial<Notification>; Update: Partial<Notification> };
    };
    Functions: {
      award_lee: { Args: { p_user_id: string; p_amount: number; p_event_type: string; p_reference_id?: string | null; p_description?: string | null; p_metadata?: Json }; Returns: UserWallet };
      place_auction_bid: { Args: { p_auction_id: string; p_amount: number }; Returns: AuctionBid };
    };
  };
}
