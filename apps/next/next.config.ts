import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn-images-3.listennotes.com",
      },
    ],
  },
};

export default nextConfig;
