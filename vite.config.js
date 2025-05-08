// vite.config.js
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VitePWA({
      strategies: "generateSW",
      registerType: "autoUpdate",
      filename: "sw.js",
      manifestFilename: "manifest.webmanifest",
      includeAssets: [
        "favicon.ico",
        "robots.txt",
        "apple-touch-icon.png",
        "icon/icon.svg",
      ],
      manifest: {
        name: "BitSnap",
        short_name: "BitSnap",
        description:
          "BitSnap is a visual storytelling and location sharing platform for learners in the Dicoding community.",
        theme_color: "#F6F6F6",
        background_color: "#F6F6F6",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/icon/icon.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
          {
            src: "/icon/icon.svg",
            sizes: "512x512",
            type: "image/svg+xml",
          },
          {
            src: "/icon/icon.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/story-api\.dicoding\.dev\/.*$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24,
              },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: /^https:\/\/unpkg\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "libs-cache",
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "images-cache",
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
    headers: {
      "Service-Worker-Allowed": "/",
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
  },
});
