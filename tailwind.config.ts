import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "genie-blue": "#2C6EB4",
        "golden-lamp": "#D4AF37",
        "cloud-white": "#F4F4F9",
        "twilight-gray": "#B0B5C1",
        "midnight-navy": "#1C1C2D",
      },
    },
  },
  plugins: [],
};
export default config;
