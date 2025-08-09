/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/app/**/*.{js,ts,jsx,tsx}",
      "./src/components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
          colors: {
            primary: '#1E40AF',      // Azul Royal
            secondary: '#10B981',    // Verde-água
            backgroundLight: '#F3F4F6', // Cinza claro
            backgroundWhite: '#FFFFFF',
            textDark: '#111827',     // Cinza escuro
          },
          fontFamily: {
            header: ['Poppins', 'sans-serif'],
            body: ['Inter', 'Roboto', 'sans-serif'],
          },
        },
    },
    plugins: [],
  }
  