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
        description:
          "BitSnap is a visual storytelling and location sharing platform for learners in the Dicoding community. Similar to Instagram but specifically for moments around learning, projects, events, and other interesting experiences in the tech world.",
        theme_color: "#F6F6F6",
        icons: [
          {
            src: "./favicon.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "./favicon.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "./favicon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
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
                src: "/icons/add-story-96x96.png",
                sizes: "96x96",
                type: "image/png"
              }
            ]
          }
        ],
        screenshots: [
          {
            src: "/screenshots/desktop-home.png",
            sizes: "1280x720",
            type: "image/png",
            form_factor: "wide",
            label: "Homescreen BitSnap Desktop"
          },
          {
            src: "/screenshots/desktop-story.png",
            sizes: "1280x720",
            type: "image/png",
            form_factor: "wide",
            label: "Story Detail BitSnap Desktop"
          },
          {
            src: "/screenshots/mobile-home.png",
            sizes: "390x844",
            type: "image/png",
            form_factor: "narrow",
            label: "Homescreen BitSnap Mobile"
          },
          {
            src: "/screenshots/mobile-story.png",
            sizes: "390x844",
            type: "image/png",
            form_factor: "narrow",
            label: "Story Detail BitSnap Mobile"
          }
        ]
      },
      injectManifest: {
        swSrc: "./sw-handler.js",
        swDest: "dist/sw-handler.js",
        injectionPoint: undefined,
      },
      devOptions: {
        enabled: true,
        type: "module",
      },
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
