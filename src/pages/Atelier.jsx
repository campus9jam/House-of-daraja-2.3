import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scissors, Ruler, Sparkles, User, Check, ArrowRight, Upload, Info } from 'lucide-react';
import { AtelierOrder } from '../api/entities';

const STEPS = ['Body Profile', 'Dimensions', 'Style', 'Confirm'];
const FABRICS = ['Aso-Oke', 'Ankara', 'Adire Silk', 'Heritage Linen', 'Kente Blend', 'Kente Gold'];
const BODY_TYPES = ['athletic', 'slim', 'regular', 'full'];
const FIT_PREFS = ['slim', 'regular', 'relaxed', 'oversized'];

export default function Atelier() {
  const [step, setStep] = useState(1);
  const [aiInput, setAiInput] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState({
    bodyType: 'athletic', fitPreference: 'regular',
    bust_chest: '', waist: '', hips: '', shoulder: '', length: '', sleeve_length: '',
    fabric: '', color: '', special_instructions: ''
  });

  const update = (key, val) => setProfile(prev => ({ ...prev, [key]: val }));

  const handleAiExtraction = async () => {
    if (!aiInput.trim()) return;
    setIsExtracting(true);
    // Simulate Leema extraction
    await new Promise(r => setTimeout(r, 1500));
    const match = aiInput.match(/(\d+)/g);
    if (match && match.length >= 3) {
      setProfile(prev => ({
        ...prev,
        bust_chest: match[0] || '',
        waist: match[1] || '',
        hips: match[2] || ''
      }));
    }
    alert('Identity Detected — Leema has extracted your biological architecture.');
    setIsExtracting(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await AtelierOrder.create({
        fabric: profile.fabric,
        color: profile.color,
        bust_chest: parseFloat(profile.bust_chest) || 0,
        waist: parseFloat(profile.waist) || 0,
        hips: parseFloat(profile.hips) || 0,
        shoulder: parseFloat(profile.shoulder) || 0,
        length: parseFloat(profile.length) || 0,
        sleeve_length: parseFloat(profile.sleeve_length) || 0,
        special_instructions: profile.special_instructions,
        status: 'Submitted',
        serial_number: `HD_ATEL_${Date.now().toString().slice(-6)}`
      });
      alert('Commission Archived — Your atelier order has been submitted to the craft ledger.');
      setStep(1);
    } catch (err) {
      console.error(err);
      alert('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-daraja-charcoal pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">

        {/* Left Visual (38%) */}
        <div className="lg:col-span-5 space-y-12">
          <header className="space-y-4">
            <div className="flex items-center gap-3 text-daraja-gold mono-text text-[10px]">
              <Scissors className="w-4 h-4" /><span>ATELIER_COMMISSION_PROTOCOL</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif italic text-white tracking-tighter">
              Identity <span className="text-daraja-gold not-italic">Node</span>
            </h1>
          </header>

          {/* Body silhouette card */}
          <div className="luxury-card aspect-[3/4] relative overflow-hidden bg-daraja-surface/30 p-12 flex flex-col justify-between">
            <div className="absolute inset-0">
              <img src="https://i.imgur.com/S4l7lKP.png" alt="" className="w-full h-full object-cover opacity-20" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-daraja-charcoal/80" />
            </div>
            {/* Step progress */}
            <div className="relative z-10 space-y-3">
              {STEPS.map((s, i) => (
                <div key={i} className={`flex items-center gap-3 transition-all ${step > i + 1 ? 'text-daraja-gold' : step === i + 1 ? 'text-white' : 'text-white/20'}`}>
                  <div className={`w-6 h-6 border flex items-center justify-center text-[9px] mono-text ${step > i + 1 ? 'border-daraja-gold bg-daraja-gold text-daraja-charcoal' : step === i + 1 ? 'border-white' : 'border-white/10'}`}>
                    {step > i + 1 ? <Check className="w-3 h-3" /> : i + 1}
                  </div>
                  <span className="mono-text text-[9px] uppercase">{s}</span>
                </div>
              ))}
            </div>

            <div className="relative z-10 space-y-3">
              <p className="mono-text text-daraja-gold text-[9px] uppercase">Leema_AI_Extraction</p>
              <textarea
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                placeholder="Describe your measurements... 'I am 38 chest, 32 waist, 40 hips'"
                className="w-full bg-daraja-charcoal border border-daraja-border p-4 text-white font-mono text-xs focus:border-daraja-gold outline-none resize-none h-24"
              />
              <button
                onClick={handleAiExtraction}
                disabled={isExtracting}
                className="w-full py-3 bg-daraja-gold/20 border border-daraja-gold/40 text-daraja-gold mono-text text-[9px] hover:bg-daraja-gold hover:text-daraja-charcoal transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isExtracting ? 'EXTRACTING...' : <><Sparkles className="w-3 h-3" /> LEEMA_EXTRACT</>}
              </button>
            </div>
          </div>
        </div>

        {/* Right Form (62%) */}
        <div className="lg:col-span-7 space-y-12">
          <AnimatePresence mode="wait">
            {/* STEP 1 — Body Profile */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                <h2 className="text-3xl font-serif italic text-white">Body <span className="text-daraja-gold not-italic">Profile</span></h2>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="mono-text text-[10px] text-daraja-text-muted uppercase">Body_Type</label>
                    <div className="grid grid-cols-4 gap-3">
                      {BODY_TYPES.map(t => (
                        <button key={t} onClick={() => update('bodyType', t)}
                          className={`py-4 mono-text text-[9px] capitalize transition-all ${profile.bodyType === t ? 'bg-daraja-gold text-daraja-charcoal' : 'border border-daraja-border text-daraja-text-muted hover:border-daraja-gold'}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="mono-text text-[10px] text-daraja-text-muted uppercase">Fit_Preference</label>
                    <div className="grid grid-cols-4 gap-3">
                      {FIT_PREFS.map(f => (
                        <button key={f} onClick={() => update('fitPreference', f)}
                          className={`py-4 mono-text text-[9px] capitalize transition-all ${profile.fitPreference === f ? 'bg-daraja-gold text-daraja-charcoal' : 'border border-daraja-border text-daraja-text-muted hover:border-daraja-gold'}`}>
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={() => setStep(2)} className="w-full py-6 bg-daraja-gold text-daraja-charcoal font-black mono-text text-[10px] hover:bg-white transition-all flex items-center justify-center gap-3">
                  NEXT_STEP <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* STEP 2 — Dimensions */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                <h2 className="text-3xl font-serif italic text-white">Body <span className="text-daraja-gold not-italic">Dimensions</span></h2>
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: 'Bust_Chest', key: 'bust_chest' },
                    { label: 'Waist', key: 'waist' },
                    { label: 'Hips', key: 'hips' },
                    { label: 'Shoulder', key: 'shoulder' },
                    { label: 'Length', key: 'length' },
                    { label: 'Sleeve_Length', key: 'sleeve_length' }
                  ].map(f => (
                    <div key={f.key} className="space-y-3">
                      <label className="mono-text text-[10px] text-daraja-text-muted uppercase">{f.label} (cm)</label>
                      <input
                        type="number" value={profile[f.key]} onChange={e => update(f.key, e.target.value)}
                        placeholder="0"
                        className="w-full bg-daraja-charcoal border border-daraja-border p-5 text-white font-mono text-sm focus:border-daraja-gold outline-none"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="flex-1 py-6 border border-daraja-border text-white mono-text text-[10px] hover:bg-white/5">BACK</button>
                  <button onClick={() => setStep(3)} className="flex-[2] py-6 bg-daraja-gold text-daraja-charcoal font-black mono-text text-[10px] hover:bg-white">NEXT_STEP</button>
                </div>
              </motion.div>
            )}

            {/* STEP 3 — Style */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                <h2 className="text-3xl font-serif italic text-white">Style <span className="text-daraja-gold not-italic">Selection</span></h2>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="mono-text text-[10px] text-daraja-text-muted uppercase">Fabric_Selection</label>
                    <div className="grid grid-cols-3 gap-3">
                      {FABRICS.map(f => (
                        <button key={f} onClick={() => update('fabric', f)}
                          className={`py-4 mono-text text-[9px] transition-all ${profile.fabric === f ? 'bg-daraja-gold text-daraja-charcoal' : 'border border-daraja-border text-daraja-text-muted hover:border-daraja-gold'}`}>
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="mono-text text-[10px] text-daraja-text-muted uppercase">Color_Specification</label>
                    <input
                      type="text" value={profile.color} onChange={e => update('color', e.target.value)}
                      placeholder="e.g. Deep Indigo, Burnt Gold, Ivory..."
                      className="w-full bg-daraja-charcoal border border-daraja-border p-5 text-white font-mono text-sm focus:border-daraja-gold outline-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="mono-text text-[10px] text-daraja-text-muted uppercase">Special_Instructions</label>
                    <textarea
                      value={profile.special_instructions} onChange={e => update('special_instructions', e.target.value)}
                      placeholder="Describe any special details, embroidery patterns, reference images..."
                      className="w-full bg-daraja-charcoal border border-daraja-border p-5 text-white font-mono text-sm focus:border-daraja-gold outline-none min-h-[120px]"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep(2)} className="flex-1 py-6 border border-daraja-border text-white mono-text text-[10px] hover:bg-white/5">BACK</button>
                  <button onClick={() => setStep(4)} className="flex-[2] py-6 bg-daraja-gold text-daraja-charcoal font-black mono-text text-[10px] hover:bg-white">REVIEW_ORDER</button>
                </div>
              </motion.div>
            )}

            {/* STEP 4 — Confirm */}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                <h2 className="text-3xl font-serif italic text-white">Commission <span className="text-daraja-gold not-italic">Manifest</span></h2>
                <div className="luxury-card p-10 space-y-6">
                  {[
                    { label: 'Body Type', val: profile.bodyType },
                    { label: 'Fit', val: profile.fitPreference },
                    { label: 'Bust/Chest', val: `${profile.bust_chest} cm` },
                    { label: 'Waist', val: `${profile.waist} cm` },
                    { label: 'Hips', val: `${profile.hips} cm` },
                    { label: 'Fabric', val: profile.fabric },
                    { label: 'Color', val: profile.color },
                  ].map(({ label, val }) => val ? (
                    <div key={label} className="flex justify-between border-b border-daraja-border pb-4">
                      <span className="mono-text text-[10px] text-daraja-text-muted uppercase">{label}</span>
                      <span className="mono-text text-[10px] text-white">{val}</span>
                    </div>
                  ) : null)}
                  {profile.special_instructions && (
                    <div className="pt-2">
                      <p className="mono-text text-[10px] text-daraja-text-muted uppercase mb-2">Special Instructions</p>
                      <p className="font-serif italic text-white/70 text-sm">{profile.special_instructions}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep(3)} className="flex-1 py-6 border border-daraja-border text-white mono-text text-[10px] hover:bg-white/5">BACK</button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-[2] py-6 bg-daraja-gold text-daraja-charcoal font-black mono-text text-[10px] hover:bg-white disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {submitting ? 'ARCHIVING...' : 'SUBMIT_COMMISSION'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
