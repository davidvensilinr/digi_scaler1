declare module 'next-pwa' {
  import type { NextConfig } from 'next';

  type RuntimeCaching = any[];

  export interface PWAOptions {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    runtimeCaching?: RuntimeCaching;
    buildExcludes?: Array<RegExp | string>;
    fallbacks?: Record<string, string>;
  }

  export default function withPWA(options?: PWAOptions): (nextConfig?: NextConfig) => NextConfig;
}
