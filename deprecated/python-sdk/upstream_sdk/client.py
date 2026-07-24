import json
import urllib.request
from dataclasses import asdict
from typing import Optional

from .types import EventProps


class _EventsAPI:
    def __init__(self, api_key: str, host: str):
        self._api_key = api_key
        self._host = host.rstrip("/")

    def ingest(self, payload: EventProps) -> dict:
        url = f"{self._host}/api/events/ingest"
        data = asdict(payload)

        # Convert snake_case to camelCase for API compatibility
        if "created_at" in data:
            data["createdAt"] = data.pop("created_at")

        # Remove None values to keep payload clean
        data = {k: v for k, v in data.items() if v is not None}

        req = urllib.request.Request(
            url,
            data=json.dumps(data, default=str).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "x-api-key": self._api_key,
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(req) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8")
            raise Exception(f"Upstream API error ({e.code}): {body}") from e


class Upstream:
    def __init__(self, api_key: str, host: Optional[str] = None):
        self._api_key = api_key
        self._host = host or "https://up.linus.my"
        self.events = _EventsAPI(self._api_key, self._host)
