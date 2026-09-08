from flask import session


MAX_KEY_SESSIONS = 5
ALLOWED_ROOM_COLUMNS = frozenset({'paths', 'doors'})
CHAT_CAPACITY = 32

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

    def enter_aroom(self, path):
        rid = self.check_room(path, "paths")
        gid = session.get('id')
        if rid and gid:
            return rid[0][0], gid[:8]
        return None, None

    def check_room(self, r, column):
        if column not in ALLOWED_ROOM_COLUMNS:
            return None

        with self.get_cur() as _cur:
            _cur.execute(
                f"SELECT id FROM rooms WHERE {column} LIKE %s",
                (f'%.{r}.%',),
            )
            return _cur.fetchall()
    def get_chat_messages(self, rid):
        with self.get_cur() as _cur:
            _cur.execute(
                "SELECT chat FROM rooms WHERE id = %s",
                (rid,),
            )
            return _cur.fetchall()

    def set_chat_messages(self, rid, message):

        if len(current_chat) < CHAT_CAPACITY:
            currrent_chat += message + "\n"

        else:
            current_chat = current_chat[8::1] + message + "\n"

        with rooms_c.get_cur() as _cur:
           cur.execute(
                "UPDATE rooms SET chat = %s WHERE id = %s",
                (current_chat, room_id),
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
        """Search keys by seq: exact match when equal=True, substring LIKE otherwise."""
        with self.get_cur() as _cur:
            if equal:
                _cur.execute("SELECT id FROM keys_t WHERE seq = %s", (seq,))
            else:
                _cur.execute("SELECT id FROM keys_t WHERE seq LIKE %s", (f'%{seq}%',))
            return _cur.fetchall()

    def find_key_by_session(self, gid):
        """Find keys that currently hold this guest token in sessions (.gid.)."""
        with self.get_cur() as _cur:
            _cur.execute(
                "SELECT id FROM keys_t WHERE sessions LIKE %s",
                (f'%.{gid}.%',),
            )
            return _cur.fetchall()


class Guests_c(Database):

    def update_guest(self, gid, s):
        current_pocket = self.get_guest(gid)
        if current_pocket and current_pocket != ():
            current_pocket = current_pocket[0][0]
            while (len(current_pocket) + len(s)) > CHAT_CAPACITY:
                current_pocket = current_pocket[current_pocket[1::1].find(".")::1]

            current_pocket += s
            with self.get_cur() as _cur:
                _cur.execute(
                    "UPDATE guests SET pocket = %s WHERE session = %s",
                    (current_pocket, gid),
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

    def get_guest(self, gid):
        with self.get_cur() as _cur:
            _cur.execute("SELECT pocket FROM guests WHERE session = %s", (gid,))
            ans = _cur.fetchall()

        return ans if ans != () else None


def get_package(app, mysql):
    return Rooms_c(app, mysql), Keys_c(app, mysql), Guests_c(app, mysql)
