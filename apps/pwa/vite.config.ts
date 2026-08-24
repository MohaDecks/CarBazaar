import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false,
      includeAssets: ["icon.png"],
      manifest: {
        name: "Motora",
        short_name: "Motora",
        description: "Buy and sell cars in Ethiopia",
        theme_color: "#111111",
        background_color: "#F7F8F7",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        lang: "en",
        icons: [
          {
            src: "/icon.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        navigateFallback: "/index.html",
      },
    }),
  ],
  server: {
    port: 3232,
    strictPort: true,
    host: true,
  },
  preview: {
    port: 3232,
    strictPort: true,
    host: true,
  },
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "zustand",
      "lucide-react",
      "@car-marketplace/utils",
    ],
    esbuildOptions: {
      target: "es2022",
    },
  },
  build: {
    commonjsOptions: {
      include: [/packages\/utils/, /node_modules/],
    },
  },
});
