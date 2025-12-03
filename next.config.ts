import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Ignorujemy błędy typów przy budowaniu
    ignoreBuildErrors: true,
  },
  eslint: {
     // Ignorujemy błędy lintera przy budowaniu
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;