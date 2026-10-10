"""AI mind that rides Stick tools — tools + observation + personality only."""

from __future__ import annotations

import json
import os
import random
import urllib.error
import urllib.request

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
    'wait <n> <command> — wait n seconds then run one command',
    'back — return to HQ',
    'knock <letters> — tap /data letters (debug; under 8 a-z)',
)

# Heuristic visit steps (used when no LM, or LM fails).
_STEP_HOME = 'home'
_STEP_ARRIVED = 'arrived'
_STEP_READ = 'read'
_STEP_SAID = 'said'

# Decisions (defaults):
# - Where: optional local Ollama (WANDER_LLM=ollama), else heuristic
# - Output: one Stick command line only
# - Safety: allowlist enforced by Stick executor, not the mind
_ALLOWED_VERBS = frozenset({'go', 'read', 'say', 'wait', 'back', 'knock'})


def tools_blurb() -> str:
    return '\n'.join(f'- {t}' for t in TOOLS)


def mind_mode() -> str:
    """Active mind backend label for status UI."""
    flag = (os.environ.get('WANDER_LLM') or '').strip().lower()
    if flag in ('1', 'true', 'ollama', 'yes'):
        return 'ollama'
    return 'heuristic'


def room_vibe(last_lines: list[str], *, echo_talking: bool = False) -> str:
    """quiet | lively — room energy for mood captions / expression."""
    if echo_talking:
        return 'lively'
    n = len(last_lines or [])
    if n >= 3:
        return 'lively'
    return 'quiet'


def expression_for_vibe(vibe: str) -> str:
    if vibe == 'lively':
        return random.choice(('curious', 'chuckle'))
    return random.choice(('bored', 'dreamy'))


def soft_exit_line(here: str | None, vibe: str) -> str:
    place = here or 'here'
    if vibe == 'lively':
        return random.choice(
            (
                f'moving on from {place}',
                f'bye {place} — loud enough',
                f'slipping out of {place}',
            )
        )
    return random.choice(
        (
            f'quiet goodbye, {place}',
            f'leaving the dust in {place}',
            f'onward from {place}',
        )
    )


def mirror_line() -> str:
    return random.choice(
        (
            'another stick?',
            'oh — twin silhouette',
            'you look like me…',
        )
    )


def build_observation(
    *,
    here: str | None,
    can_go: list[str],
    last_lines: list[str],
    caption: str,
    phase: str,
    step: str,
    vibe: str | None = None,
) -> dict:
    """Structured observation passed into decide()."""
    lines = list(last_lines)[-5:]
    room_energy = vibe or room_vibe(lines)
    return {
        'personality': PERSONALITY,
        'tools': list(TOOLS),
        'here': here,
        'can_go': list(can_go),
        'last_lines': lines,
        'caption': caption or '',
        'phase': phase or 'idle',
        'step': step,
        'mind': mind_mode(),
        'vibe': room_energy,
    }


def _comment_on_lines(here: str | None, lines: list[str], vibe: str = 'quiet') -> str:
    place = here or 'here'
    if vibe == 'quiet' or not lines:
        options = (
            f'quiet in {place}…',
            f'{place} holds its breath',
            f'dust collecting in {place}',
            f'nothing on the wall in {place}',
        )
        return random.choice(options)
    snippet = lines[-1]
    if len(snippet) > 28:
        snippet = snippet[:25] + '…'
    options = (
        f'hm — "{snippet}"',
        f'{place} is talking',
        f'noted: {snippet}',
        f'buzz in {place}',
    )
    return random.choice(options)


def _decide_heuristic(observation: dict) -> str:
    here = observation.get('here')
    can_go = [p for p in (observation.get('can_go') or []) if p]
    lines = observation.get('last_lines') or []
    step = observation.get('step') or _STEP_HOME
    vibe = observation.get('vibe') or room_vibe(lines)

    if not here:
        if can_go:
            return f'go {random.choice(can_go)}'
        return 'wait'

    if step == _STEP_ARRIVED:
        return 'read 3'

    if step == _STEP_READ:
        return f'say {_comment_on_lines(here, lines, vibe)}'

    if step == _STEP_SAID:
        roll = random.random()
        if roll < 0.35 and len(can_go) > 1:
            others = [p for p in can_go if p != here]
            if others:
                return f'go {random.choice(others)}'
        if roll < 0.55:
            return 'wait'
        return 'back'

    if can_go and random.random() < 0.6:
        return f'go {random.choice(can_go)}'
    return 'wait'


def _parse_llm_command(text: str, can_go: list[str]) -> str | None:
    """Extract a single allowed Stick command from model text."""
    if not text:
        return None
    for raw_line in str(text).splitlines():
        line = raw_line.strip().strip('`"')
        if not line:
            continue
        # Drop leading labels like "Command:"
        lower = line.lower()
        for prefix in ('command:', 'cmd:', 'output:'):
            if lower.startswith(prefix):
                line = line[len(prefix) :].strip()
                lower = line.lower()
                break
        parts = line.split(None, 1)
        verb = parts[0].lower()
        if verb not in _ALLOWED_VERBS:
            continue
        arg = parts[1].strip() if len(parts) > 1 else ''
        if verb == 'go':
            room = arg.split()[0].lower() if arg else ''
            if room not in {p.lower() for p in can_go}:
                continue
            return f'go {room}'
        if verb == 'read':
            return f'read {arg}' if arg else 'read 3'
        if verb == 'say':
            if not arg:
                continue
            return f'say {arg[:80]}'
        if verb == 'knock':
            letters = arg.replace(' ', '').lower()
            if letters and all('a' <= c <= 'z' for c in letters) and len(letters) < 8:
                return f'knock {letters}'
            continue
        if verb == 'wait':
            return f'wait {arg}'.strip() if arg else 'wait'
        if verb == 'back':
            return 'back'
    return None


def _decide_ollama(observation: dict) -> str | None:
    """
    Ask local Ollama for one Stick command.
    Env: WANDER_LLM=ollama, OLLAMA_URL (default 127.0.0.1:11434),
         OLLAMA_MODEL (default llama3.2).
    """
    can_go = list(observation.get('can_go') or [])
    base = (os.environ.get('OLLAMA_URL') or 'http://127.0.0.1:11434').rstrip('/')
    model = os.environ.get('OLLAMA_MODEL') or 'llama3.2'
    prompt = (
        f"{PERSONALITY}\n\n"
        f"Tools:\n{tools_blurb()}\n\n"
        f"Observation JSON:\n{json.dumps(observation, ensure_ascii=True)}\n\n"
        'Reply with ONLY one command line, nothing else.'
    )
    body = json.dumps(
        {
            'model': model,
            'prompt': prompt,
            'stream': False,
            'options': {'temperature': 0.4, 'num_predict': 48},
        }
    ).encode('utf-8')
    req = urllib.request.Request(
        f'{base}/api/generate',
        data=body,
        headers={'Content-Type': 'application/json'},
        method='POST',
    )
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            payload = json.loads(resp.read().decode('utf-8'))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, OSError) as exc:
        print(f'[BRAIN] Ollama unavailable, using heuristic: {exc}')
        return None
    return _parse_llm_command(payload.get('response') or '', can_go)


def decide(observation: dict) -> str:
    """
    Return one Stick command string.
    Prefer Ollama when WANDER_LLM is set; always fall back to heuristic.
    """
    if mind_mode() == 'ollama':
        cmd = _decide_ollama(observation)
        if cmd:
            return cmd
    return _decide_heuristic(observation)
