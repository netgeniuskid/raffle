/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
  // Optimize for Railway's memory constraints
  experimental: {
    memoryBasedWorkersCount: true,
  },
  // Disable static optimization to reduce memory usage
  output: 'standalone',
  // Reduce memory usage during build
  webpack: (config, { isServer, dev }) => {
    // Reduce memory usage
    config.optimization.minimize = true;
    config.optimization.splitChunks = {
      chunks: 'all',
      minSize: 20000,
      maxSize: 244000,
      cacheGroups: {
        default: {
          minChunks: 1,
          priority: -20,
          reuseExistingChunk: true,
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: -10,
          chunks: 'all',
          maxSize: 244000,
        },
      },
    };
    
    // Reduce memory usage during build
    if (!isServer) {
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }
    
    return config;
  },
  // Disable image optimization to save memory
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig











