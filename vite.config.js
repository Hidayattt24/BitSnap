import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VitePWA({
      strategies: "injectManifest",
      registerType: "autoUpdate",
      injectRegister: "auto",
      filename: "sw-handler.js",
      manifest: {
        name: "BitSnap",
        short_name: "BitSnap",
        description: "BitSnap is a visual storytelling and location sharing platform...",
        theme_color: "#F6F6F6",
        icons: [
          {
            src: "/favicon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ],
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        shortcuts: [
          {
            name: "Tambah Story Baru",
            short_name: "Tambah Story",
            description: "Tambah story baru di BitSnap",
            url: "/add",
            icons: [
              {
                src: "/favicon.png",
                sizes: "96x96",
                type: "image/png"
              }
            ]
          }
        ]
      }
    }),
  ],
  server: {
    port: 3000,
    host: true,
    headers: {
      "Service-Worker-Allowed": "/",
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 3000,
      timeout: 30000,
      overlay: true
    }
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
  },
});
