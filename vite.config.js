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
