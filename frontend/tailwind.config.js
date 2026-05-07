/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-deep': 'var(--bg-deep)',
        'bg-surface': 'var(--bg-surface)',
        'bg-card': 'var(--bg-card)',
        'primary': 'var(--primary)',
        'accent': 'var(--accent)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'border': 'var(--border)',
        'border-hover': 'var(--border-hover)',
      },
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      fontSize: {
        'font-xs': 'var(--font-xs)',
        'font-sm': 'var(--font-sm)',
        'font-base': 'var(--font-base)',
        'font-lg': 'var(--font-lg)',
        'font-xl': 'var(--font-xl)',
        'font-2xl': 'var(--font-2xl)',
      }
    },
  },
  plugins: [],
}
