/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9' },
        accent: { 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb' },
        dark: { 800: '#0f0f1a', 850: '#0d0d16', 900: '#080812', 950: '#050508' },
        glass: { DEFAULT: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #0f0f1a 0%, #1a0a2e 50%, #0a1628 100%)',
      },
      boxShadow: {
        neon: '0 0 20px rgba(139,92,246,0.4)',
        'neon-blue': '0 0 20px rgba(59,130,246,0.4)',
        glass: '0 8px 32px rgba(0,0,0,0.4)',
      },
      backdropBlur: { xs: '2px' },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },
        glow: { from: { boxShadow: '0 0 10px #8b5cf6' }, to: { boxShadow: '0 0 25px #8b5cf6, 0 0 50px #8b5cf6' } },
      },
    },
  },
  plugins: [],
};
