/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'hd-black':    '#050505',
        'hd-surface':  '#0E0E0E',
        'hd-surface2': '#141414',
        'hd-gold':     '#C5A059',
        'hd-gold-dim': '#856936',
        'hd-earth':    '#6B4C35',
        'hd-ivory':    '#F5F0E8',
        'hd-muted':    'rgba(255,255,255,0.4)',
      },
      fontFamily: {
        serif:  ['Cormorant Garamond', 'Georgia', 'serif'],
        sans:   ['Montserrat', 'system-ui', 'sans-serif'],
        mono:   ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      // Golden Ratio: 1.618
      spacing: {
        'gr-sm':  '0.618rem',
        'gr-md':  '1rem',
        'gr-lg':  '1.618rem',
        'gr-xl':  '2.618rem',
        'gr-2xl': '4.236rem',
        'gr-3xl': '6.854rem',
      },
      animation: {
        'ticker':   'ticker 40s linear infinite',
        'shimmer':  'shimmer 3s ease infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'fadeUp':   'fadeUp 0.6s ease forwards',
      },
      keyframes: {
        ticker:    { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        shimmer:   { '0%,100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        pulseGold: { '0%,100%': { boxShadow: '0 0 0 rgba(197,160,89,0)' }, '50%': { boxShadow: '0 0 20px rgba(197,160,89,0.4)' } },
        fadeUp:    { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
