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
        // Grove color palette (clean editorial aesthetic)
        grove: {
          // Greens
          lightGreen: "#aad895",
          vibrantGreen: "#49c557",
          deepEmerald: "#059669",
          // Warm accents
          softPeach: "#f4a89a",
          brightPeach: "#ffab91",
          // Health status colors (2-tier system)
          flourishing: "#49c557",
          dormant: "#ffab91",
          // Action colors
          primary: "#059669",
          "primary-hover": "#047857",
          // DEPRECATED: Old color aliases for backward compatibility
          sage: "#aad895",
          green: "#49c557",
          coral: "#f4a89a",
          peach: "#ffab91",
          thriving: "#059669",
          growing: "#34d399",
          thirsty: "#eab308",
          parched: "#f97316",
        },
        // Text colors
        ink: {
          rich: "#3d3d3d",
          muted: "#78716c",
        },
        // Surface colors
        surface: {
          offWhite: "#fdfcfb",
          // DEPRECATED: Old alias for backward compatibility
          warm: "#fdfcfb",
        },
      },
      fontFamily: {
        sans: ["var(--font-karla)", "system-ui", "sans-serif"],
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
      },
      borderRadius: {
        card: "1.75rem",
        feature: "2.5rem",
        "4xl": "2rem",
        "5xl": "2.5rem",
        "6xl": "3rem",
      },
      boxShadow: {
        card: "0 4px 12px rgba(0,0,0,0.02)",
        feature: "0 20px 40px -15px rgba(73,197,87,0.12)",
      },
      scale: {
        "98": "0.98",
      },
    },
  },
  plugins: [],
};
export default config;
