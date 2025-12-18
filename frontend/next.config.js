/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['source.unsplash.com', 'cdn.pixabay.com'],
  },
  // Agregá esto aquí abajo:
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig