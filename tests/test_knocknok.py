import pytest
from flask import Flask

from srcs import create_app
from srcs.core.routes import is_valid_knock_letter, should_reset_knock_buffer
from srcs.db import ADMIN_KEY_ID, Keys_c, Rooms_c


@pytest.fixture
def app():
    return create_app({'TESTING': True, 'SECRET_KEY': 'test', 'SKIP_MYSQL': True})


@pytest.fixture
def client(app):
    return app.test_client()


def test_create_app(app):
    assert app.config['TESTING'] is True
    assert app.config['SKIP_MYSQL'] is True


def test_gindex_renders(client):
    response = client.get('/')
    assert response.status_code == 200
    assert b'Welcome' in response.data
    assert b'/data/' in response.data


def test_admin_shortcut_gone(client):
    """admin_bp removed; /admin is not a Flask route anymore."""
    response = client.get('/admin/')
    assert response.status_code == 404


@pytest.mark.parametrize(
    "letter,expected",
    [
        ('a', True),
        ('z', True),
        ('A', False),
        ('ab', False),
        ('1', False),
    ],
)
def test_is_valid_knock_letter(letter, expected):
    assert is_valid_knock_letter(letter) is expected


def test_should_reset_knock_buffer_when_empty(app):
    with app.test_request_context():
        assert should_reset_knock_buffer(None) is True


def test_should_reset_knock_buffer_when_input_full(app):
    with app.test_request_context():
        mvars = {'buffer': {'input': 'abcdefgh', 'output': '', 'used': 1}}
        assert should_reset_knock_buffer(mvars) is True


def test_should_reset_knock_buffer_keeps_partial(app):
    with app.test_request_context():
        mvars = {'buffer': {'input': 'ab', 'output': 'XY', 'used': 0}}
        assert should_reset_knock_buffer(mvars) is False


def test_data_root_flushes_buffer(client, app):
    with client.session_transaction() as sess:
        sess['mvars'] = {
            'user': {'id': 1, 'seq': 'XYZ', 'used': 0},
            'buffer': {'input': 'abc', 'output': 'XYZ', 'used': 0},
        }
        sess['id'] = 'guesttoken123'

    response = client.get('/data/')
    assert response.status_code == 200
    body = response.get_data(as_text=True)
    assert len(body) == 1
    assert response.headers.get('Content-Type', '').startswith('text/plain')

    with client.session_transaction() as sess:
        assert sess['mvars']['buffer']['input'] == ''
        assert sess['mvars']['buffer']['output'] == ''
        # Guest identity is preserved across knock-buffer flush.
        assert sess['id'] == 'guesttoken123'


def test_data_root_with_flag_returns_challenge_without_flush(client, app):
    with client.session_transaction() as sess:
        sess['mvars'] = {
            'user': {'id': 1, 'seq': 'XYZ', 'used': 0},
            'buffer': {'input': 'abc', 'output': 'XYZ', 'used': 0},
        }
        sess['id'] = 'guesttoken123'
        sess['show_challenge'] = True

    response = client.get('/data/')
    assert response.status_code == 200
    assert response.get_data(as_text=True) == 'Z'

    with client.session_transaction() as sess:
        assert sess['mvars']['buffer']['input'] == 'abc'
        assert sess['mvars']['buffer']['output'] == 'XYZ'
        assert sess['mvars']['buffer']['used'] == 1
        assert sess.get('show_challenge') is None
        assert sess['id'] == 'guesttoken123'


class FakeCursor:
    def __init__(self, results=None):
        self.results = results or []
        self.query = None
        self.params = None

    def execute(self, query, params=None):
        self.query = query
        self.params = params

    def fetchall(self):
        return self.results

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False


class FakeConnection:
    def __init__(self, cursor):
        self._cursor = cursor

    def cursor(self):
        return self._cursor

    def commit(self):
        return None


class FakeMySQL:
    def __init__(self, cursor):
        self.connection = FakeConnection(cursor)


def test_find_key_partial_match():
    cursor = FakeCursor(results=[(1,), (2,)])
    app = Flask(__name__)
    keys = Keys_c(app, FakeMySQL(cursor))

    result = keys.find_key('ab', equal=False)

    assert result == [(1,), (2,)]
    assert 'LIKE' in cursor.query
    assert cursor.params == ('%ab%', ADMIN_KEY_ID)
    assert 'id !=' in cursor.query


def test_find_key_exact_match():
    cursor = FakeCursor(results=[(1,)])
    app = Flask(__name__)
    keys = Keys_c(app, FakeMySQL(cursor))

    result = keys.find_key('abc', equal=True)

    assert result == [(1,)]
    assert 'seq = %s' in cursor.query
    assert cursor.params == ('abc', ADMIN_KEY_ID)


