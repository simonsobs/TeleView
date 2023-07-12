/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    '.utils/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      colors: {
        'tvgrey': '#D1DEDE',
        'tvgreen': '#AABD8C',
        'tvorange': '#F39B6D',
        'tvpurple': '#2F2963',
        'tvblue': '#6BBAEC',
        'tvbrown' : '#330F0A',
        'tvyellow': '#daa520',
        'stopred': '#CC0202',
        'gogreen': '#549C30',
      },
    },
  },
  plugins: [],
}
