import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  // disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "offlineCache",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
  ],
  fallbacks: {
    document: "/offline",
  },
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // compiler: {
  //   removeConsole: process.env.NODE_ENV === "production",
  // },
};

export default withPWA(nextConfig);
