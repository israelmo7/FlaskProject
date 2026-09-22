/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#12161C',
          soft: '#2A313C',
          muted: '#5C6675',
        },
        stone: {
          DEFAULT: '#F3EEE6',
          light: '#FAF7F2',
          dark: '#E4DDD2',
        },
        teal: {
          DEFAULT: '#1F6B63',
          light: '#2F8F84',
          deep: '#154A45',
        },
        coral: {
          DEFAULT: '#D4654A',
          soft: '#E88972',
        },
        stock: {
          high: '#2F8F84',
          low: '#C9892E',
          out: '#B5453A',
        },
      },
      fontFamily: {
        display: ['Fraunces_600SemiBold'],
        displayBold: ['Fraunces_700Bold'],
        body: ['DMSans_400Regular'],
        bodyMedium: ['DMSans_500Medium'],
        bodyBold: ['DMSans_700Bold'],
      },
    },
  },
  plugins: [],
};
