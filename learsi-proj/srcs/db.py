import json

from flask import session


MAX_KEY_SESSIONS = 5
ALLOWED_ROOM_COLUMNS = frozenset({'paths', 'doors'})
# Max characters kept in rooms.chat (oldest text trimmed from the front).
CHAT_CAPACITY = 4000
# Admin key id — granted only in app code, never via knock (seq is non a-z).
ADMIN_KEY_ID = 999

class Database:

    def __init__(self, app, mysql):
        with app.app_context():
            self._mysql = mysql

    def get_cur(self):
        return self._mysql.connection.cursor()

    def commitit(self):
        self._mysql.connection.commit()

    def push_data(self, table, data):
        with self.get_cur() as _cur:
            placeholders = ', '.join(['%s'] * len(data))
            _cur.execute(f"INSERT INTO {table} VALUES ({placeholders})", tuple(data))
            return _cur.fetchall()

    def get_session(self, sid):
        ans = 0
        with self.get_cur() as _cur:
            _cur.execute("SELECT * FROM sessions WHERE s = %s", (sid,))
            ans = _cur.fetchall()

            if ans != ():
                ans = ans[0][1:]

        return ans

    def set_session(self, s):
        res = 0

        if (
            len(s) == 4
            and len(s[0]) <= 32
            and len(s[1]) <= 1
            and len(s[2]) <= 13
            and len(s[3]) <= 7
            and self.get_session(s[0]) == 0
        ):
            with self.get_cur() as _cur:
                _cur.execute(
                    "INSERT INTO sessions VALUES (%s, %s, %s, %s)",
                    (s[0], s[1], s[2], s[3]),
                )
                self.commitit()
                res = 1

        return res


class Rooms_c(Database):

    def get_doors(self, rid):
        with self.get_cur() as _cur:
            _cur.execute("SELECT doors FROM rooms WHERE id = %s", (rid,))
            return _cur.fetchall()

    def get_rtype(self, rid):
        """Return rooms.rtype ('chat'|'admin'), or None if column/row missing."""
        try:
            with self.get_cur() as _cur:
                _cur.execute("SELECT rtype FROM rooms WHERE id = %s", (rid,))
                rows = _cur.fetchall()
            if rows and rows[0] and rows[0][0]:
                return str(rows[0][0])
        except Exception:
            return None
        return None

    def list_rooms(self):
        """Return [{id, path, rtype}, ...] for admin UI."""
        with self.get_cur() as _cur:
            try:
                _cur.execute("SELECT id, paths, rtype FROM rooms")
            except Exception:
                _cur.execute("SELECT id, paths FROM rooms")
            rows = _cur.fetchall()

        out = []
        for row in rows:
            rid = row[0]
            paths = row[1] or ''
            parts = [p for p in str(paths).split('.') if p]
            path = parts[0] if parts else str(rid)
            rtype = row[2] if len(row) > 2 and row[2] else (
                'admin' if path == 'admin' else 'chat'
            )
            out.append({'id': rid, 'path': path, 'rtype': rtype})
        return out

    def enter_aroom(self, path):
        rid = self.get_room(path)
        gid = session.get('id')
        if rid and gid:
            return rid[0][0], gid[:8]
        return None, None

    def get_room(self, value):
        with self.get_cur() as _cur:
            _cur.execute(
                f"SELECT id FROM rooms WHERE paths LIKE %s",
                (f'%.{value}.%',),
            )
            return _cur.fetchall()

    def get_chat_messages(self, rid):
        with self.get_cur() as _cur:
            _cur.execute(
                "SELECT chat FROM rooms WHERE id = %s",
                (rid,),
            )
            rows = _cur.fetchall()

        if not rows:
            return rows

        raw = rows[0][0]
        if raw is None:
            return (('',),)
        if isinstance(raw, (bytes, bytearray)):
            raw = raw.decode('utf-8', errors='replace')
        if isinstance(raw, str):
            try:
                parsed = json.loads(raw)
                if isinstance(parsed, str):
                    raw = parsed
            except (TypeError, ValueError, json.JSONDecodeError):
                pass
        else:
            raw = str(raw)
        return ((raw,),)

    def set_chat_messages(self, rid, message):
        """Append plain text line to rooms.chat (one string column); trim capacity."""
        rows = self.get_chat_messages(rid)
        current_chat = ""
        if rows and rows[0] and rows[0][0] is not None:
            current_chat = rows[0][0]
            if not isinstance(current_chat, str):
                current_chat = str(current_chat)

        text = (message or "").strip()
        if not text:
            return

        current_chat = current_chat + text + "\n"
        if len(current_chat) > CHAT_CAPACITY:
            current_chat = current_chat[-CHAT_CAPACITY:]

        with self.get_cur() as _cur:
            _cur.execute(
                "UPDATE rooms SET chat = %s WHERE id = %s",
                (json.dumps(current_chat), rid),
            )
            self.commitit()


