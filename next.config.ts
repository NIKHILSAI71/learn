import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.devtool = 'cheap-module-source-map';
    }
    return config;
  },
  compress: true,
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