def test_find_key_by_session():
    cursor = FakeCursor(results=[(1,)])
    app = Flask(__name__)
    keys = Keys_c(app, FakeMySQL(cursor))

    result = keys.find_key_by_session('AbCdEfGh')

    assert result == [(1,)]
    assert 'sessions LIKE' in cursor.query
    assert cursor.params == ('%.AbCdEfGh.%',)


def test_get_room_reads_rooms_doors():
    cursor = FakeCursor(results=[('1.2.',)])
    app = Flask(__name__)
    rooms = Rooms_c(app, FakeMySQL(cursor))

    result = rooms.get_doors(1)

    assert result == [('1.2.',)]
    assert 'FROM rooms' in cursor.query
    assert cursor.params == (1,)


def test_get_room_returns_rows_once():
    """Regression: debug print must not consume cursor before return."""

    class ConsumingCursor(FakeCursor):
        def fetchall(self):
            rows = list(self.results)
            self.results = []
            return rows

    cursor = ConsumingCursor(results=[(1,)])
    app = Flask(__name__)
    rooms = Rooms_c(app, FakeMySQL(cursor))

    result = rooms.get_room('lobby')

    assert result == [(1,)]
    assert 'FROM rooms' in cursor.query
    assert cursor.params == ('%.lobby.%',)


def test_knock_without_db_does_not_crash(client):
    """SKIP_MYSQL leaves keys_c as 0; knock must redirect, not 500."""
    response = client.get('/data/a', follow_redirects=False)
    assert response.status_code in (301, 302)
    assert '/data/' in response.headers.get('Location', '')


def test_set_chat_messages_appends_plain_text():
    import json

    cursor = FakeCursor(results=[(json.dumps('old\n'),)])
    app = Flask(__name__)
    rooms = Rooms_c(app, FakeMySQL(cursor))

    rooms.set_chat_messages(1, 'hello')

    assert 'UPDATE rooms SET chat' in cursor.query
    stored = json.loads(cursor.params[0])
    assert stored == 'old\nhello\n'
    assert cursor.params[1] == 1


def test_character_brain_command_lines():
    from srcs.character import brain

    assert 'go <room>' in brain.help_line()
    assert brain.go_ok('lobby') == 'At lobby'
    assert 'quiet' in brain.read_quiet('lobby')
    assert 'Sent to lobby' in brain.send_ok('lobby', 'hello')
    assert brain.back_ok() == 'At home'


def test_character_parse_command():
    from srcs.character.agent import parse_command

    assert parse_command('go lobby') == ('go', 'lobby')
    assert parse_command('SEND hi there') == ('send', 'hi there')
    assert parse_command('  wait  ') == ('wait', '')
    assert parse_command('read 5') == ('read', '5')
    assert parse_command('') == (None, '')


def test_character_handle_command_go_read_back():
    from srcs.character import agent as character_agent

    class FakeRooms:
        def __init__(self):
            self.rooms = [
                {'id': 1, 'path': 'lobby', 'rtype': 'chat'},
                {'id': 2, 'path': 'character', 'rtype': 'character'},
                {'id': 3, 'path': 'garden', 'rtype': 'chat'},
            ]
            self.chats = {
                1: 'hello\nworld\nthird\n',
                2: '{"allow":["lobby","garden","studio"]}',
                3: '',
            }

        def list_rooms(self):
            return list(self.rooms)

        def get_room(self, value):
            for r in self.rooms:
                if r['path'] == value:
                    return ((r['id'],),)
            return ()

        def get_chat_messages(self, rid):
            return ((self.chats.get(rid, ''),),)

        def set_chat_messages(self, rid, message):
            self.chats[rid] = self.chats.get(rid, '') + message + '\n'

    rooms = FakeRooms()
    gid = 'guest001'
    character_agent._status_by_guest.clear()

    def can_enter(rid):
        return rid in (1, 3)

    assert 'At lobby' in character_agent.handle_command(
        rooms, 'go lobby', gid, can_enter
    )
    assert character_agent.get_status(gid)['target'] == 'lobby'
    # No write to character room chat (allowlist intact).
    assert rooms.chats[2] == '{"allow":["lobby","garden","studio"]}'

    reply = character_agent.handle_command(rooms, 'read 2', gid, can_enter)
    assert 'lobby' in reply and 'world' in reply and 'third' in reply
    assert 'hello' not in reply  # only last 2

    assert 'Sent to lobby' in character_agent.handle_command(
        rooms, 'send knock knock', gid, can_enter
    )
    assert 'Stick: knock knock' in rooms.chats[1]

    assert 'Waiting at lobby' in character_agent.handle_command(
        rooms, 'wait', gid, can_enter
    )
    assert 'At home' in character_agent.handle_command(
        rooms, 'back', gid, can_enter
    )
    assert character_agent.get_status(gid)['target'] is None


