/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
  // Vercel optimizations
  images: {
    domains: [],
  },
  // Enable static exports for better Vercel performance
  trailingSlash: false,
  // Optimize for Vercel
  experimental: {
    optimizeCss: true,
  },
}

module.exports = nextConfig











