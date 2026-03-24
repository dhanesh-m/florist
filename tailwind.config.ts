import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        display: ["var(--font-cormorant)", "var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        blush: {
          50: "#fdf6f5",
          100: "#f9ece9",
          200: "#f3d9d4",
          300: "#e9b9b0",
          400: "#dc9285",
          500: "#cf7060",
          600: "#bc5545",
          700: "#9d4538",
          800: "#823b32",
          900: "#6c362e",
          950: "#3a1915",
        },
        beige: {
          50: "#faf9f7",
          100: "#f5f3ef",
          200: "#e8e4dc",
          300: "#d4cdc0",
          400: "#b8ad9a",
          500: "#a39680",
          600: "#8d7e68",
          700: "#756757",
          800: "#61564a",
          900: "#51483e",
          950: "#2a2521",
        },
        gold: {
          50: "#fdfcfa",
          100: "#faf6ef",
          200: "#f0e6d6",
          300: "#e2cfb3",
          400: "#d4b88a",
          500: "#c9a56f",
          600: "#b8925a",
          700: "#96704a",
          800: "#7a5a3f",
          900: "#4a3828",
        },
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(108, 54, 46, 0.08)",
        elegant: "0 12px 40px -4px rgba(108, 54, 46, 0.12)",
        premium: "0 25px 60px -12px rgba(74, 56, 40, 0.25)",
        glow: "0 0 60px -12px rgba(188, 85, 69, 0.25)",
        "gold-soft": "0 8px 32px -4px rgba(184, 150, 80, 0.2)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "float": "float 6s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-12px) rotate(1deg)" },
        },
      },
      backgroundImage: {
        "gradient-mesh": "radial-gradient(at 40% 20%, rgba(188, 85, 69, 0.08) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(184, 150, 80, 0.06) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(245, 243, 239, 1) 0px, transparent 50%)",
        "hero-gradient": "linear-gradient(135deg, rgba(58, 25, 21, 0.97) 0%, rgba(74, 56, 40, 0.95) 50%, rgba(58, 25, 21, 0.92) 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
