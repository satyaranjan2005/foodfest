/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'localhost'],
  },
  // Environment variables are automatically loaded from .env files
  // No need to explicitly define them here for production
}

module.exports = nextConfig
