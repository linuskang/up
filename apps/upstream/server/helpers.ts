import { createHash, randomBytes } from "crypto";

export function GenerateSecret() {
    return `up_${randomBytes(24).toString("base64url")}`;
}

export function HashSecret(secret: string) {
    return createHash("sha256").update(secret).digest("hex");
}

export function GetRequestKey(request: Request) {
    const authHeader = request.headers.get("authorization");

    if (authHeader?.toLowerCase().startsWith("bearer ")) {
        return authHeader.slice(7).trim();
    }

    return request.headers.get("x-api-key")?.trim() || "";
}
