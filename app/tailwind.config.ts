import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAF9F5',
        ink: { DEFAULT: '#2D3748', soft: '#4A5568', mute: '#718096' },
        // Muted sage / fresh mint – primary accent + heatmap
        brand: {
          50: '#F0F9F4',
          100: '#DDF1E5',
          200: '#BDE3CE',
          300: '#92CFAF',
          400: '#5FB38B',
          500: '#38A169',
          600: '#2E7D5B',
          700: '#266549',
          800: '#1F513B',
          900: '#194231',
        },
        // Soft warm amber / peach – location tags and badges
        peach: {
          50: '#FFF8F1',
          100: '#FFEEDB',
          200: '#FDDDB8',
          300: '#F9C48A',
          400: '#F2A65A',
          500: '#E58A33',
          600: '#C26D1F',
          700: '#9A5519',
        },
      },
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
          'Inter',
          'Noto Sans TC',
          'Noto Sans JP',
          'PingFang TC',
          'Hiragino Sans',
          'Microsoft JhengHei',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'sans-serif',
        ],
      },
      borderRadius: { '4xl': '2rem' },
      boxShadow: {
        soft: '0 1px 2px rgba(45,55,72,.04), 0 4px 16px rgba(45,55,72,.06)',
        float: '0 -8px 30px rgba(45,55,72,.10)',
      },
      keyframes: {
        'pop-in': {
          '0%': { transform: 'scale(.92)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
      },
      animation: { 'pop-in': 'pop-in .18s ease-out', 'fade-in': 'fade-in .18s ease-out' },
    },
  },
  plugins: [],
};

export default config;
