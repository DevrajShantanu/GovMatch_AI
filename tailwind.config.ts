import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f7f9fb",
        "on-background": "#191c1e",
        surface: "#f7f9fb",
        "on-surface": "#191c1e",
        "on-surface-variant": "#434655",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f2f4f6",
        "surface-container": "#eceef0",
        "surface-container-high": "#e6e8ea",
        "surface-container-highest": "#e0e3e5",
        "surface-bright": "#f7f9fb",
        "surface-dim": "#d8dadc",
        "surface-tint": "#0053db",
        primary: {
          DEFAULT: "#004ac6",
          container: "#2563eb",
          "on-container": "#eeefff",
          fixed: "#dbe1ff",
          "fixed-dim": "#b4c5ff",
          "on-fixed": "#00174b",
        },
        secondary: {
          DEFAULT: "#505f76",
          container: "#d0e1fb",
          "on-container": "#54647a",
          fixed: "#d3e4fe",
        },
        tertiary: {
          DEFAULT: "#005a82",
          container: "#0074a6",
          "on-container": "#e4f2ff",
        },
        outline: {
          DEFAULT: "#737686",
          variant: "#c3c6d7",
        },
        error: {
          DEFAULT: "#ba1a1a",
          container: "#ffdad6",
          "on-container": "#93000a",
        },
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
        full: "9999px",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
        "3xl": "64px",
        gutter: "24px",
        "container-max": "1280px",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      backgroundImage: {
        "ai-gradient": "linear-gradient(135deg, #2563eb 0%, #0074a6 50%, #0ea5e9 100%)",
        "ai-gradient-subtle": "linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(14,165,233,0.08) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
