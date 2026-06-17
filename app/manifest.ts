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
                src: "/apple-icon",
                sizes: "180x180",
                type: "image/png",
            },
            {
                src: "/icon",
                sizes: "32x32",
                type: "image/png",
            },
            {
                src: "/logo.png",
                sizes: "any",
                type: "image/png",
            },
            {
                src: "/favicon.ico",
                sizes: "any",
                type: "image/x-icon",
            },
        ],
    }
}
