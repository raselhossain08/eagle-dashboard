import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ✅ Custom Webpack Config with Performance Optimizations
  webpack: (config, { isServer, dev }) => {
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

    // ✅ Performance optimizations
    if (!dev) {
      // Split chunks for better caching
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
            },
            analytics: {
              test: /[\\/]node_modules[\\/](recharts|@tanstack)[\\/]/,
              name: 'analytics',
              priority: 10,
              chunks: 'all',
            },
          },
        },
      };
    }

    return config;
  },

  // ✅ Environment Variables (safe exposure)
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // ✅ Performance and experimental features
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
    // Enable optimized package imports
    optimizePackageImports: ['@/components', '@/hooks'],
  },

  // ✅ Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },

  // ✅ Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ✅ Enable compression
  compress: true,

  // ✅ Performance headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },

  // ✅ Recommended for Prisma in App Router
  typescript: {
    ignoreBuildErrors: false,
  },

  // ✅ Bundle analyzer (uncomment to analyze)
  // bundleAnalyzer: {
  //   enabled: process.env.ANALYZE === 'true',
  // },
};

export default nextConfig;
