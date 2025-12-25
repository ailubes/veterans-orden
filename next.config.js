/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
      },
    ],
  },
  serverExternalPackages: ['postgres'],
  // Empty turbopack config to use Turbopack (Next.js 16 default)
  turbopack: {},
};

module.exports = nextConfig;
