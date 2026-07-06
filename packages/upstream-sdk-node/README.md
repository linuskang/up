<p align="center">
  <img width="192" height="192" alt="192x192" src="https://github.com/user-attachments/assets/4c97f877-4fba-4146-885c-26f945bb6682" />
</p>

<h1 align="center">Upstream: Simple and open logging</h1>

<p align="center">
  <img src="https://img.shields.io/badge/upstream-v0.2.3-blue" alt="Upstream" />
  <img src="https://img.shields.io/npm/v/upstream-sdk" alt="npm version" />
  <img src="https://img.shields.io/npm/dm/upstream-sdk" alt="npm downloads" />
  <img src="https://img.shields.io/badge/license-CC_BY_NC_4.0-red" alt="License" />
  <a href="https://github.com/linuskang/up/actions/workflows/ci.yml">
    <img src="https://github.com/linuskang/up/actions/workflows/ci.yml/badge.svg" alt="Build" />
  </a>
</p>

## Quick Start

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
