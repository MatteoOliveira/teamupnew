/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Utilise la classe 'dark' pour activer le mode sombre
  theme: {
    extend: {
      colors: {
        // Couleurs personnalisées pour le dark mode
        background: {
          DEFAULT: 'var(--background)',
          dark: '#0a0a0a',
        },
        foreground: {
          DEFAULT: 'var(--foreground)',
          dark: '#ededed',
        },
      },
      // Transitions personnalisées pour le thème
      transitionProperty: {
        'theme': 'color, background-color, border-color, text-decoration-color, fill, stroke',
      },
    },
  },
  plugins: [],
}
