const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "text-neon-green","bg-neon-green","hover:shadow-neon-green",
    "text-neon-purple","bg-neon-purple","hover:shadow-neon-purple",
    "text-neon-cyan","bg-neon-cyan","hover:shadow-neon-cyan",
    "text-neon-pink","bg-neon-pink","hover:shadow-neon-pink",
    "text-neon-yellow","bg-neon-yellow","hover:shadow-neon-yellow",
    "btn-neon","card-neon","border-neon","ring-neon","glow"
  ],
  theme: {
    extend: {
      colors: {
        bg: "#000000",
        surface: "#0b0b0f",
        ink: "#e5e7eb",
        neon: {
          green: "#39ff14",
          purple: "#9d00ff",
          cyan: "#00ffff",
          pink: "#ff00ff",
          yellow: "#ffff00",
        },
        brand: {
          green: "#00FFA3",
          blue: "#00BFFF",
          purple: "#8B5CF6",
          yellow: "#FFD166",
          red: "#FF4D6D",
        },
        dark: {
          bg: "#0D0D0D",
          card: "#1A1A1A",
          border: "#2A2A2A",
        },
      },
      fontFamily: {
        sans: ["Inter", ...fontFamily.sans],
        mono: ["Fira Code", ...fontFamily.mono],
      },
      boxShadow: {
        neon: "0 0 10px rgba(57,255,20,0.6), 0 0 20px rgba(57,255,20,0.5), 0 0 40px rgba(57,255,20,0.4)",
        "neon-purple": "0 0 10px rgba(157,0,255,0.6), 0 0 20px rgba(157,0,255,0.5), 0 0 40px rgba(157,0,255,0.4)",
        "neon-cyan": "0 0 10px rgba(0,255,255,0.6), 0 0 20px rgba(0,255,255,0.5), 0 0 40px rgba(0,255,255,0.4)",
        glow: "0 0 20px rgba(0,255,163,0.3)",
      },
      dropShadow: {
        glow: "0 0 10px rgba(0,255,255,0.6)",
      },
      borderRadius: {
        xl2: "1rem",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 10px rgba(157,0,255,0.6), 0 0 20px rgba(157,0,255,0.5)" },
          "50%": { boxShadow: "0 0 20px rgba(157,0,255,0.8), 0 0 40px rgba(157,0,255,0.6)" },
        },
        "fade-up": {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2.2s ease-in-out infinite",
        "fade-up": "fade-up .35s ease-out both",
        "slide-in": "slide-in .25s ease-out both",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/line-clamp"),
  ],
};
