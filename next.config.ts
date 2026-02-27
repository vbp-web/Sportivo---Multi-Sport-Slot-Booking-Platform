import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `http://localhost:${process.env.BACKEND_PORT || 5000}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `http://localhost:${process.env.BACKEND_PORT || 5000}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
