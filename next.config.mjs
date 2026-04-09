/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // ffmpeg-static, sharp, and fluent-ffmpeg must stay outside the bundle
  serverExternalPackages: ['ffmpeg-static', 'fluent-ffmpeg', 'sharp', 'archiver'],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
