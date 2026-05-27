/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'hd-black': '#050505',
        'hd-gold':  '#C5A059',
        'hd-earth': '#8B6F47',
        'hd-ivory': '#F5F0E8',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans:  ['Montserrat', 'system-ui', 'sans-serif'],
        mono:  ['"JetBrains Mono"', '"Courier New"', 'monospace'],
      },
      animation: {
        'marquee':    'marquee 12s linear infinite',
        'shimmer':    'shimmer 3s ease-in-out infinite',
        'fade-up':    'fadeUp 0.6s ease forwards',
        'gold-pulse': 'goldPulse 2s ease-in-out infinite',
      },
      keyframes: {
        marquee:   { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        shimmer:   { '0%,100%': { transform:'translateX(-120%)', opacity:'0' }, '50%': { transform:'translateX(120%)', opacity:'1' } },
        fadeUp:    { from: { opacity:'0', transform:'translateY(16px)' }, to: { opacity:'1', transform:'translateY(0)' } },
        goldPulse: { '0%,100%': { boxShadow:'0 0 0 0 rgba(197,160,89,0)' }, '50%': { boxShadow:'0 0 16px 4px rgba(197,160,89,0.25)' } },
      },
      screens: { xs: '400px' },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
};
