import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    output: "standalone",
    allowedDevOrigins: [
        "localhost.linus.my",
    ],
}

export default nextConfig
