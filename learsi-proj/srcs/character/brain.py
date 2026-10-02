"""Command replies for Stick — swap later for an LM without rewriting handlers."""

from __future__ import annotations

NAME = 'Stick'

COMMANDS = ('go', 'send', 'read', 'wait', 'back')


def help_line() -> str:
    return f'{NAME}: commands — go <room> | read | send <text> | wait | back'


def unknown(verb: str) -> str:
    return f'{NAME}: unknown "{verb}". {help_line().split("—", 1)[-1].strip()}'


def go_ok(room_path: str) -> str:
    return f'{NAME}: went to {room_path}'


def go_missing_arg() -> str:
    return f'{NAME}: go where? try go lobby'


def go_not_found(room_path: str) -> str:
    return f'{NAME}: no room "{room_path}"'


def go_denied(room_path: str) -> str:
    return f'{NAME}: cannot go to {room_path}'


def read_need_target() -> str:
    return f'{NAME}: nowhere to read — go <room> first'


def read_quiet(room_path: str) -> str:
    return f'{NAME}: {room_path} is quiet'


def read_report(room_path: str, lines: list[str], max_show: int = 3) -> str:
    if not lines:
        return read_quiet(room_path)
    shown = lines[-max_show:]
    preview = ' | '.join(shown)
    extra = len(lines) - len(shown)
    if extra > 0:
        return f'{NAME}: read {room_path} ({len(lines)}) … {preview}'
    return f'{NAME}: read {room_path} — {preview}'


def send_need_target() -> str:
    return f'{NAME}: nowhere to send — go <room> first'


def send_need_text() -> str:
    return f'{NAME}: send what? try send hello'


def send_ok(room_path: str, text: str) -> str:
    short = text if len(text) <= 40 else text[:37] + '…'
    return f'{NAME}: sent to {room_path} — {short}'


def wait_ok(room_path: str | None) -> str:
    if room_path:
        return f'{NAME}: waiting at {room_path}'
    return f'{NAME}: waiting at home'


def back_ok() -> str:
    return f'{NAME}: back home'


def back_already() -> str:
    return f'{NAME}: already home'
