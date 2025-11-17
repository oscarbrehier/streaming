import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  cacheComponents: true,

  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '5gb'
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        port: "",
        pathname: "/t/p/**"
      }
    ]
  }
};

export default nextConfig;
