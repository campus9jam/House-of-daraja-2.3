import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // login | register | forgot
  const [form, setForm] = useState({ email: '', password: '', full_name: '', confirm_password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'register') {
        if (form.password !== form.confirm_password) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, password: form.password, full_name: form.full_name }),
        });
        setSuccess('Account created. Welcome to the sovereign circle.');
        setTimeout(() => navigate('/'), 1500);
      } else if (mode === 'login') {
        await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        navigate('/');
      } else if (mode === 'forgot') {
        setSuccess('Password reset instructions sent to your email.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex">
      {/* Left panel — visual 62% */}
      <div className="hidden lg:block lg:w-[62%] relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=1400&q=90"
          alt="House of Daraja"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#050505]" />
        <div className="absolute bottom-16 left-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-px bg-[#C5A059]" />
            <span className="text-[#C5A059] text-xs uppercase tracking-[0.4em]">Sovereign Access</span>
          </div>
          <h2 className="text-5xl font-serif text-white font-light leading-tight">
            Wear Your Worth.<br />
            <span className="text-[#C5A059]">Enter the Circle.</span>
          </h2>
        </div>
      </div>

      {/* Right panel — 38% */}
      <div className="w-full lg:w-[38%] flex flex-col justify-center px-8 md:px-16 py-12">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 mb-16">
          <div className="w-10 h-10 bg-[#C5A059] flex items-center justify-center">
            <span className="text-black font-serif font-bold">HD</span>
          </div>
          <span className="text-white font-serif text-xl">House of Daraja</span>
        </Link>

        {/* Mode Tabs */}
        <div className="flex gap-6 mb-10 border-b border-white/10 pb-6">
          {[['login','Sign In'],['register','Create Account']].map(([m, label]) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); setSuccess(''); }}
              className={`text-sm uppercase tracking-[0.2em] pb-1 border-b-2 transition-all ${
                mode === m ? 'border-[#C5A059] text-[#C5A059]' : 'border-transparent text-white/40 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === 'forgot' && (
          <div className="mb-6">
            <h2 className="text-white font-serif text-2xl font-light mb-2">Reset Password</h2>
            <p className="text-white/40 text-sm">Enter your email and we'll send reset instructions.</p>
          </div>
        )}

        {/* Error / Success */}
        {error && (
          <div className="bg-red-400/10 border border-red-400/20 text-red-400 text-sm px-4 py-3 mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-400/10 border border-green-400/20 text-green-400 text-sm px-4 py-3 mb-6">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'register' && (
            <div>
              <label className="text-white/40 text-xs uppercase tracking-[0.3em] block mb-2">Full Name</label>
              <input
                type="text"
                value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                placeholder="Your name"
                required
                className="w-full bg-[#0E0E0E] border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059] placeholder-white/20"
              />
            </div>
          )}

          <div>
            <label className="text-white/40 text-xs uppercase tracking-[0.3em] block mb-2">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="your@email.com"
              required
              className="w-full bg-[#0E0E0E] border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059] placeholder-white/20"
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <label className="text-white/40 text-xs uppercase tracking-[0.3em] block mb-2">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full bg-[#0E0E0E] border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059] placeholder-white/20"
              />
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="text-white/40 text-xs uppercase tracking-[0.3em] block mb-2">Confirm Password</label>
              <input
                type="password"
                value={form.confirm_password}
                onChange={e => setForm(f => ({ ...f, confirm_password: e.target.value }))}
                placeholder="••••••••"
                required
                className="w-full bg-[#0E0E0E] border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059] placeholder-white/20"
              />
            </div>
          )}

          {mode === 'login' && (
            <div className="flex justify-end">
              <button type="button" onClick={() => setMode('forgot')} className="text-white/30 text-xs hover:text-[#C5A059] transition-colors uppercase tracking-[0.2em]">
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C5A059] text-black py-4 text-sm uppercase tracking-[0.3em] font-bold hover:bg-white transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Processing...' :
              mode === 'login' ? 'Enter' :
              mode === 'register' ? 'Join the Circle' :
              'Send Reset Link'}
          </button>
        </form>

        {mode === 'forgot' && (
          <button onClick={() => setMode('login')} className="mt-6 text-white/30 text-xs uppercase tracking-[0.2em] hover:text-white transition-colors">
            ← Back to Sign In
          </button>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/20 text-xs uppercase tracking-[0.2em]">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Social */}
        <button className="w-full border border-white/10 text-white/50 py-3 text-sm uppercase tracking-[0.2em] hover:border-white/30 hover:text-white transition-all flex items-center justify-center gap-3">
          <span>G</span> Continue with Google
        </button>

        <p className="text-white/20 text-xs text-center mt-8">
          By joining, you agree to our Terms of Sovereignty and Privacy Protocol.
        </p>
      </div>
    </div>
  );
}
