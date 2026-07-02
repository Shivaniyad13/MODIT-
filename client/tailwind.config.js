/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6e0ff',
          300: '#b3c7ff',
          400: '#85a3ff',
          500: '#5275ff',
          600: '#3b55e6',
          700: '#2c3ebf',
          800: '#253299',
          900: '#212c7a',
          950: '#141847',
        },
        dark: {
          50: '#f6f6f7',
          100: '#eef0f2',
          200: '#dcdfe4',
          300: '#bfc5ce',
          400: '#9fa8b6',
          500: '#7e8b9d',
          600: '#647285',
          700: '#4f5b6b',
          800: '#262930',
          900: '#1a1c23',
          950: '#0f1115',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
