import type { Config } from "tailwindcss";
import fluid, { extract, screens, fontSize } from "fluid-tailwind";

export default {
  content: {
    files: [
      "./pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./components/**/*.{js,ts,jsx,tsx,mdx}",
      "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    extract,
  },
  theme: {
    screens,
    fontSize,
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        appBlack: "#191919",
        appGreen: "#07F307",
        appWhite: "#FCFFFC",
        appPink: "#EED7D7",
        primary: "#007FFF",
      },
    },
  },
  plugins: [fluid],
} satisfies Config;
