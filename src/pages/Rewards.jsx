import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../api/entities';

const TIERS = [
  { name: 'Citizen', min: 0, max: 999, color: 'text-white/60', bg: 'bg-white/10', icon: '◎' },
  { name: 'Gold', min: 1000, max: 4999, color: 'text-[#C5A059]', bg: 'bg-[#C5A059]/20', icon: '◈' },
  { name: 'Platinum', min: 5000, max: 14999, color: 'text-blue-400', bg: 'bg-blue-400/20', icon: '◆' },
  { name: 'Diamond Elite', min: 15000, max: Infinity, color: 'text-purple-400', bg: 'bg-purple-400/20', icon: '✦' },
];

const REWARDS = [
  { id: 1, title: 'First Purchase', desc: 'Complete your first order', xp: 100, icon: '◈', unlocked: true },
  { id: 2, title: 'Heritage Seeker', desc: 'View 10 heritage posts', xp: 150, icon: '◆', unlocked: true },
  { id: 3, title: 'Atelier Initiate', desc: 'Submit a bespoke commission', xp: 500, icon: '✦', unlocked: false },
  { id: 4, title: 'Drop Hunter', desc: 'Purchase from 3 live drops', xp: 300, icon: '◉', unlocked: false },
  { id: 5, title: 'Sovereign Circle', desc: 'Reach Gold tier', xp: 1000, icon: '◈', unlocked: false },
  { id: 6, title: 'Neural Pioneer', desc: 'Chat with Leema 5 times', xp: 200, icon: '⬡', unlocked: true },
  { id: 7, title: 'Marketplace Patron', desc: 'Purchase from 5 vendors', xp: 400, icon: '◈', unlocked: false },
  { id: 8, title: 'Diamond Sovereign', desc: 'Reach Diamond Elite tier', xp: 5000, icon: '✦', unlocked: false },
];

const PERKS = {
  Citizen: ['Early access newsletters', 'Community forum access'],
  Gold: ['5% discount on all orders', 'Priority customer support', 'Early drop access (30min)'],
  Platinum: ['10% discount on all orders', 'Free shipping always', 'Early drop access (2hrs)', 'Atelier consultation'],
  'Diamond Elite': ['15% discount on all orders', 'Dedicated personal stylist', 'Exclusive Diamond drops', 'Complimentary bespoke fitting', 'VIP event invitations'],
};

