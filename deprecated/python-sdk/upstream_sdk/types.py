from dataclasses import dataclass
from typing import Any, List, Literal, Optional


@dataclass
class Field:
    name: str
    value: str


@dataclass
class TimelineEvent:
    icon: str
    time: str
    content: str


@dataclass
class Action:
    title: str
    type: Literal["default", "secondary", "ghost"]
    url: str


@dataclass
class EventProps:
    title: str
    icon: str
    created_at: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    fields: Optional[List[Field]] = None
    events: Optional[List[TimelineEvent]] = None
    data: Optional[Any] = None
    actions: Optional[List[Action]] = None
