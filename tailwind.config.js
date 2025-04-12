/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [ 
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./dist/**/*.html",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        tertiary: "var(--tertiary)",
        dark: "var(--dark)",
      },
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
