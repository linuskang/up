import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    output: "standalone",
    allowedDevOrigins: [
        "10.0.0.194",
    ],
}

export default nextConfig
