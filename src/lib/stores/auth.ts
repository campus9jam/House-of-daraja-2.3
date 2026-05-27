import { writable, derived } from 'svelte/store';
import { supabase } from '$lib/supabase';
import type { HDProfile } from '$lib/types/database';
import type { User } from '@supabase/supabase-js';

// ── Raw auth state ──────────────────────────────────────────
export const currentUser   = writable<User | null>(null);
export const userProfile   = writable<HDProfile | null>(null);
export const authLoading   = writable(true);

// ── Derived convenience ─────────────────────────────────────
export const isAuthenticated = derived(currentUser, $u => !!$u);
export const userRole        = derived(userProfile, $p => $p?.role ?? 'user');
export const prestigeTier    = derived(userProfile, $p => $p?.prestige_tier ?? 'citizen');
export const isAdmin         = derived(userRole, $r => $r === 'admin' || $r === 'moderator');
export const isArtisan       = derived(userRole, $r => $r === 'artisan' || $r === 'admin');

// ── Initialize auth listener ────────────────────────────────
export async function initAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    currentUser.set(session.user);
    await loadProfile(session.user.id);
  }
  authLoading.set(false);

  supabase.auth.onAuthStateChange(async (_event, session) => {
    currentUser.set(session?.user ?? null);
    if (session?.user) {
      await loadProfile(session.user.id);
    } else {
      userProfile.set(null);
    }
  });
}

async function loadProfile(userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  userProfile.set(data);
}

// ── Auth actions ────────────────────────────────────────────
export const auth = {
  async signInEmail(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  },
  async signUpEmail(email: string, password: string, username: string) {
    return supabase.auth.signUp({ email, password, options: { data: { username } } });
  },
  async signInGoogle() {
    return supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/auth/callback' } });
  },
  async signInPhone(phone: string) {
    return supabase.auth.signInWithOtp({ phone });
  },
  async verifyOtp(phone: string, token: string) {
    return supabase.auth.verifyOtp({ phone, token, type: 'sms' });
  },
  async signOut() {
    await supabase.auth.signOut();
    currentUser.set(null);
    userProfile.set(null);
  },
};
