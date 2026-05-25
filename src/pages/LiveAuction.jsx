import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';

const MOCK_AUCTION = {
  id: 'auction-001',
  title: 'Sovereign Kaftan — One of One',
  description: 'A singular piece from the HD Heritage Collection. Hand-embroidered with 24k gold thread. Certificate of authenticity included.',
  image: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=800&q=90',
  currentBid: 185000,
  minBid: 190000,
  startBid: 50000,
  endTime: new Date(Date.now() + 3600000 * 2.5).toISOString(),
  totalBids: 23,
  status: 'live',
  escrowStatus: 'held',
};

const MOCK_BIDS = [
  { user: 'Sovereign_A****', amount: 185000, time: '14:23', isTop: true },
  { user: 'Patron_K****', amount: 180000, time: '14:21' },
  { user: 'Heritage_M****', amount: 175000, time: '14:18' },
  { user: 'Daraja_F****', amount: 165000, time: '14:12' },
  { user: 'Elite_R****', amount: 150000, time: '14:05' },
];

const MOCK_COMMENTS = [
  { user: 'Sovereign_A', text: 'This piece is extraordinary. Mine.', time: '14:23' },
  { user: 'Heritage_M', text: 'Absolutely breathtaking craftsmanship', time: '14:20' },
  { user: 'Daraja_F', text: 'The gold thread work is unreal 🔥', time: '14:15' },
  { user: 'Patron_K', text: 'Worth every naira', time: '14:10' },
];

