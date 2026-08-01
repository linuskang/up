import { Upstream } from "@uplabs/sdk"
import dotenv from "dotenv"

dotenv.config()

const ups = new Upstream({
  apiKey: process.env.UPSTREAM_API_KEY ?? "",
  host: process.env.UPSTREAM_HOST,
})

async function main() {
  const res = await ups.events.ingest({
    title: "Hello, World!",
  })

  console.log(res)
}

main()