import React from 'react';
import { motion } from 'motion/react';
import { Vote, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PROPOSALS = [
  {
    id: "PROP_HD_012",
    title: "Archival Expansion: Kano Indigo Vats Restore",
    status: "Active",
    votes: { for: 82, against: 18 },
    endsIn: "14h 22m",
    description: "Directing 15% of membership revenue to artisan grants for traditional indigo fermentation centers."
  },
  {
    id: "PROP_HD_011",
    title: "Protocol Update: Dynamic Supply Cap for Silk",
    status: "Passed",
    votes: { for: 95, against: 5 },
    description: "Implementing a strict scarcity protocol for Damascus Heritage Silk reproductions."
  }
];

export default function Governance() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-daraja-charcoal pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-24">

        <header className="max-w-3xl space-y-6">
          <Link to="/profile" className="flex items-center gap-2 text-daraja-gold mono-text text-[10px] hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> BACK_TO_ARCHIVE_STATUS
          </Link>
          <h1 className="text-6xl md:text-8xl font-serif italic text-white tracking-tighter">
            Sovereign <span className="text-daraja-gold not-italic">Council</span>
          </h1>
          <p className="text-xl text-daraja-text-muted font-serif italic leading-relaxed">
            The Council is the consensus engine of House of Daraja. Every move we make is ratified by the citizens who hold our heritage in their digital vaults.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <h2 className="mono-text text-[10px] text-white/40 uppercase tracking-[0.5em] mb-12">Active_Proposals_Index</h2>
            {PROPOSALS.map((proposal, i) => (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="luxury-card p-12 space-y-8 group hover:border-daraja-gold/40 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <span className="mono-text text-[8px] text-daraja-gold">{proposal.id}</span>
                    <h3 className="text-3xl font-serif text-white italic group-hover:text-daraja-gold transition-colors">{proposal.title}</h3>
                  </div>
                  <div className={`px-4 py-1.5 mono-text text-[9px] uppercase tracking-widest ${proposal.status === 'Active' ? 'bg-daraja-gold/20 text-daraja-gold' : 'bg-green-500/20 text-green-400'}`}>
                    {proposal.status}
                  </div>
                </div>
                <p className="text-daraja-text-muted italic font-serif leading-relaxed line-clamp-2">{proposal.description}</p>
                <div className="space-y-4">
                  <div className="flex justify-between text-[8px] mono-text text-white/40 uppercase">
                    <span>Consensus_Weight</span>
                    <span>{proposal.votes.for}% Verified</span>
                  </div>
                  <div className="h-1 bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${proposal.votes.for}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-daraja-gold"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <button className="px-12 py-4 bg-daraja-gold text-daraja-charcoal font-black mono-text text-[10px] uppercase tracking-widest hover:bg-white transition-all">
                    CAST_VOTE_PROTOCOL
                  </button>
                  {proposal.endsIn && (
                    <span className="mono-text text-[8px] text-daraja-text-muted">ENDS_IN: {proposal.endsIn}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="space-y-8">
            <div className="luxury-card p-8 bg-daraja-surface border border-daraja-border space-y-8">
              <div className="space-y-2">
                <p className="mono-text text-daraja-gold text-[8px] uppercase tracking-widest">My_Voting_Weight</p>
                <h4 className="text-4xl font-mono text-white">1.4x</h4>
                <p className="text-[9px] mono-text text-daraja-text-muted italic font-serif">Based on Your Gold Sovereign Status</p>
              </div>
              <div className="space-y-6 pt-8 border-t border-white/5">
                {[
                  { k: 'Network_Consensus', v: 'Active' },
                  { k: 'Nodes_Online', v: '1,204' },
                  { k: 'Total_Staked_Rep', v: '8.4M' }
                ].map(({ k, v }) => (
                  <div key={k} className="flex justify-between items-center text-[9px] mono-text">
                    <span className="text-daraja-text-muted uppercase">{k}</span>
                    <span className="text-white">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="luxury-card p-8 bg-white/5 border border-white/10 space-y-6 flex flex-col items-center text-center">
              <AlertCircle className="w-10 h-10 text-daraja-gold/40" />
              <div className="space-y-2">
                <h4 className="text-lg font-serif italic text-white uppercase tracking-tight">Citizen Responsibility</h4>
                <p className="text-[10px] text-daraja-text-muted font-serif italic">Voting is a core privilege of the Daraja protocol. Inactive nodes risk identity degradation.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
