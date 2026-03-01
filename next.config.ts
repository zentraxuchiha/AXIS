import type { NextConfig } from "next";

const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  // Turbopack config (used when running next dev --turbo)
  turbopack: {},
  // Tell Next.js to pre-bundle these heavy packages instead of resolving
  // them file-by-file on every cold route visit
  experimental: {
    optimizePackageImports: [
      '@tiptap/react',
      '@tiptap/starter-kit',
      '@tiptap/extension-color',
      '@tiptap/extension-text-style',
      '@tiptap/extension-underline',
      'three',
      'swr',
      'mongoose',
    ],
  },
};

export default withPWA(nextConfig);
