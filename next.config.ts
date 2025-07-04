import type { NextConfig } from "next";

// next.config.ts
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
    domains: ["api.microlink.io"],
    // Add error handling
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  experimental: {
    turbo: {
      loaders: {
        // Add any specific loaders if needed
      },
    },
  },
};

export default nextConfig;
