import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
  output: "standalone",
  allowedDevOrigins: ["upstream-dev.linus.my"]
}

export default nextConfig
