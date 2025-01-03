/** @type {import('tailwindcss').Config} */
import { nextui } from "@nextui-org/react";
import animate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {},
      boxShadow: {
        custom: "var(--shadow-custom)",
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
        pulse: {
          "0%, 100%": { backgroundColor: "hsl(var(--nextui-content2))" },
          "50%": { backgroundColor: "hsl(var(--nextui-content4))" },
        },
      },
      animation: {
        "collapsible-down": "collapsible-down 0.2s ease-out",
        "collapsible-up": "collapsible-up 0.2s ease-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },

  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            divider: "rgba(17, 17, 17, 0.08)",
            default: {
              DEFAULT: "#e4e4e7",
            },
          },
        },
        dark: {
          colors: {
            divider: "rgba(255,255,255,0.06)",
            background: "#1E1E1E",
            primary: {
              50: "#001A4D",
              100: "#052F78",
              200: "#134CA3",
              300: "#2971CF",
              400: "#469AFA",
              500: "#5AAAFB",
              600: "#7DC1FC",
              700: "#A1D5FD",
              800: "#C6E8FE",
              900: "#EAF8FF",
              foreground: "#FFFFFF",
              DEFAULT: "#5AAAFB",
            },
          },
        },
        stone: {
          colors: {
            background: "#F3F1ED", // or DEFAULT
            foreground: "#42403B", // or 50 to 900 DEFAULT
            divider: "rgba(17, 17, 17, 0.08)",
            focus: "#D19600",
            content1: "#ffffff",
            content2: "#f5f5f4",
            content3: "#e7e5e4",
            content4: "#d6d3d1",
            primary: {
              50: "#FDF8F1",
              100: "#FBF1E3",
              200: "#F7E3C7",
              300: "#F3D6AB",
              400: "#EFCA8F",
              500: "#EBC27B",
              600: "#D19600",
              700: "#966900",
              800: "#603D00",
              900: "#301E00",
              foreground: "#FFFFFF",
              DEFAULT: "#D19600",
            },
            default: {
              50: "#fafaf9",
              100: "#f5f5f4",
              200: "#e7e5e4",
              300: "#d6d3d1",
              400: "#a8a29e",
              500: "#78716c",
              600: "#57534e",
              700: "#44403d",
              800: "#292524",
              900: "#1c1917",
              DEFAULT: "#e7e5e4",
              foreground: "#1c1917",
            },
          },
        },
      },
    }),
    animate,
    typography,
  ],
};
