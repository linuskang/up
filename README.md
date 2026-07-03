<p align="center">
  <img width="192" height="192" alt="192x192" src="https://github.com/user-attachments/assets/4c97f877-4fba-4146-885c-26f945bb6682" />
</p>

<h1 align="center">Upstream</h1>

<p align="center">
  <img src="https://img.shields.io/badge/upstream-v0.2.2-blue" alt="Upstream" />
  <img src="https://img.shields.io/npm/v/upstream-sdk" alt="npm version" />
  <img src="https://img.shields.io/npm/dm/upstream-sdk" alt="npm downloads" />
  <img src="https://img.shields.io/badge/license-CC_BY_NC_4.0-red" alt="License" />
  <a href="https://github.com/linuskang/up/actions/workflows/ci.yml">
    <img src="https://github.com/linuskang/up/actions/workflows/ci.yml/badge.svg" alt="Build" />
  </a>
</p>

This is a passion project I've been developing for the past few months, and using it internally across my apps. I needed a simple logging platform that was quick to setup for new projects, had awesome logging capabilities, and beautiful UI. This is what I came up with and the whole reason why Upstream exists: **simple logging for audit logs in a easy to view panel**.

Basically, Upstream is a easy way to integrate logging into your own applications. It takes minutes to setup - you create a account, project, API key, and integrate it with your project using my SDK.

<img width="1058" height="1161" alt="image" src="https://github.com/user-attachments/assets/dca4b617-ec34-46d1-a48a-5c33305d4536" />

### Check out the homepage at https://up.linus.my/home

## I want to try Upstream!

1. Go to https://up.linus.my and register an API key for your project.
2. Install ``upstream-sdk``
```bash
npm i upstream-sdk
```
3. Start ingesting events, below is an example.

```ts
import { Upstream } from 'upstream-sdk'

const up = new Upstream("YOUR_API_KEY")

up.events.ingest({
    title: "Project Deployed",
    icon: "😁",
});
```

That's just scratching the surface. You can log complex events with json, events, descriptions, fields, and even add action buttons.

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

Additionally, you can install Upstream on your phone or device as a PWA app at https://up.linus.my/install.

If you need help getting started with ``upstream-sdk``, check out [linusdotmy/upstream-playground](https://github.com/linusdotmy/upstream-playground)

## What's so different about Upstream compared to other platforms like Seq?

Seq and Datadog are designed for the product analytics space. They ingest large volumes of events and provide powerful querying capabilities & statistics for your application.

Upstream is designed for the critical logs/events space with a beautiful, intuitive experience for viewing and querying your most important events on the fly. You can use Upstream for your product's audit logs, triggering workflows, and logging complex events.

To sum up, Upstream has:

- Arguably the better UI for querying events on the go, especially for mobile.
- Full API, easily ingest and query logs from your apps.
- Action buttons and contextIds are our main differentiators.
- Built for easy integration with your apps, no complex setup required.
- Upstream was built to easily view your most critical logs on the fly, with a expressive interface. If you don't need easy access to important logs, Upstream isn't for you.

## How about contributing?

Thanks for considering to help this project. You can read the contributing.md to get a local dev server running and make some cool features, however I'm not currently accepting outside contributions as Upstream is still in early phases of development. If you have a feature request, feel free to open a issue.

## License

Upstream & everything in this repository is licensed under **CC BY-NC 4.0**.

**This means you can:**

- ✅ Share — copy and redistribute the material in any medium or format
- ✅ Adapt — remix, transform, and build upon the material

**As long as you:**

- ✅ Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.
- ❌ NonCommercial — You may not use the material for commercial purposes.
- ❌ No additional restrictions — You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.

Please see the [license file](LICENSE) for more information.

Built with ❤️ by [Linus Kang](https://github.com/linuskang)