def test_character_go_requires_guest_key_and_allowlist():
    from srcs.character import agent as character_agent

    class FakeRooms:
        def list_rooms(self):
            return [
                {'id': 1, 'path': 'lobby', 'rtype': 'chat'},
                {'id': 999, 'path': 'adminPanel', 'rtype': 'admin'},
            ]

        def get_room(self, value):
            if value == 'character':
                return ((2,),)
            return ()

        def get_chat_messages(self, rid):
            if rid == 2:
                return (('{"allow":["lobby"]}',),)
            return (('',),)

        def set_chat_messages(self, rid, message):
            raise AssertionError('character chat must stay unread for commands')

    rooms = FakeRooms()
    gid = 'guest002'
    character_agent._status_by_guest.clear()

    # adminPanel not on allowlist
    assert 'not on my list' in character_agent.handle_command(
        rooms, 'go adminPanel', gid, lambda rid: True
    )
    # lobby on allowlist but guest has no key
    assert 'No key' in character_agent.handle_command(
        rooms, 'go lobby', gid, lambda rid: False
    )


def test_character_agent_noop_under_testing(app):
    from srcs.character import agent as character_agent

    character_agent.start_character_agent(app)


def test_character_status_unauthorized(client):
    response = client.get('/api/character/status')
    assert response.status_code == 401
    assert response.get_json()['error'] == 'unauthorized'


def test_character_status_shape_when_allowed(client, monkeypatch):
    from srcs.api import routes as api_routes
    from srcs.character import agent as character_agent

    with client.session_transaction() as sess:
        sess['id'] = 'guesttok'

    monkeypatch.setattr(api_routes, '_may_use_character_room', lambda gid: True)
    character_agent._set_status(
        'guesttok', phase='walking', target='lobby', caption='Walking…'
    )

    response = client.get('/api/character/status')
    assert response.status_code == 200
    data = response.get_json()
    assert data['phase'] == 'walking'
    assert data['target'] == 'lobby'
    assert data['caption'] == 'Walking…'


def test_character_command_endpoint_empty(client, monkeypatch):
    from srcs.api import routes as api_routes

    with client.session_transaction() as sess:
        sess['id'] = 'guesttok'
    monkeypatch.setattr(api_routes, '_may_use_character_room', lambda gid: True)

    response = client.post(
        '/api/character/command',
        json={'message': ''},
    )
    assert response.status_code == 400


def test_admin_grant_key_unauthorized(client):
    response = client.post(
        '/api/admin/grant-admin-key',
        json={'session': 'abcd1234'},
    )
    assert response.status_code == 401


def test_admin_grant_key_forbidden(client, monkeypatch):
    from srcs.api import routes as api_routes

    with client.session_transaction() as sess:
        sess['id'] = 'admintry'
    monkeypatch.setattr(api_routes, '_may_use_admin_panel', lambda gid: False)

    response = client.post(
        '/api/admin/grant-admin-key',
        json={'session': 'abcd1234'},
    )
    assert response.status_code == 403


def test_admin_grant_key_success(client, monkeypatch):
    from srcs.api import routes as api_routes
    from srcs.db import ADMIN_KEY_ID

    calls = {}

    class FakeKeys:
        def set_key(self, kid, gid):
            calls['set_key'] = (kid, gid)

    class FakeGuests:
        def get_guest(self, gid):
            return (('row',) if gid == 'abcd1234' else None)

        def update_guest(self, gid, pocket):
            calls['update'] = (gid, pocket)

        def list_guests(self):
            return []

    with client.session_transaction() as sess:
        sess['id'] = 'adminusr'
    monkeypatch.setattr(api_routes, '_may_use_admin_panel', lambda gid: True)
    monkeypatch.setattr(api_routes, 'keys_c', FakeKeys())
    monkeypatch.setattr(api_routes, 'guests_c', FakeGuests())

    response = client.post(
        '/api/admin/grant-admin-key',
        json={'session': 'abcd1234xxxx'},
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data['ok'] is True
    assert data['session'] == 'abcd1234'
    assert data['key'] == ADMIN_KEY_ID
    assert calls['set_key'] == (ADMIN_KEY_ID, 'abcd1234')
    assert calls['update'] == ('abcd1234', str(ADMIN_KEY_ID))
