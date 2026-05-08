/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        wa: {
          bg:      '#0d0f14',
          nav:     '#08090d',
          card:    '#111318',
          border:  'rgba(255,255,255,0.07)',
          accent:  '#1d4ed8',
          'accent-light': '#60a5fa',
          'accent-muted': 'rgba(29,78,216,0.15)',
          text:    'rgba(255,255,255,0.88)',
          muted:   'rgba(255,255,255,0.45)',
          subtle:  'rgba(255,255,255,0.28)',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif']
      }
    }
  },
  plugins: []
}
