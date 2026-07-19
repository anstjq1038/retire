import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/retire/",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon-180.png"],
      manifest: {
        name: "적립 — 노후준비 트래커",
        short_name: "적립",
        description: "매달 25일, 한 주씩 쌓아서 55세에 15억",
        lang: "ko",
        start_url: "/retire/",
        scope: "/retire/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#f9f9f7",
        theme_color: "#2a78d6",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === self.location.origin,
            handler: "NetworkFirst",
            options: { cacheName: "app-shell" },
          },
        ],
        navigateFallback: "/retire/index.html",
      },
    }),
  ],
});
