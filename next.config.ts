import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ✅ Custom Webpack Config
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // ✅ Ignore Prisma instrumentation warnings
    config.ignoreWarnings = [
      { module: /@prisma\/instrumentation/ },
      { file: /@prisma\/instrumentation/ },
    ];

    return config;
  },

  // ✅ Environment Variables (safe exposure)
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // ✅ Mark Prisma as external for faster server builds
  experimental: {
    serverExternalPackages: ['@prisma/client'],
  },

  // ✅ Recommended for Prisma in App Router
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
