import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d7fe',
          300: '#a5b8fd',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        surface: {
          0:   '#0a0a0f',
          50:  '#0f0f18',
          100: '#13131e',
          200: '#1a1a27',
          300: '#222236',
          400: '#2d2d45',
          500: '#3a3a56',
          600: '#4a4a6a',
        },
        accent: {
          purple: '#8b5cf6',
          pink:   '#ec4899',
          cyan:   '#06b6d4',
          amber:  '#f59e0b',
          green:  '#10b981',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body:    ['var(--font-body)', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial':   'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh':     'radial-gradient(at 40% 20%, #6366f133 0px, transparent 50%), radial-gradient(at 80% 0%, #8b5cf633 0px, transparent 50%), radial-gradient(at 0% 50%, #06b6d422 0px, transparent 50%)',
        'grid-pattern':      'linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)',
      },
      boxShadow: {
        'glow-sm':  '0 0 10px rgba(99,102,241,0.3)',
        'glow-md':  '0 0 20px rgba(99,102,241,0.4)',
        'glow-lg':  '0 0 40px rgba(99,102,241,0.5)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.08)',
      },
      animation: {
        'fade-in':       'fadeIn 0.4s ease-out',
        'slide-up':      'slideUp 0.4s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'pulse-glow':    'pulseGlow 2s ease-in-out infinite',
        'shimmer':       'shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:       { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:      { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideInLeft:  { '0%': { opacity: '0', transform: 'translateX(-20px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        pulseGlow:    { '0%,100%': { boxShadow: '0 0 10px rgba(99,102,241,0.3)' }, '50%': { boxShadow: '0 0 30px rgba(99,102,241,0.6)' } },
        shimmer:      { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
};

export default config;
