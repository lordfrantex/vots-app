import type { NextConfig } from "next";

// next.config.js
const nextConfig: NextConfig = {
  reactStrictMode: true,
  onDemandEntries: {
    // other options...
  },
  // This suppresses hydration warnings in development
  webpack: (config, { dev }) => {
    if (dev) {
      config.optimization.minimizer = [];
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
        pathname: "/**",
      },
    ],
    domains: [
      "api.microlink.io", // Microlink Image Preview
    ],
  },
};

module.exports = nextConfig;
