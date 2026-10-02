"""Thin scripted brain — swap later for an LM without rewriting the agent loop."""

from __future__ import annotations

NAME = 'Stick'


def say_hi() -> str:
    """Greeting for idle ticks or guest hellos."""
    return f'{NAME}: hi'


def narrate_visit(room_path: str, line_count: int) -> str:
    """One-line report after peeking another room."""
    path = room_path or 'somewhere'
    if line_count <= 0:
        return f'{NAME}: visiting {path} — quiet'
    noun = 'line' if line_count == 1 else 'lines'
    return f'{NAME}: visiting {path} — {line_count} {noun}'


def narrate_walking(room_path: str) -> str:
    """Optional line while en route (agent may skip posting this)."""
    path = room_path or 'somewhere'
    return f'{NAME}: walking to {path}…'
