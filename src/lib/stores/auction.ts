import { writable, get } from 'svelte/store';
import { supabase } from '$lib/supabase';
import type { Auction, AuctionBid } from '$lib/types/database';
import { currentUser } from './auth';

export const liveAuction   = writable<Auction | null>(null);
export const auctionBids   = writable<AuctionBid[]>([]);
export const auctionChat   = writable<any[]>([]);
export const isBidding     = writable(false);
export const bidError      = writable<string | null>(null);

let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

// ── Subscribe to a live auction ─────────────────────────────
export async function subscribeToAuction(auctionId: string) {
  // Initial data fetch
  const [{ data: auction }, { data: bids }, { data: chat }] = await Promise.all([
    supabase.from('auctions').select('*').eq('id', auctionId).single(),
    supabase.from('auction_bids').select('*').eq('auction_id', auctionId).order('amount', { ascending: false }).limit(20),
    supabase.from('auction_chat').select('*, profiles(username, prestige_tier)').eq('auction_id', auctionId).order('created_at', { ascending: true }).limit(50),
  ]);
  if (auction) liveAuction.set(auction as Auction);
  if (bids)    auctionBids.set(bids as AuctionBid[]);
  if (chat)    auctionChat.set(chat);

  // Realtime subscription
  realtimeChannel = supabase
    .channel(`auction_${auctionId}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'auctions', filter: `id=eq.${auctionId}` },
      payload => liveAuction.set(payload.new as Auction))
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'auction_bids', filter: `auction_id=eq.${auctionId}` },
      payload => auctionBids.update(b => [payload.new as AuctionBid, ...b]))
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'auction_chat', filter: `auction_id=eq.${auctionId}` },
      payload => auctionChat.update(c => [...c, payload.new]))
    .subscribe();
}

export function unsubscribeAuction() {
  realtimeChannel?.unsubscribe();
  realtimeChannel = null;
}

// ── Place a bid ─────────────────────────────────────────────
export async function placeBid(auctionId: string, amount: number): Promise<{ success: boolean; error?: string }> {
  const user = get(currentUser);
  if (!user) return { success: false, error: 'Authentication required.' };

  const auction = get(liveAuction);
  if (!auction) return { success: false, error: 'Auction not found.' };
  if (auction.status !== 'live') return { success: false, error: 'Auction is not live.' };
  if (amount <= auction.current_bid) return { success: false, error: `Bid must exceed ₦${auction.current_bid.toLocaleString()}` };

  isBidding.set(true);
  bidError.set(null);

  const { error } = await supabase.from('auction_bids').insert({
    auction_id: auctionId,
    bidder_id: user.id,
    amount,
    is_auto: false,
  });

  isBidding.set(false);
  if (error) {
    bidError.set(error.message);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// ── Set auto-bid ────────────────────────────────────────────
export async function setAutoBid(auctionId: string, maxBid: number) {
  const user = get(currentUser);
  if (!user) return;
  await supabase.from('auto_bid_profiles').upsert({
    auction_id: auctionId,
    bidder_id: user.id,
    max_bid: maxBid,
    is_active: true,
  });
}

// ── Send chat message ───────────────────────────────────────
export async function sendChatMessage(auctionId: string, message: string) {
  const user = get(currentUser);
  if (!user || !message.trim()) return;
  await supabase.from('auction_chat').insert({ auction_id: auctionId, user_id: user.id, message });
}
