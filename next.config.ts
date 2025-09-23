import type { NextConfig } from "next";
import withPWA from "next-pwa";

// Check the current environment
const isProd = process.env.NODE_ENV === 'production';

// Log the current environment
console.log(`[PWA] Running in ${isProd ? 'production' : 'development'} mode`);

// Log PWA status
console.log(`[PWA] PWA is ${isProd ? 'enabled' : 'disabled'}`);

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

const pwaConfig = {
  dest: 'public',
  disable: !isProd, // Only enable in production
  register: true,
  skipWaiting: true,
  runtimeCaching,
  fallbacks: {
    document: '/offline',
    image: '/icons/icon-192x192.png',
  },
  // PWA configuration
  buildExcludes: [
    /middleware-manifest\.json$/, 
    /_middleware\.js$/, 
    /middleware\.js$/, 
    /middleware\.mjs$/,
    /^.+?_middleware\..+?$/, 
    /\/api\/.*/,
    /_buildManifest\.js$/,  // Exclude build manifest
    /_ssgManifest\.js$/,   // Exclude SSG manifest
  ],
  // Enable PWA features
  dynamicStartUrl: true,
  reloadOnOnline: true,
  // Cache control
  cacheOnFrontEndNav: true,
  // Disable dev logs in production
  disableDevLogs: isProd,
  // Additional PWA configuration
  publicExcludes: ['!sitemap.xml', '!robots.txt'],
  // Don't cache the following routes
  exclude: [
    /\/_next\/static\/chunks\/pages\/_error\.js$/, // Exclude error page
    /\/_next\/static\/chunks\/pages\/404\.js$/,    // Exclude 404 page
    /\/_next\/static\/chunks\/pages\/500\.js$/,    // Exclude 500 page
  ],
  // Explicitly set the precache manifest filename
  sw: 'sw.js',
  // Disable precaching in development
  disablePrecaching: !isProd,
};

const withPWAConfig = withPWA(pwaConfig);

// Apply the PWA configuration to Next.js config
export default withPWAConfig(nextConfig);

