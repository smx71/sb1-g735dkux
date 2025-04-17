/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        wilpf: {
          // Primary colors
          primary: '#1B365D',    // Deep blue for main elements
          secondary: '#5B92E5',  // Lighter blue for accents
          accent: '#FF6B6B',     // Warm red for call-to-actions
          
          // Supporting palette
          sage: '#7FA99B',       // Soft green
          lavender: '#9B8AA6',   // Gentle purple
          sand: '#E6D1B1',       // Warm beige
          sky: '#B4D6E7',        // Light blue
          coral: '#FF8787',      // Soft red
          
          // Neutral tones
          gray: {
            50: '#F8FAFC',
            100: '#F1F5F9',
            200: '#E2E8F0',
            300: '#CBD5E1',
            400: '#94A3B8',
            500: '#64748B',
            600: '#475569',
            700: '#334155',
            800: '#1E293B',
            900: '#0F172A',
          }
        }
      },
      fontFamily: {
        sans: ['Lato', 'sans-serif'],
      },
      backgroundImage: {
        'dove-pattern': "url('https://images.unsplash.com/photo-1508144322886-717c284ab392?auto=format&fit=crop&q=80&w=300&h=300&blur=50')",
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};