class Keys_c(Database):

    def set_key(self, kid, gid):
        kses = self.get_key(kid)

        if kses is not None and kses != ():
            kses = kses[0][0].split('.')[1:-1]

            already_there = gid in kses
            if len(kses) > MAX_KEY_SESSIONS:
                kses = kses[(0 if already_there else 1):MAX_KEY_SESSIONS]

            if not already_there:
                more_sessions_by_this_guest = self.find_key_by_session(gid)

                if more_sessions_by_this_guest:
                    self.del_key_ses(more_sessions_by_this_guest, gid)

                kses = "." + ".".join(kses + [gid + '.'])

                with self.get_cur() as _cur:
                    _cur.execute(
                        "UPDATE keys_t SET sessions = %s WHERE id = %s",
                        (kses, kid),
                    )
                    self.commitit()

    def del_key_ses(self, kids, gid):
        with self.get_cur() as _cur:
            for kid in kids:
                kid_id = kid[0] if isinstance(kid, (list, tuple)) else kid
                _cur.execute(
                    "SELECT sessions FROM keys_t WHERE id = %s",
                    (str(kid_id),),
                )
                ans = _cur.fetchall()

                if len(ans) > 0:
                    parts = [part for part in ans[0][0].split('.') if part]
                    if gid in parts:
                        parts.remove(gid)
                    new_sessions = '.' + '.'.join(parts) + '.' if parts else '.'
                    _cur.execute(
                        "UPDATE keys_t SET sessions = %s WHERE id = %s",
                        (new_sessions, str(kid_id)),
                    )
                    self.commitit()

    def get_key(self, kid):
        with self.get_cur() as _cur:
            _cur.execute("SELECT sessions FROM keys_t WHERE id = %s", (kid,))
            return _cur.fetchall()

    def find_key(self, seq, equal=False):
        """Search keys by seq: exact match when equal=True, substring LIKE otherwise.

        Builtin admin key (ADMIN_KEY_ID) is never returned — knock cannot gain it.
        """
        with self.get_cur() as _cur:
            if equal:
                _cur.execute(
                    "SELECT id FROM keys_t WHERE seq = %s AND id != %s",
                    (seq, ADMIN_KEY_ID),
                )
            else:
                _cur.execute(
                    "SELECT id FROM keys_t WHERE seq LIKE %s AND id != %s",
                    (f'%{seq}%', ADMIN_KEY_ID),
                )
            return _cur.fetchall()

    def find_key_by_session(self, gid):
        """Find keys that currently hold this guest token in sessions (.gid.)."""
        with self.get_cur() as _cur:
            _cur.execute(
                "SELECT id FROM keys_t WHERE sessions LIKE %s",
                (f'%.{gid}.%',),
            )
            return _cur.fetchall()

    def grant_admin_key(self, gid):
        """Builtin-only: attach ADMIN_KEY_ID without removing other keys."""
        kses = self.get_key(ADMIN_KEY_ID)
        if kses is None or kses == ():
            return

        parts = [p for p in str(kses[0][0]).split('.') if p]
        if gid in parts:
            return

        parts.append(gid)
        if len(parts) > MAX_KEY_SESSIONS:
            parts = parts[-MAX_KEY_SESSIONS:]
        new_sessions = '.' + '.'.join(parts) + '.'

        with self.get_cur() as _cur:
            _cur.execute(
                "UPDATE keys_t SET sessions = %s WHERE id = %s",
                (new_sessions, ADMIN_KEY_ID),
            )
            self.commitit()


class Guests_c(Database):

    def update_guest(self, gid, s):

        if self.get_guest(gid): 
            with self.get_cur() as _cur:
                _cur.execute(
                    "UPDATE guests SET pocket = %s WHERE session = %s",
                    (s, gid),
                )
                self.commitit()
        else:
            print("[UP-GUEST] Error: couldnt find this guest\n")

    def add_guest(self, gid, s):
        ans = 0
        with self.get_cur() as _cur:
            _cur.execute("SELECT pocket FROM guests WHERE session = %s", (gid,))
            ans = _cur.fetchall()

            if len(ans) == 0:
                _cur.execute(
                    "INSERT INTO guests(session, pocket) VALUES (%s, %s)",
                    (gid, s),
                )
                self.commitit()

                ans = 1
                self.set_session((gid, 'k', 'session', ''))

            elif ans[0][0] != s:
                ans = 1
                self.update_guest(gid, s)

        return ans

    def get_pocket(self, gid):
        with self.get_cur() as _cur:
            _cur.execute("SELECT pocket FROM guests WHERE session = %s", (gid,))
            ans = _cur.fetchall()

        return ans if ans != () else None
    def get_guest(self, gid):
        with self.get_cur() as _cur:
            _cur.execute("SELECT * FROM guests WHERE session = %s", (gid,))
            ans = _cur.fetchall()

        return ans if ans != () else None

    def remove_all_guests(self):
        with self.get_cur() as _cur:
            _cur.execute("DELETE FROM guests")
            self.commitit()

    def list_guests(self):
        """Return [{session, pocket}, ...] for admin UI."""
        with self.get_cur() as _cur:
            _cur.execute("SELECT session, pocket FROM guests")
            rows = _cur.fetchall()
        return [
            {'session': row[0] or '', 'pocket': row[1] or ''}
            for row in rows
        ]


def get_package(app, mysql):
    return Rooms_c(app, mysql), Keys_c(app, mysql), Guests_c(app, mysql)
