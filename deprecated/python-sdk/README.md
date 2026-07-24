# upstream-sdk

Simple and open logging for your projects.

## Installation

```bash
pip install upstream-sdk
```

## Quick Start

```python
from upstream_sdk import Upstream, EventProps

up = Upstream("YOUR_API_KEY")

up.events.ingest(EventProps(
    title="Project Deployed",
    icon="😁",
))
```

That's just scratching the surface. You can log complex events with JSON, timeline events, descriptions, fields, and even add action buttons.

## License

MIT
