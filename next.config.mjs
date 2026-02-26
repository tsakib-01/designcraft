/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  serverExternalPackages: ['mongoose', 'sharp'],
  turbopack: {
    resolveAlias: {
      canvas: { browser: './empty-module.js' },
    },
  },
};

export default nextConfig;