import path from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.js",
      // Keep the existing manifest URL stable for installed applications.
      manifest: false,
      includeAssets: [],
      injectManifest: {
        // Preload the complete shell, including lazy article and language chunks.
        globPatterns: ["**/*.{js,css,html,woff,woff2,svg,png,ico,webmanifest}"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 750,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": ["@base-ui/react", "lucide-react"],
          "vendor-motion": ["framer-motion"],
          "vendor-data": ["axios", "dexie", "nanostores"],
          "vendor-i18n": ["i18next", "react-i18next"],
          "vendor-app": [
            "dayjs",
            "lodash",
            "m3-ripple",
            "react-virtuoso",
            "sonner",
          ],
        },
      },
    },
  },
});
