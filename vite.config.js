import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'sw.js',
      registerType: 'prompt',
      injectRegister: null,
      manifest: {
        name: "BitSnap",
        short_name: "BitSnap",
        description: "BitSnap is a visual storytelling and location sharing platform",
        theme_color: "#2563EB",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/index.html",
        icons: [
          {
            src: "icons/icon-72x72.png",
            sizes: "72x72",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "icons/icon-96x96.png",
            sizes: "96x96",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "icons/icon-128x128.png",
            sizes: "128x128",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "icons/icon-144x144.png",
            sizes: "144x144",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "icons/icon-152x152.png",
            sizes: "152x152",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "icons/icon-384x384.png",
            sizes: "384x384",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ],
        shortcuts: [
          {
            name: "Tambah Story Baru",
            short_name: "Tambah Story",
            description: "Tambah story baru di BitSnap",
            url: "/add",
            icons: [
              {
                src: "icons/icon-96x96.png",
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
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true
  }
});
