"""Short visual captions for Stick (shown on the figure — never written to DB)."""

from __future__ import annotations

NAME = 'Stick'
COMMANDS = ('go', 'send', 'read', 'wait', 'back', 'say')
DEFAULT_READ_LINES = 3
MAX_READ_LINES = 20


def help_line() -> str:
    return 'Commands: go <room> | read [n] | say <text> | send <text> | wait | back'


def unknown(verb: str) -> str:
    return f'Unknown "{verb}". {help_line()}'


def go_ok(room_path: str) -> str:
    return f'At {room_path}'


def go_missing_arg() -> str:
    return 'Go where? try go lobby'


def go_not_found(room_path: str) -> str:
    return f'No room "{room_path}"'


def go_denied(room_path: str) -> str:
    return f'Cannot go to {room_path}'


def go_forbidden(room_path: str) -> str:
    return f'No key for {room_path}'


def go_not_allowed(room_path: str) -> str:
    return f'{room_path} not on my list'


def read_need_target() -> str:
    return 'Nowhere to read — go <room> first'


def read_bad_count() -> str:
    return f'read <1–{MAX_READ_LINES}>'


def read_quiet(room_path: str) -> str:
    return f'{room_path} is quiet'


def read_report(room_path: str, lines: list[str], max_show: int = DEFAULT_READ_LINES) -> str:
    if not lines:
        return read_quiet(room_path)
    n = max(1, min(int(max_show), MAX_READ_LINES))
    shown = lines[-n:]
    preview = ' · '.join(shown)
    if len(preview) > 120:
        preview = preview[:117] + '…'
    return f'{room_path} ({len(lines)}): {preview}'


def send_need_target() -> str:
    return 'Nowhere to send — go <room> first'


def send_need_text() -> str:
    return 'Send what? try send hello'


def send_ok(room_path: str, text: str) -> str:
    short = text if len(text) <= 32 else text[:29] + '…'
    return f'Sent to {room_path}: {short}'


def wait_ok(room_path: str | None) -> str:
    if room_path:
        return f'Waiting at {room_path}'
    return 'Waiting at home'


def back_ok() -> str:
    return 'At home'


def back_already() -> str:
    return 'Already home'


def say_need_text() -> str:
    return 'Say what?'


def say_ok(text: str) -> str:
    return (text or '').strip() or '…'