export default function Rewards() {
  const [xp] = useState(1250);
  const [tab, setTab] = useState('overview');

  const currentTier = TIERS.find(t => xp >= t.min && xp <= t.max) || TIERS[0];
  const nextTier = TIERS[TIERS.indexOf(currentTier) + 1];
  const progress = nextTier ? ((xp - currentTier.min) / (nextTier.min - currentTier.min)) * 100 : 100;

  return (
    <div className="min-h-screen bg-[#050505] px-6 md:px-16 py-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-6 h-px bg-[#C5A059]" />
          <span className="text-[#C5A059] text-xs uppercase tracking-[0.3em]">Sovereign Status</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif text-white font-light">Rewards</h1>
      </div>

      {/* Status Card — 62% / 38% golden split */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
        {/* Main status — 62% */}
        <div className="md:col-span-3 bg-[#0E0E0E] border border-white/5 p-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className={`text-4xl mb-2 ${currentTier.color}`}>{currentTier.icon}</div>
              <div className="text-white font-serif text-3xl font-light">{currentTier.name}</div>
              <div className="text-white/40 text-sm mt-1">Current Tier</div>
            </div>
            <div className="text-right">
              <div className="text-[#C5A059] font-mono text-3xl font-bold">{xp.toLocaleString()}</div>
              <div className="text-white/40 text-xs uppercase tracking-[0.2em] mt-1">XP Points</div>
            </div>
          </div>

          {nextTier && (
            <div>
              <div className="flex justify-between text-xs text-white/40 mb-2">
                <span>{currentTier.name}</span>
                <span>{nextTier.name} — {nextTier.min.toLocaleString()} XP</span>
              </div>
              <div className="h-1 bg-white/10 relative">
                <div
                  className="h-full bg-[#C5A059] transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-white/40 text-xs mt-2">
                {(nextTier.min - xp).toLocaleString()} XP to reach {nextTier.name}
              </div>
            </div>
          )}
          {!nextTier && (
            <div className="text-[#C5A059] text-sm">✦ Maximum tier achieved — Diamond Elite</div>
          )}
        </div>

        {/* Perks — 38% */}
        <div className="md:col-span-2 bg-[#C5A059]/5 border border-[#C5A059]/20 p-6">
          <div className="text-[#C5A059] text-xs uppercase tracking-[0.3em] mb-4">Current Perks</div>
          <div className="space-y-3">
            {(PERKS[currentTier.name] || []).map((perk, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-[#C5A059] text-xs mt-0.5">✓</span>
                <span className="text-white/70 text-sm">{perk}</span>
              </div>
            ))}
          </div>
          {nextTier && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="text-white/30 text-xs uppercase tracking-[0.2em] mb-3">Unlock at {nextTier.name}</div>
              {(PERKS[nextTier.name] || []).slice(0, 2).map((perk, i) => (
                <div key={i} className="flex items-start gap-3 mb-2 opacity-40">
                  <span className="text-white/40 text-xs mt-0.5">◎</span>
                  <span className="text-white/50 text-sm">{perk}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-white/10 mb-8">
        {[['overview', 'Overview'], ['achievements', 'Achievements'], ['tiers', 'All Tiers']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`pb-4 text-xs uppercase tracking-[0.25em] border-b-2 transition-all -mb-px ${
              tab === k ? 'border-[#C5A059] text-[#C5A059]' : 'border-transparent text-white/40 hover:text-white'
            }`}
          >{l}</button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total XP', value: xp.toLocaleString(), icon: '◈' },
            { label: 'Achievements', value: `${REWARDS.filter(r => r.unlocked).length}/${REWARDS.length}`, icon: '✦' },
            { label: 'Orders', value: '3', icon: '◆' },
            { label: 'Tier Rank', value: `#${TIERS.indexOf(currentTier) + 1}`, icon: '◎' },
          ].map(stat => (
            <div key={stat.label} className="bg-[#0E0E0E] border border-white/5 p-5">
              <div className="text-[#C5A059] text-xl mb-3">{stat.icon}</div>
              <div className="text-white font-serif text-2xl font-light">{stat.value}</div>
              <div className="text-white/40 text-xs uppercase tracking-[0.2em] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Achievements */}
      {tab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REWARDS.map(r => (
            <div key={r.id} className={`flex items-center gap-4 p-5 border transition-all ${
              r.unlocked ? 'bg-[#C5A059]/5 border-[#C5A059]/20' : 'bg-[#0E0E0E] border-white/5 opacity-50'
            }`}>
              <div className={`w-12 h-12 flex items-center justify-center text-2xl flex-shrink-0 ${
                r.unlocked ? 'bg-[#C5A059]/20 text-[#C5A059]' : 'bg-white/5 text-white/30'
              }`}>{r.icon}</div>
              <div className="flex-1">
                <div className={`font-medium text-sm ${r.unlocked ? 'text-white' : 'text-white/50'}`}>{r.title}</div>
                <div className="text-white/40 text-xs mt-0.5">{r.desc}</div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold ${r.unlocked ? 'text-[#C5A059]' : 'text-white/20'}`}>+{r.xp}</div>
                <div className="text-white/30 text-[10px] uppercase">XP</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All Tiers */}
      {tab === 'tiers' && (
        <div className="space-y-4">
          {TIERS.map((tier, i) => (
            <div key={tier.name} className={`p-6 border transition-all ${
              tier.name === currentTier.name ? 'border-[#C5A059]/40 bg-[#C5A059]/5' : 'border-white/5 bg-[#0E0E0E]'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`text-3xl ${tier.color}`}>{tier.icon}</div>
                  <div>
                    <div className={`font-serif text-xl font-light ${tier.color}`}>{tier.name}</div>
                    <div className="text-white/30 text-xs">
                      {tier.max === Infinity ? `${tier.min.toLocaleString()}+ XP` : `${tier.min.toLocaleString()} – ${tier.max.toLocaleString()} XP`}
                    </div>
                  </div>
                </div>
                {tier.name === currentTier.name && (
                  <div className="bg-[#C5A059] text-black text-[10px] uppercase tracking-[0.2em] px-3 py-1 font-bold">Current</div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(PERKS[tier.name] || []).map((perk, j) => (
                  <div key={j} className="flex items-center gap-2 text-sm text-white/50">
                    <span className={tier.color}>✓</span> {perk}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
