import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: { chunkSizeWarningLimit: 1600 },
  server: {
    proxy: {
      "/api": {
        target: "https://gestion-comptable-back.vercel.app",
        changeOrigin: true,
      },
    },
  },
});
