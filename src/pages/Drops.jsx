import React, { useState, useEffect } from 'react';
import { Drop } from '../api/entities';

function useCountdown(endTime) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0, expired: false });
  useEffect(() => {
    if (!endTime) return;
    const tick = () => {
      const diff = new Date(endTime) - Date.now();
      if (diff <= 0) { setTimeLeft({ h: 0, m: 0, s: 0, expired: true }); return; }
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
        expired: false,
      });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [endTime]);
  return timeLeft;
}

function DropCard({ drop }) {
  const time = useCountdown(drop.end_time);
  const pct = drop.stock > 0 ? Math.round((drop.units_sold / drop.stock) * 100) : 0;

  return (
    <div className={`relative overflow-hidden ${drop.is_featured ? 'md:col-span-2' : ''}`}>
      {/* Image — 62% */}
      <div className={`relative overflow-hidden ${drop.is_featured ? 'aspect-[16/9]' : 'aspect-[3/4]'}`}>
        <img
          src={drop.image || 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800'}
          alt={drop.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        {/* Status badge */}
        <div className="absolute top-4 left-4">
          {drop.status === 'live' && (
            <div className="flex items-center gap-2 bg-[#C5A059] text-black px-3 py-1 text-xs uppercase tracking-[0.2em] font-bold">
              <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
              Live Now
            </div>
          )}
          {drop.status === 'upcoming' && (
            <div className="bg-white/10 backdrop-blur text-white px-3 py-1 text-xs uppercase tracking-[0.2em]">
              Upcoming
            </div>
          )}
          {drop.status === 'ended' && (
            <div className="bg-white/10 backdrop-blur text-white/50 px-3 py-1 text-xs uppercase tracking-[0.2em]">
              Ended
            </div>
          )}
        </div>

        {drop.minimum_tier !== 'Citizen' && (
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur text-[#C5A059] text-xs px-3 py-1 border border-[#C5A059]/30 uppercase tracking-[0.2em]">
            {drop.minimum_tier}+
          </div>
        )}

        {/* Drop info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="text-[#C5A059] text-xs uppercase tracking-[0.3em] mb-2">{drop.drop_type} drop</div>
          <h3 className={`text-white font-serif font-light mb-4 ${drop.is_featured ? 'text-4xl' : 'text-2xl'}`}>
            {drop.name}
          </h3>

          {/* Countdown */}
          {drop.status === 'live' && !time.expired && (
            <div className="flex items-center gap-4 mb-4">
              {[
                { v: time.h, l: 'Hr' },
                { v: time.m, l: 'Min' },
                { v: time.s, l: 'Sec' },
              ].map(({ v, l }) => (
                <div key={l} className="text-center">
                  <div className="text-3xl font-mono font-bold text-[#C5A059] tabular-nums">
                    {String(v).padStart(2, '0')}
                  </div>
                  <div className="text-white/40 text-[10px] uppercase">{l}</div>
                </div>
              ))}
              <div className="text-white/40 text-xs ml-2">Remaining</div>
            </div>
          )}

          {/* Stock bar */}
          {drop.stock > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-white/50 mb-1">
                <span>{drop.units_sold} / {drop.stock} claimed</span>
                <span>{pct}%</span>
              </div>
              <div className="h-px bg-white/20">
                <div className="h-full bg-[#C5A059] transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-2xl text-white font-light">₦{drop.price?.toLocaleString()}</span>
            <button
              disabled={drop.status !== 'live' || time.expired}
              className={`px-8 py-3 text-xs uppercase tracking-[0.2em] font-bold transition-all ${
                drop.status === 'live' && !time.expired
                  ? 'bg-[#C5A059] text-black hover:bg-white'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              {drop.status === 'live' && !time.expired ? 'Join the Drop' :
               drop.status === 'upcoming' ? 'Notify Me' :
               'Ended'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Drops() {
  const [drops, setDrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('live');

  useEffect(() => {
    Drop.list().then(d => setDrops(d)).finally(() => setLoading(false));
  }, []);

  const filtered = drops.filter(d => {
    if (activeTab === 'live') return d.status === 'live';
    if (activeTab === 'upcoming') return d.status === 'upcoming';
    if (activeTab === 'ended') return d.status === 'ended' || d.status === 'sold_out';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Header */}
      <div className="py-16 px-6 md:px-16 max-w-7xl mx-auto text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-8 h-px bg-[#C5A059]" />
          <span className="text-[#C5A059] text-xs uppercase tracking-[0.4em]">Limited Access</span>
          <div className="w-8 h-px bg-[#C5A059]" />
        </div>
        <h1 className="text-5xl md:text-7xl font-serif text-white font-light mb-4">HD Drops</h1>
        <p className="text-white/40 max-w-lg mx-auto leading-relaxed">
          Exclusive releases. Timed collections. Sovereign access only.
          Each drop is a once-in-a-lifetime acquisition.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-y border-white/5 px-6 md:px-16">
        <div className="max-w-7xl mx-auto flex gap-8">
          {[
            { id: 'live', label: 'Live Now' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'ended', label: 'Archive' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 text-xs uppercase tracking-[0.3em] border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-[#C5A059] text-[#C5A059]'
                  : 'border-transparent text-white/40 hover:text-white'
              }`}
            >
              {tab.label}
              {tab.id === 'live' && drops.filter(d => d.status === 'live').length > 0 && (
                <span className="ml-2 bg-[#C5A059] text-black text-[9px] rounded-full px-2 py-0.5">
                  {drops.filter(d => d.status === 'live').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Drops Grid */}
      <div className="px-6 md:px-16 max-w-7xl mx-auto py-12">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-[#C5A059] animate-pulse font-serif text-xl">Loading drops...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-white/20 font-serif text-2xl mb-3">No drops in this category</p>
            <p className="text-white/10 text-sm">Check back soon for new releases</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5">
            {filtered.map(drop => (
              <div key={drop.id} className={`bg-[#050505] ${drop.is_featured ? 'md:col-span-2' : ''}`}>
                <DropCard drop={drop} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
