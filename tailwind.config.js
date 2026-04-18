/** @type {import('tailwindcss').Config} */
import animate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";
import safe from "tailwindcss-safe-area";

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {},
      screens: {
        // 自定义 display-mode: standalone 媒体查询
        standalone: { raw: "(display-mode: standalone)" },
      },
      boxShadow: {
        custom: "var(--shadow-custom)",
        "custom-md": "var(--shadow-custom-md)",
        "custom-inner": "var(--shadow-custom-inner)",
        "custom-btn": "var(--shadow-custom-btn)",
      },
      keyframes: {
        "collapsible-down": {
          from: {
            height: "0",
            opacity: "0.3",
          },
          to: {
            height: "var(--radix-collapsible-content-height)",
            opacity: "1",
          },
        },
        "collapsible-up": {
          from: {
            height: "var(--radix-collapsible-content-height)",
            opacity: "1",
          },
          to: {
            height: "0",
            opacity: "0.3",
          },
        },
      },
      animation: {
        "collapsible-down": "collapsible-down 0.2s ease-out",
        "collapsible-up": "collapsible-up 0.2s ease-out",
      },
    },
  },

  darkMode: ["selector", '[class$="dark"]'],
  plugins: [animate, typography, safe],
};
