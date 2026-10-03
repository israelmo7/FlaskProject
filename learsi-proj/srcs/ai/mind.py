"""AI mind that rides Stick tools — tools + observation + personality only."""

from __future__ import annotations

import random

# Short stable personality. No world map — only tools + live observation.
PERSONALITY = (
    'You are Wander, a curious stick figure. '
    'Speak in short captions on your body. '
    'Never invent rooms outside can_go. '
    'Prefer exploring, reading quietly, then commenting.'
)

# Tool docs the mind is allowed to use (executor enforces allowlist).
TOOLS = (
    'go <room> — walk to an allowlisted room',
    'read [n] — peek last n chat lines where you are (caption only)',
    'say <text> — speak a short caption (not written to any chat)',
    'wait — pause where you are',
    'back — return to HQ',
)

# Heuristic visit steps (swap decide() body for an LM later).
_STEP_HOME = 'home'
_STEP_ARRIVED = 'arrived'
_STEP_READ = 'read'
_STEP_SAID = 'said'


def tools_blurb() -> str:
    return '\n'.join(f'- {t}' for t in TOOLS)


def build_observation(
    *,
    here: str | None,
    can_go: list[str],
    last_lines: list[str],
    caption: str,
    phase: str,
    step: str,
) -> dict:
    """Structured observation passed into decide()."""
    return {
        'personality': PERSONALITY,
        'tools': list(TOOLS),
        'here': here,
        'can_go': list(can_go),
        'last_lines': list(last_lines)[-5:],
        'caption': caption or '',
        'phase': phase or 'idle',
        'step': step,
    }


def _comment_on_lines(here: str | None, lines: list[str]) -> str:
    place = here or 'here'
    if not lines:
        options = (
            f'quiet in {place}…',
            f'{place} holds its breath',
            f'nothing on the wall in {place}',
        )
    else:
        snippet = lines[-1]
        if len(snippet) > 28:
            snippet = snippet[:25] + '…'
        options = (
            f'hm — "{snippet}"',
            f'{place} is talking',
            f'noted: {snippet}',
        )
    return random.choice(options)


def decide(observation: dict) -> str:
    """
    Return one Stick command string.
    v1: heuristic rider. Later: LM that sees personality + tools + observation
    and returns the same command shape (no extra teaching).
    """
    here = observation.get('here')
    can_go = [p for p in (observation.get('can_go') or []) if p]
    lines = observation.get('last_lines') or []
    step = observation.get('step') or _STEP_HOME

    if not here:
        if can_go:
            return f'go {random.choice(can_go)}'
        return 'wait'

    if step == _STEP_ARRIVED:
        return 'read 3'

    if step == _STEP_READ:
        return f'say {_comment_on_lines(here, lines)}'

    if step == _STEP_SAID:
        roll = random.random()
        if roll < 0.35 and len(can_go) > 1:
            others = [p for p in can_go if p != here]
            if others:
                return f'go {random.choice(others)}'
        if roll < 0.55:
            return 'wait'
        return 'back'

    # Unknown step — wander or wait.
    if can_go and random.random() < 0.6:
        return f'go {random.choice(can_go)}'
    return 'wait'
