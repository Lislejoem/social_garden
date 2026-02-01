import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Warm Coral palette
        grove: {
          // Primary greens (from background gradient)
          sage: "#aad895",
          green: "#49c557",
          // Action colors
          primary: "#059669",
          "primary-hover": "#047857",
          // Warm accents
          coral: "#F4A89A",
          peach: "#FFAB91",
          // Health status colors
          thriving: "#059669",
          growing: "#34D399",
          thirsty: "#EAB308",
          parched: "#F97316",
        },
        // Text colors
        ink: {
          rich: "#3D3D3D",
          muted: "#78716C",
        },
        // Surface colors
        surface: {
          warm: "#FDFCFB",
        },
      },
      fontFamily: {
        sans: ["var(--font-karla)", "system-ui", "sans-serif"],
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
        "6xl": "3rem",
      },
      backdropBlur: {
        xs: "2px",
      },
      scale: {
        "98": "0.98",
      },
    },
  },
  plugins: [],
};
export default config;
