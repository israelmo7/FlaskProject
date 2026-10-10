"""In-memory /data knock ring for the admin panel.

Only knocks with buffer text shorter than SIZE_LIMIT are stored.
SIZE_LIMIT is the single source used by core.routes too.
"""

from __future__ import annotations

import threading
import time
from collections import deque

# Keep in sync with core.routes — filter is "below 8".
SIZE_LIMIT = 8
_RING = 48

_lock = threading.Lock()
_events: deque[dict] = deque(maxlen=_RING)
_next_id = 0


def clear_knocks():
    """Test helper — empty the ring."""
    global _next_id
    with _lock:
        _events.clear()
        _next_id = 0


def record_knock(*, letter: str, text: str, guest: str | None = None) -> dict | None:
    """
    Store one /data letter knock if text is below SIZE_LIMIT.
    Returns the event, or None when filtered out.
    """
    global _next_id
    if not letter or not isinstance(text, str):
        return None
    if len(text) >= SIZE_LIMIT:
        return None

    who = (guest or '')[:8] or None
    with _lock:
        _next_id += 1
        ev = {
            'id': _next_id,
            'letter': letter,
            'text': text,
            'guest': who,
            'ts': time.time(),
        }
        _events.append(ev)
        return dict(ev)


def list_knocks(after_id: int = 0) -> list[dict]:
    """Recent knocks, optionally only those newer than after_id."""
    with _lock:
        if after_id <= 0:
            return [dict(e) for e in _events]
        return [dict(e) for e in _events if e['id'] > after_id]
