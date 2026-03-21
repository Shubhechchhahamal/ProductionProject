import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: ["favicon.ico"],

      manifest: {
        id: "/",

        name: "HomeAway",
        short_name: "HomeAway",
        description: "Peer support platform for international students",

        theme_color: "#ffffff",
        background_color: "#ffffff",

        display: "standalone",
        display_override: ["window-controls-overlay"], // ✅ THIS LINE FIXES IT

        start_url: "/",

        icons: [
          {
            src: "/pwa-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/pwa-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })

  ]
});