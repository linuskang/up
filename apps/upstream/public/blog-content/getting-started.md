---
title: "Getting Started with Upstream"
date: "2026-06-18"
description: "Learn how to get started with Upstream. Integrate into your app in minutes!"
---

## What is Upstream?

Upstream is a simple logging platform built for developers. It allows you to send events from your applications, search through them with powerful filtering, and manage your most critical logs with ease.

### Getting Started

To get started with Upstream, you first need to create an account.

1. Head to https://up.linus.my and create a free account, which includes 100 free events per month.
2. Create a project & API key associated with that project.

Once you have an account, you can install the Upstream SDK:

```bash
npm install upstream-sdk
```

We currently only support the npm registry, more packages are planned for other programming languages soon after we finish perfecting the product on Next.js.

### Sending Your First Event

Sending an event is straightforward:

Initialise ``upstream-sdk`` in your project:
```typescript
import { Upstream } from "upstream-sdk"

const up = new Upstream("YOUR_API_KEY")
```
That's it, your done! Start ingesting events using ``events.ingest``:

```typescript
const res = await up.events.ingest(
    {
        "title": "Hello, world!",
        "icon": "😁"
    }
)

console.log(res)
```
Your first event has been sent! View it on the Upstream dashboard. Those are the basics of sending an event. We also support all of these fields:

| Field      | Type              | Required | Example |
|------------|-------------------|----------|---------|
| `title`    | `string`          | Yes      | `"Payment Processed"` |
| `icon`     | `string`          | Yes      | `"💰"` |
| `category` | `string`          | No       | `"billing"` |
| `content`  | `string`          | No       | `"Your subscription was renewed successfully."` |
| `fields`   | `Field[]`         | No       | `[{"name":"Plan","value":"Pro"}]` |
| `events`   | `TimelineEvent[]` | No       | `[{"icon":"✅","time":"12:00 PM","content":"Subscription renewed."}]` |
| `data`     | `unknown`         | No       | `{"subscriptionId":"sub_abc123"}` |
| `actions`  | `Action[]`        | No       | `[{"title":"View Invoice","type":"default","url":"https://example.com"}]` |

## What's next?

Upstream is currently still on beta undergoing heavy development, and most features are currently still being implemented. Stay tuned for updates!

Have a feature suggestion? [Create an issue](https://github.com/linusdotmy/upstream/issues/new) on our Github repository and we'll take a look at it.

*Happy logging! 🚀*
