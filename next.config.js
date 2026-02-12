/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'localhost'],
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    UPI_ID: process.env.UPI_ID,
  }
}

module.exports = nextConfig
