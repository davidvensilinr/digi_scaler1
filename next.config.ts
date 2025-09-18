import type { NextConfig } from "next";
import withPWA from "next-pwa";

const isProd = process.env.NODE_ENV === "production";

// Runtime caching strategies for next-pwa
// Note: Types are relaxed to avoid strict type issues from Workbox typings in TS configs.
const runtimeCaching: any[] = [
  // Cache Next.js static assets
  {
    urlPattern: /^https?:\/\/[^/]+\/_next\/static\//,
    handler: "CacheFirst",
    options: {
      cacheName: "next-static-assets",
      expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
      cacheableResponse: { statuses: [0, 200] },
    },
  },
  // Optimize Next Image responses
  {
    urlPattern: /^https?:\/\/[^/]+\/_next\/image\//,
    handler: "StaleWhileRevalidate",
    options: {
      cacheName: "next-image",
      expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
      cacheableResponse: { statuses: [0, 200] },
    },
  },
  // Cloudinary images
  {
    urlPattern: /^https?:\/\/res\.cloudinary\.com\//,
    handler: "CacheFirst",
    options: {
      cacheName: "cloudinary-images",
      expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 },
      cacheableResponse: { statuses: [0, 200] },
    },
  },
  // API routes – prefer network, fall back to cache
  {
    urlPattern: ({ url }: any) => url.pathname.startsWith("/api/"),
    handler: "NetworkFirst",
    method: "GET",
    options: {
      cacheName: "api-cache",
      networkTimeoutSeconds: 3,
      expiration: { maxEntries: 100, maxAgeSeconds: 60 * 5 },
      cacheableResponse: { statuses: [0, 200] },
    },
  },
];

const nextConfig: NextConfig = {
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
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com'],
  },
  // Required for WebSocket support in API routes
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs' module on the client to prevent this error on build:
      // Module not found: Can't resolve 'fs'
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        dgram: false,
      };
    }
    return config;
  },
  // Handle API routes
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  // Environment variables that should be exposed to the client
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  },
};

export default withPWA({
  dest: "public",
  disable: !isProd, // Disable SW in development
  register: true,
  skipWaiting: true,
  runtimeCaching,
})(nextConfig);

