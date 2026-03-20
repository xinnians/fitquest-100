import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["shared"],
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
