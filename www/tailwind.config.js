const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    screens: {
      'sm': '480px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1440px',
      '2xl': '1680px'
    },
    fontSize: {
      'xs': '.625rem',
      'sm': '.75rem',
      'md': '.8125rem',
      'lg': '1rem',
      'xl': '1.125rem',
      '2xl': '1.25rem',
      '3xl': '1.5rem',
      '4xl': '2rem',
      '5xl': '2.25rem',
      '6xl': '2.5rem',
      '7xl': '3rem',
      '8xl': '4rem',
      '9xl': '6rem',
    },
    fontFamily: {
      sans: ['Nunito', 'sans-serif'],
      serif: ['Lora', 'serif'],
      mono: ['Red Hat Mono', 'Monaco', 'monospace']
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      card: '#FFFFFF',
      black: colors.black,
      white: colors.white,
      neutral: colors.neutral,
      default: colors.gray['100'],
      gray: colors.gray,
      stone: colors.stone,
      green: colors.green,
      red: colors.red,
      yellow: colors.yellow,
      'lynch': {
        '50': '#f4f6f7',
        '100': '#e2e8eb',
        '200': '#c8d4d9',
        '300': '#a2b6be',
        '400': '#74909c',
        '500': '#607d8b',
        '600': '#4d616d',
        '700': '#42515c',
        '800': '#3c474e',
        '900': '#353d44'
      }
    },
    extend: {
      colors: {
        'primary': '#607d8b',
        'secondary': '#74909c',
        'accent': '#4169E1', // royal blue
        'danger': '#FF6347', // tomato
        'success': '#228B22', // forest green
        'warning': '#FFD700' // gold
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '42': '10.5rem',
        '50': '12.5rem',
        '80': '20rem',
        '100': '25rem',
        'nav': '280px'
      }
    },
  },
  plugins: [],
}
