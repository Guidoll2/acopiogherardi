import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* PWA Configuration */
  experimental: {
    webpackBuildWorker: true,
  },
  
  /* Headers for PWA and Service Worker */
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400', // 24 hours
          },
        ],
      },
    ];
  },
};

export default nextConfig;
