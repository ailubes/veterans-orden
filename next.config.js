const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

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
      {
        protocol: 'https',
        hostname: 's3-storage.spiceup.online',
      },
    ],
  },
  serverExternalPackages: ['postgres'],
  // Empty turbopack config to use Turbopack (Next.js 16 default)
  turbopack: {},
};

module.exports = withNextIntl(nextConfig);