export default function LiveAuction() {
  const { auctionId } = useParams();
  const [auction] = useState(MOCK_AUCTION);
  const [bids, setBids] = useState(MOCK_BIDS);
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [bidAmount, setBidAmount] = useState('');
  const [comment, setComment] = useState('');
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  const [autoBid, setAutoBid] = useState(false);
  const [maxAutoBid, setMaxAutoBid] = useState('');
  const [bidding, setBidding] = useState(false);
  const [bidSuccess, setBidSuccess] = useState(false);
  const commentsRef = useRef(null);

  useEffect(() => {
    const tick = () => {
      const diff = new Date(auction.endTime) - Date.now();
      if (diff <= 0) return;
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [auction.endTime]);

  useEffect(() => {
    commentsRef.current?.scrollTo({ top: commentsRef.current.scrollHeight, behavior: 'smooth' });
  }, [comments]);

  const placeBid = () => {
    const amt = parseInt(bidAmount);
    if (!amt || amt < auction.minBid) return;
    setBidding(true);
    setTimeout(() => {
      setBids(prev => [{ user: 'You', amount: amt, time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), isTop: true }, ...prev.map(b => ({ ...b, isTop: false }))]);
      setBidSuccess(true);
      setBidAmount('');
      setBidding(false);
      setTimeout(() => setBidSuccess(false), 3000);
    }, 1000);
  };

  const sendComment = () => {
    if (!comment.trim()) return;
    setComments(prev => [...prev, { user: 'You', text: comment.trim(), time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) }]);
    setComment('');
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Live banner */}
      <div className="bg-red-600/20 border-b border-red-600/30 py-2 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-red-400 text-xs uppercase tracking-[0.3em] font-bold">Live Auction</span>
          <span className="text-white/40 text-xs">· {auction.totalBids} bids · Escrow Active</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-16 py-12">
        {/* Back */}
        <Link to="/drops" className="text-white/30 text-xs uppercase tracking-[0.2em] hover:text-white transition-colors flex items-center gap-2 mb-8">
          ← Back to Drops
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left — product 62% */}
          <div className="lg:col-span-3 space-y-6">
            <div className="relative aspect-[4/3] overflow-hidden">
              <img src={auction.image} alt={auction.title} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 bg-red-500 text-white text-xs px-3 py-1 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Live
              </div>
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur px-4 py-2">
                <div className="text-white/60 text-[10px] uppercase tracking-[0.2em] mb-1">Ends In</div>
                <div className="text-white font-mono text-lg flex gap-1">
                  {[timeLeft.h, timeLeft.m, timeLeft.s].map((v, i) => (
                    <React.Fragment key={i}>
                      <span>{String(v).padStart(2, '0')}</span>
                      {i < 2 && <span className="text-[#C5A059]">:</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-serif text-white font-light mb-2">{auction.title}</h1>
              <p className="text-white/50 text-sm leading-relaxed">{auction.description}</p>
            </div>

            {/* Bid history */}
            <div>
              <div className="text-white/40 text-xs uppercase tracking-[0.3em] mb-4">Bid History ({bids.length})</div>
              <div className="space-y-2">
                {bids.map((bid, i) => (
                  <div key={i} className={`flex items-center gap-4 p-3 ${bid.isTop ? 'bg-[#C5A059]/10 border border-[#C5A059]/30' : 'bg-[#0E0E0E] border border-white/5'}`}>
                    {bid.isTop && <span className="text-[#C5A059] text-xs">👑</span>}
                    <span className="text-white/60 text-sm flex-1">{bid.user}</span>
                    <span className={`font-mono font-bold ${bid.isTop ? 'text-[#C5A059]' : 'text-white/70'}`}>
                      ₦{bid.amount.toLocaleString()}
                    </span>
                    <span className="text-white/30 text-xs">{bid.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — bidding 38% */}
          <div className="lg:col-span-2 space-y-5">
            {/* Current bid */}
            <div className="bg-[#0E0E0E] border border-[#C5A059]/20 p-6">
              <div className="text-[#C5A059] text-xs uppercase tracking-[0.3em] mb-1">Current Bid</div>
              <div className="text-white font-serif text-4xl font-light">₦{auction.currentBid.toLocaleString()}</div>
              <div className="text-white/30 text-xs mt-2">Minimum next bid: ₦{auction.minBid.toLocaleString()}</div>
              <div className="text-amber-400 text-xs mt-1">◈ Funds held in escrow until close</div>
            </div>

            {/* Place bid */}
            {bidSuccess && (
              <div className="bg-green-400/10 border border-green-400/20 text-green-400 text-sm p-4 text-center">
                ✓ Bid placed successfully — funds in escrow
              </div>
            )}
            <div className="bg-[#0E0E0E] border border-white/10 p-6 space-y-4">
              <div className="text-white/40 text-xs uppercase tracking-[0.3em]">Place Your Bid</div>
              <input
                type="number"
                value={bidAmount}
                onChange={e => setBidAmount(e.target.value)}
                placeholder={`Min ₦${auction.minBid.toLocaleString()}`}
                className="w-full bg-[#050505] border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059] placeholder-white/20"
              />
              <div className="flex gap-2">
                {[auction.minBid, auction.minBid + 5000, auction.minBid + 10000].map(amt => (
                  <button key={amt} onClick={() => setBidAmount(amt.toString())}
                    className="flex-1 border border-white/10 text-white/50 py-2 text-xs hover:border-[#C5A059]/40 hover:text-[#C5A059] transition-all"
                  >₦{(amt/1000).toFixed(0)}k</button>
                ))}
              </div>
              <button onClick={placeBid} disabled={bidding || !bidAmount}
                className="w-full bg-[#C5A059] text-black py-4 text-sm uppercase tracking-[0.3em] font-bold hover:bg-white transition-colors disabled:opacity-40"
              >
                {bidding ? 'Placing Bid...' : 'Place Bid'}
              </button>
            </div>

            {/* Auto-bid */}
            <div className="bg-[#0E0E0E] border border-white/5 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-white/60 text-sm">Auto-Bid</div>
                <button onClick={() => setAutoBid(v => !v)}
                  className={`w-10 h-5 rounded-full transition-all relative ${autoBid ? 'bg-[#C5A059]' : 'bg-white/20'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${autoBid ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
              {autoBid && (
                <input
                  type="number"
                  value={maxAutoBid}
                  onChange={e => setMaxAutoBid(e.target.value)}
                  placeholder="Max auto-bid amount (₦)"
                  className="w-full bg-[#050505] border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-[#C5A059] placeholder-white/20"
                />
              )}
              <p className="text-white/30 text-xs mt-2">Auto-bid will place the minimum bid automatically on your behalf up to your max.</p>
            </div>

            {/* Live chat */}
            <div className="bg-[#0E0E0E] border border-white/5 p-5">
              <div className="text-white/40 text-xs uppercase tracking-[0.3em] mb-3">Live Chat</div>
              <div ref={commentsRef} className="space-y-2 max-h-40 overflow-y-auto mb-3">
                {comments.map((c, i) => (
                  <div key={i} className="text-xs">
                    <span className="text-[#C5A059] font-medium">{c.user}</span>
                    <span className="text-white/40 mx-1">·</span>
                    <span className="text-white/60">{c.text}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendComment()}
                  placeholder="Comment..."
                  className="flex-1 bg-[#050505] border border-white/10 text-white px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059] placeholder-white/20"
                />
                <button onClick={sendComment} className="bg-[#C5A059] text-black px-4 py-2 text-xs font-bold hover:bg-white transition-colors">→</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
