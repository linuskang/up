import { ImageResponse } from "next/og"
import Image from "next/image"

export const size = {
    width: 32,
    height: 32,
}

export const contentType = "image/png"

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 22,
                    background: "#171717",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    borderRadius: "6px",
                    fontWeight: 700,
                    fontFamily: "sans-serif",
                }}
            >
                U
            </div>
        ),
        {
            ...size,
        }
    )
}
