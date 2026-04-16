# @linuskang/upstream-sdk

Simple Node.js SDK for sending and reading events from Upstream.

## Install

```bash
npm install @linuskang/upstream-sdk
```

## Usage

```js
const { createUpstream } = require("@linuskang/upstream-sdk");

const upstream = createUpstream({
  apiKey: process.env.UPSTREAM_API_KEY,
  // optional, defaults to https://upstream.linus.my
  // supports either server_url or serverUrl
  server_url: process.env.UPSTREAM_SERVER_URL,
});

async function run() {
  await upstream.track({
    title: "Payment failed",
    icon: "💳",
    category: "billing.payment",
    content: "Card declined for customer cus_123",
    fields: [
      { name: "Customer", value: "cus_123" },
      { name: "Amount", value: "$49.00" },
    ],
    data: {
      invoiceId: "inv_123",
      attempt: 1,
    },
  });

  const events = await upstream.getEvents({ limit: 20 });
  console.log(events.length);
}

run().catch(console.error);
```

## API

### createUpstream(options)

- `apiKey` (required): project API key (`up_...`)
- `server_url` (optional): defaults to `https://upstream.linus.my`
- `serverUrl` (optional): alias of `server_url`
- `fetch` (optional): custom fetch implementation

Returns an `UpstreamSDK` instance.

### upstream.track(event)

Posts an event to `/api/v1/events`.

Required event field:
- `title` (string)

Common optional fields:
- `icon`
- `category`
- `content`
- `fields`
- `events`
- `actions`
- `data`

### upstream.getEvents(options)

Reads events from `/api/v1/events` using the configured API key.

Optional query options:
- `limit`
- `category`
- `search`
