import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const MOCK_TRANSACTIONS = [
  { id: 1, type: 'credit', desc: 'Order payment received', amount: 45000, date: '2026-05-20', ref: 'HD-001-ABC', status: 'completed' },
  { id: 2, type: 'debit', desc: 'Purchase — Luxury Kaftan', amount: -22500, date: '2026-05-18', ref: 'HD-002-DEF', status: 'completed' },
  { id: 3, type: 'escrow', desc: 'Drop bid held in escrow', amount: -15000, date: '2026-05-15', ref: 'HD-003-GHI', status: 'escrow' },
  { id: 4, type: 'credit', desc: 'Rewards XP bonus', amount: 500, date: '2026-05-12', ref: 'HD-004-JKL', status: 'completed' },
  { id: 5, type: 'debit', desc: 'Atelier commission deposit', amount: -35000, date: '2026-05-10', ref: 'HD-005-MNO', status: 'completed' },
];

export default function Wallet() {
  const [tab, setTab] = useState('overview');
  const [addModal, setAddModal] = useState(false);
  const [amount, setAmount] = useState('');

  const balance = 127500;
  const escrow = 15000;
  const available = balance - escrow;

  return (
    <div className="min-h-screen bg-[#050505] px-6 md:px-16 py-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-6 h-px bg-[#C5A059]" />
          <span className="text-[#C5A059] text-xs uppercase tracking-[0.3em]">Digital Ledger</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif text-white font-light">Sovereign Wallet</h1>
      </div>

      {/* Balance Cards — golden split */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
        {/* Main balance 62% */}
        <div className="md:col-span-3 bg-[#0E0E0E] border border-[#C5A059]/20 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A059]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="text-[#C5A059] text-xs uppercase tracking-[0.3em] mb-3">Total Balance</div>
          <div className="text-white font-serif text-5xl font-light mb-1">
            ₦{balance.toLocaleString()}
          </div>
          <div className="text-white/30 text-sm mt-4">HD Sovereign Account</div>
          <div className="flex gap-4 mt-8">
            <button
              onClick={() => setAddModal(true)}
              className="bg-[#C5A059] text-black px-6 py-3 text-xs uppercase tracking-[0.2em] font-bold hover:bg-white transition-colors"
            >
              + Fund Wallet
            </button>
            <button className="border border-white/20 text-white/60 px-6 py-3 text-xs uppercase tracking-[0.2em] hover:border-white/50 transition-colors">
              Withdraw
            </button>
          </div>
        </div>

        {/* Sub balances 38% */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-[#0E0E0E] border border-white/5 p-6">
            <div className="text-white/40 text-xs uppercase tracking-[0.2em] mb-2">Available</div>
            <div className="text-green-400 font-serif text-2xl font-light">₦{available.toLocaleString()}</div>
            <div className="text-white/20 text-xs mt-1">Spendable funds</div>
          </div>
          <div className="bg-[#0E0E0E] border border-white/5 p-6">
            <div className="text-white/40 text-xs uppercase tracking-[0.2em] mb-2">In Escrow</div>
            <div className="text-amber-400 font-serif text-2xl font-light">₦{escrow.toLocaleString()}</div>
            <div className="text-white/20 text-xs mt-1">Held for active bids</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-white/10 mb-8">
        {[['overview','Transactions'],['escrow','Escrow'],['methods','Payment Methods']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`pb-4 text-xs uppercase tracking-[0.25em] border-b-2 -mb-px transition-all ${
              tab === k ? 'border-[#C5A059] text-[#C5A059]' : 'border-transparent text-white/40 hover:text-white'
            }`}
          >{l}</button>
        ))}
      </div>

      {/* Transactions */}
      {tab === 'overview' && (
        <div className="space-y-2">
          {MOCK_TRANSACTIONS.map(tx => (
            <div key={tx.id} className="flex items-center gap-4 p-4 bg-[#0E0E0E] border border-white/5 hover:border-white/10 transition-all">
              <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 ${
                tx.type === 'credit' ? 'bg-green-400/10 text-green-400' :
                tx.type === 'escrow' ? 'bg-amber-400/10 text-amber-400' :
                'bg-red-400/10 text-red-400'
              }`}>
                {tx.type === 'credit' ? '↓' : tx.type === 'escrow' ? '◈' : '↑'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm truncate">{tx.desc}</div>
                <div className="text-white/30 text-xs mt-0.5">{tx.date} · {tx.ref}</div>
              </div>
              <div className="text-right">
                <div className={`font-mono text-sm font-medium ${
                  tx.type === 'credit' ? 'text-green-400' :
                  tx.type === 'escrow' ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {tx.amount > 0 ? '+' : ''}₦{Math.abs(tx.amount).toLocaleString()}
                </div>
                <div className={`text-[10px] uppercase tracking-[0.1em] mt-0.5 ${
                  tx.status === 'escrow' ? 'text-amber-400/60' : 'text-white/20'
                }`}>{tx.status}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Escrow */}
      {tab === 'escrow' && (
        <div>
          <div className="bg-amber-400/5 border border-amber-400/20 p-6 mb-6">
            <div className="text-amber-400 text-xs uppercase tracking-[0.3em] mb-2">Escrow System</div>
            <p className="text-white/60 text-sm leading-relaxed">
              Funds held in escrow are reserved for active bids and pending orders. They are released automatically when transactions complete or refunded if they fail.
            </p>
          </div>
          <div className="space-y-3">
            {MOCK_TRANSACTIONS.filter(t => t.type === 'escrow').map(tx => (
              <div key={tx.id} className="flex items-center gap-4 p-5 bg-[#0E0E0E] border border-amber-400/20">
                <div className="w-10 h-10 bg-amber-400/10 text-amber-400 flex items-center justify-center">◈</div>
                <div className="flex-1">
                  <div className="text-white text-sm">{tx.desc}</div>
                  <div className="text-white/30 text-xs mt-0.5">{tx.ref}</div>
                </div>
                <div>
                  <div className="text-amber-400 font-mono text-sm">₦{Math.abs(tx.amount).toLocaleString()}</div>
                  <div className="text-amber-400/50 text-[10px] uppercase text-right">Held</div>
                </div>
                <button className="text-white/30 text-xs border border-white/20 px-3 py-1.5 hover:border-white/50 transition-colors">
                  Release
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Methods */}
      {tab === 'methods' && (
        <div className="space-y-4">
          {[
            { type: 'OPay Wallet', last4: '', icon: 'OP', primary: true },
            { type: 'Bank Transfer', last4: '4521', icon: '🏦', primary: false },
          ].map((m, i) => (
            <div key={i} className="flex items-center gap-4 p-5 bg-[#0E0E0E] border border-white/5">
              <div className="w-12 h-8 bg-[#C5A059] flex items-center justify-center text-black text-xs font-bold">{m.icon}</div>
              <div className="flex-1">
                <div className="text-white text-sm">{m.type}{m.last4 ? ` ····${m.last4}` : ''}</div>
                {m.primary && <div className="text-[#C5A059] text-xs mt-0.5">Primary</div>}
              </div>
              <button className="text-white/30 text-xs uppercase tracking-[0.2em] hover:text-white transition-colors">
                {m.primary ? 'Default' : 'Set Default'}
              </button>
            </div>
          ))}
          <button className="w-full border border-dashed border-white/20 text-white/30 py-4 text-xs uppercase tracking-[0.2em] hover:border-[#C5A059]/40 hover:text-[#C5A059] transition-all">
            + Add Payment Method
          </button>
        </div>
      )}

      {/* Fund Wallet Modal */}
      {addModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setAddModal(false)} />
          <div className="relative bg-[#0E0E0E] border border-white/10 p-8 w-full max-w-md">
            <button onClick={() => setAddModal(false)} className="absolute top-4 right-4 text-white/30 hover:text-white">✕</button>
            <h3 className="text-white font-serif text-2xl font-light mb-6">Fund Wallet</h3>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[5000, 10000, 25000, 50000, 100000, 250000].map(amt => (
                <button key={amt} onClick={() => setAmount(amt.toString())}
                  className={`py-3 text-sm border transition-all ${
                    amount === amt.toString() ? 'border-[#C5A059] bg-[#C5A059]/10 text-[#C5A059]' : 'border-white/10 text-white/60 hover:border-white/30'
                  }`}
                >₦{amt.toLocaleString()}</button>
              ))}
            </div>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Custom amount (₦)"
              className="w-full bg-[#050505] border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059] placeholder-white/20 mb-6"
            />
            <button
              onClick={() => setAddModal(false)}
              className="w-full bg-[#C5A059] text-black py-4 text-sm uppercase tracking-[0.3em] font-bold hover:bg-white transition-colors"
            >
              Proceed with OPay — ₦{parseInt(amount || 0).toLocaleString()}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
