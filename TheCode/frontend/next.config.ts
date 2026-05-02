import type { NextConfig } from "next";

const nextConfig = {
  experimental: {
    turbo: {
      root: __dirname,
    },
  },
} as unknown as NextConfig;

export default nextConfig;
