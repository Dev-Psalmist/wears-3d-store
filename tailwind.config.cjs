/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#060607',
        ember: '#FF6B2C',
        bone: '#E9E5DC',
        ash: '#8B8B90',
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', 'Helvetica', 'Inter', 'system-ui', 'Arial', 'sans-serif'],
        serif: ['"Times New Roman"', 'Georgia', 'serif'],
      },
      letterSpacing: {
        widest2: '0.32em',
      },
      transitionTimingFunction: {
        silk: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
