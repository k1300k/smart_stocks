/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-green': '#22C55E',
        'primary-red': '#EF4444',
        'primary-blue': '#3B82F6',
        'bg-primary': '#FFFFFF',
        'bg-secondary': '#F9FAFB',
        'bg-tertiary': '#F3F4F6',
        'text-primary': '#111827',
        'text-secondary': '#6B7280',
        'text-tertiary': '#9CA3AF',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
