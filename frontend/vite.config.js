import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      manifest: {
        name: "Chat App",
        short_name: "App",
        description: "My MERN Application",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",

        icons: [
          {
            src: "/chaticon.jpg",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/chaticon.jpg",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
    build: {
    // Set the limit to 1000 KiB
    chunkSizeWarningLimit: 1000,
  },
});