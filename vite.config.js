import path from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
