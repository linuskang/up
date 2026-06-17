import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Upstream",
        short_name: "Upstream",
        description: "A simple logging platform built for developers.",
        start_url: "/",
        display: "standalone",
        background_color: "#0a0a0a",
        theme_color: "#0a0a0a",
        orientation: "any",
        scope: "/",
        icons: [
            {
                src: "/icon-192x192.svg",
                sizes: "any",
                type: "image/svg+xml",
            },
            {
                src: "/icon-512x512.svg",
                sizes: "any",
                type: "image/svg+xml",
            },
        ],
    }
}
