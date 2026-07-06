import { Upstream } from "@upstreamlabs/sdk";
import dotenv from "dotenv";

dotenv.config();
const env = process.env

const upstream = new Upstream(env.UPSTREAM_API_KEY!);

async function main() {
    const result = await upstream.events.ingest(
        {
            title: "Hello, World!",
            icon: ":)",
        }
    )
    console.log(result);
}

main();