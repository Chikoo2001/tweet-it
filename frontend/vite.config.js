import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        logLevel: "debug",
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("daisyui") || id.includes("tailwindcss")) {
              return "tailwind"; // Put Tailwind and DaisyUI in a single chunk
            }
            return "vendor"; // All other node_modules go into 'vendor'
          }
        },
      },
    },
  },
});
