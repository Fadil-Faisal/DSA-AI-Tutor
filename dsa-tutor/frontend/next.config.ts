import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['reactflow'],
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts'],
  },
};

export default nextConfig;
