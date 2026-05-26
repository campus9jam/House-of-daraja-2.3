import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Gavel, Clock, TrendingUp, ArrowUpRight, MessageSquare, Zap, ShieldCheck } from 'lucide-react';
import { Drop } from '../api/entities';

export default function LiveAuction() {
  const [auction, setAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState(0);
  const [isBidding, setIsBidding] = useState(false);
  const [messages] = useState([
    { user: "Curator_882",  text: "Truly a once-in-a-generation loom pattern." },
    { user: "Resident_012", text: "The symbolism match is undeniable." },
    { user: "Patron_X",     text: "Increasing threshold for the final window." }
  ]);

  useEffect(() => {
    Drop.filter({ status: 'live' })
      .then(drops => {
        if (drops.length > 0) {
          const d = drops[0];
          const currentBid = d.price || 50000;
          setAuction({
            ...d,
            currentBid,
            bidCount: d.units_sold || 3,
            remainingTime: '04:12:09',
            image: d.image || "https://i.imgur.com/7QFYTZJ.png"
          });
          setBidAmount(currentBid + 10000);
        } else {
          // Demo auction
          const demo = {
            title: "Ancestral Sahelian Kaftan",
            currentBid: 420000,
            bidCount: 12,
            remainingTime: '04:12:09',
            image: "https://i.imgur.com/7QFYTZJ.png"
          };
          setAuction(demo);
          setBidAmount(demo.currentBid + 10000);
        }
      })
      .catch(console.error);
  }, []);

  const handleBid = async () => {
    if (!auction) return;
    setIsBidding(true);
    await new Promise(r => setTimeout(r, 1200));
    setAuction(prev => ({ ...prev, currentBid: bidAmount, bidCount: prev.bidCount + 1 }));
    setBidAmount(b => b + 10000);
    alert('Consignment Accepted — Bid protocol ratified.');
    setIsBidding(false);
  };

  if (!auction) {
    return (
      <div className="min-h-screen bg-daraja-charcoal flex items-center justify-center">
        <div className="text-center space-y-4">
          <Gavel className="w-12 h-12 text-daraja-gold mx-auto animate-pulse" />
          <p className="mono-text text-daraja-text-muted text-[10px]">SYNCING_AUCTION_PROTOCOL...</p>
        </div>
      </div>
    );
  }

  const titleWords = (auction.title || '').split(' ');
  const lastWord = titleWords.pop();
  const restTitle = titleWords.join(' ');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-daraja-charcoal pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">

        {/* Gallery (62%) */}
        <div className="lg:col-span-8 space-y-12">
          <header className="space-y-4">
            <div className="flex items-center gap-3 text-daraja-gold mono-text text-[10px]">
              <Gavel className="w-4 h-4" /> <span>PRESTIGE_AUCTION_PROTOCOL v8.2</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-serif italic text-white tracking-tighter leading-none">
              {restTitle} <span className="text-daraja-gold not-italic">{lastWord}</span>
            </h1>
          </header>

          <div className="luxury-card aspect-[16/10] relative overflow-hidden group shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
            <img
              src={auction.image}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[10s]"
              alt={auction.title}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-daraja-charcoal via-transparent to-daraja-charcoal/20" />

            <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end">
              <div className="space-y-4">
                <p className="text-[10px] mono-text text-daraja-gold uppercase tracking-[0.4em]">PROVENANCE_SIGNALS</p>
                <div className="flex gap-4">
                  <div className="glass border border-white/10 px-6 py-4 space-y-1">
                    <p className="text-[8px] mono-text text-white/40">RARITY_SCORE</p>
                    <p className="text-xl font-mono text-white">96.4%</p>
                  </div>
                  <div className="glass border border-white/10 px-6 py-4 space-y-1">
                    <p className="text-[8px] mono-text text-white/40">HERITAGE_MATCH</p>
                    <p className="text-xl font-mono text-white">SAHEL_NORTH</p>
                  </div>
                </div>
              </div>
              <div className="text-right space-y-4">
                <p className="text-[10px] mono-text text-white/40 uppercase tracking-[0.4em]">CURRENT_BID</p>
                <p className="text-5xl md:text-7xl font-mono text-white font-black">₦{auction.currentBid.toLocaleString()}</p>
              </div>
            </div>

            <div className="absolute top-12 right-12 glass border border-white/10 p-6 flex flex-col items-center gap-2">
              <Clock className="w-6 h-6 text-daraja-gold animate-pulse" />
              <p className="text-xl font-mono text-white">{auction.remainingTime}</p>
              <p className="text-[8px] mono-text text-white/40 uppercase">CLOSING_WINDOW</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="luxury-card p-10 space-y-6">
              <div className="flex items-center gap-3 text-daraja-gold mono-text text-[10px]">
                <TrendingUp className="w-4 h-4" /> <span>BID_DYNAMICS</span>
              </div>
              <div className="space-y-4">
                {[
                  { k: 'VOLUME', v: `${auction.bidCount} BIDS` },
                  { k: 'MIN_INCREMENT', v: '₦10,000' },
                  { k: 'ACTIVE_NODES', v: '1,242' }
                ].map(({ k, v }) => (
                  <div key={k} className="flex justify-between text-[10px] mono-text text-white/40">
                    <span>{k}</span><span className="text-white">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="luxury-card p-10 col-span-2 space-y-6">
              <div className="flex items-center gap-3 text-daraja-gold mono-text text-[10px]">
                <Zap className="w-4 h-4" /> <span>ARCHIVAL_PROVENANCE_REPORT</span>
              </div>
              <p className="text-daraja-text-muted text-sm italic font-serif leading-relaxed">
                This artifact originates from the sedentary weaving clusters of the Niger bend. The symbolism embedded in the horizontal weft represent sovereign transitions in the Songhai lineage. Carbon-matched to early 20th-century looms.
              </p>
            </div>
          </div>
        </div>

        {/* Bid Panel (38%) */}
        <div className="lg:col-span-4 space-y-8">
          <div className="luxury-card p-10 space-y-12 bg-white/5 border-daraja-gold/10">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-serif text-white italic">Place Consignment</h3>
                <span className="text-[9px] mono-text text-daraja-gold">BALANCE: ₦4.2M</span>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-daraja-gold font-mono">₦</span>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={e => setBidAmount(Number(e.target.value))}
                    className="w-full bg-daraja-charcoal border border-white/10 p-6 pl-12 text-2xl font-mono text-white focus:border-daraja-gold outline-none"
                  />
                </div>
                <div className="flex gap-3">
                  {[10000, 50000, 100000].map(inc => (
                    <button
                      key={inc}
                      onClick={() => setBidAmount(auction.currentBid + inc)}
                      className="flex-1 py-3 border border-white/5 text-[9px] mono-text text-white/60 hover:border-daraja-gold hover:text-daraja-gold transition-all"
                    >
                      +{inc / 1000}k
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleBid}
                disabled={isBidding}
                className="w-full py-8 bg-daraja-gold text-daraja-charcoal font-black uppercase tracking-[0.5em] text-[11px] hover:bg-white transition-all shadow-[0_30px_60px_rgba(197,160,89,0.3)] flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {isBidding ? 'VERIFYING_DEPOSIT...' : 'RATIFY_BID_PROTOCOL'}
                <ArrowUpRight className="w-5 h-5" />
              </button>
            </div>

            <div className="pt-10 border-t border-white/5 space-y-6">
              <div className="flex items-center gap-3 text-white/40 mono-text text-[10px]">
                <MessageSquare className="w-4 h-4" /> <span>LIVE_CURATOR_CHAT</span>
              </div>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                {messages.map((msg, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-[9px] mono-text text-daraja-gold">{msg.user}</p>
                    <p className="text-xs text-white/70 italic font-serif">{msg.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 text-daraja-text-muted mono-text text-[9px] pt-4 border-t border-white/5">
              <ShieldCheck className="w-4 h-4 text-daraja-gold" />
              ESCROW_PROTECTED — OPAY_SECURED
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
