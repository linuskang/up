import { Upstream } from "@uplabs/sdk"
import dotenv from "dotenv"
dotenv.config()

const ups = new Upstream({
  apiKey: process.env.UPSTREAM_API_KEY ?? "",
  host: process.env.UPSTREAM_HOST,
})

async function main() {
  await ups.events.ingest({
    title: "This triggered a push notification!",
    pushNotify: true,
    contextId: "contextId-example-notifications",
    contextStart: true
  })

  await ups.events.ingest({
    title: "This triggered a push notification inside of an event!",
    contextId: "contextId-example-notifications",
    pushNotify: true,
    data: {
      "test": "This is a test notification with contextId and data.",
      "contextId": "contextId-example-notifications",
      "contextStart": true
    },
    actions: [
      {
        title: "View",
        url: "https://upstream.dev",
        variant: "primary"
      },
      {
        title: "Dismiss",
        url: "https://upstream.dev",
        variant: "secondary"
      }
    ]
  })
}

main()