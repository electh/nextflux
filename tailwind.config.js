/** @type {import('tailwindcss').Config} */
import { heroui } from "@heroui/react";
import animate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";
import safe from "tailwindcss-safe-area";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {},
      screens: {
        // 自定义 display-mode: standalone 媒体查询
        standalone: { raw: "(display-mode: standalone)" },
      },
      boxShadow: {
        custom: "var(--shadow-custom)",
        "custom-sm": "var(--shadow-custom-sm)",
        "custom-button": "var(--shadow-custom-button)",
        "custom-inner": "var(--shadow-custom-inner)",
        "custom-cursor": "var(--shadow-custom-cursor)",
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
          "0%, 100%": { backgroundColor: "hsl(var(--heroui-content2))" },
          "50%": { backgroundColor: "hsl(var(--heroui-content4))" },
        },
      },
      animation: {
        "collapsible-down": "collapsible-down 0.2s ease-out",
        "collapsible-up": "collapsible-up 0.2s ease-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },

  darkMode: ["selector", '[class$="dark"]'],
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            divider: "rgba(17, 17, 17, 0.08)",
            default: {
              DEFAULT: "#d4d4d8",
            },
            primary: {
              50: "#E8FFEA",
              100: "#AFF0B5",
              200: "#7BE188",
              300: "#4CD263",
              400: "#23C343",
              500: "#00B42A",
              600: "#009A29",
              700: "#008026",
              800: "#006622",
              900: "#004D1C",
              DEFAULT: "#00B42A",
            },
          },
        },
        dark: {
          layout: {
            boxShadow: {
              medium:
                "0px 0px 15px 0px rgb(0 0 0 / 0.06), 0px 2px 30px 0px rgb(0 0 0 / 0.22), inset 0px 0px 1px 0px rgb(255 255 255 / 0.6)",
            },
          },
          colors: {
            divider: "rgba(255,255,255,0.06)",
            background: "#1E1E1E",
            primary: {
              50: "#004D1C",
              100: "#046625",
              200: "#0A802D",
              300: "#129A37",
              400: "#1DB440",
              500: "#27C346",
              600: "#50D266",
              700: "#7EE18B",
              800: "#B2F0B7",
              900: "#EBFFEC",
              foreground: "#FFFFFF",
              DEFAULT: "#27C346",
            },
          },
        },
        "black-dark": {
          extend: "dark",
          layout: {
            boxShadow: {
              medium:
                "0px 0px 15px 0px rgb(0 0 0 / 0.06), 0px 2px 30px 0px rgb(0 0 0 / 0.22), inset 0px 0px 1px 0px rgb(255 255 255 / 0.4)",
            },
          },
          colors: {
            // Make pure black theme very close to true black with subtle contrast
            divider: "rgba(255,255,255,0.06)",
            background: "#000000",
            // Bright light foreground for all text/icons by default
            foreground: "#FAFAFA",
            // Near-black content surfaces
            content1: "#000000", // Keep existing definition
            content2: "#0a0a0a", // Keep existing definition
            content3: "#0f0f0f", // Keep existing definition
            content4: "#151515", // Keep existing definition
            // Ensure readable text on each content surface
            "content1-foreground": "#FFFFFF",
            "content2-foreground": "#F5F5F5",
            "content3-foreground": "#F0F0F0",
            "content4-foreground": "#EAEAEA",
            primary: {
              50: "#004D1C",
              100: "#046625",
              200: "#0A802D",
              300: "#129A37",
              400: "#1DB440",
              500: "#27C346",
              600: "#50D266",
              700: "#7EE18B",
              800: "#B2F0B7",
              900: "#EBFFEC",
              foreground: "#FFFFFF",
              DEFAULT: "#27C346",
            },
            // Light neutral scale so text-default-* and icons remain readable on black
            default: {
              50: "#FAFAFA",
              100: "#F3F3F3",
              200: "#EAEAEA",
              300: "#E1E1E1",
              400: "#CFCFCF",
              500: "#B8B8B8",
              600: "#9E9E9E",
              700: "#858585",
              800: "#6B6B6B",
              900: "#545454",
              DEFAULT: "#E5E5E5",
              foreground: "#0A0A0A",
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
    safe,
  ],
};
