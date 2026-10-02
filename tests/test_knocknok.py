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


def test_character_brain_scripted_lines():
    from srcs.character import brain

    assert brain.say_hi() == 'Stick: hi'
    assert 'visiting lobby' in brain.narrate_visit('lobby', 0)
    assert 'quiet' in brain.narrate_visit('lobby', 0)
    assert '3 lines' in brain.narrate_visit('lobby', 3)
    assert '1 line' in brain.narrate_visit('lobby', 1)


def test_character_agent_skipped_under_testing(app):
    from srcs.character import agent as character_agent

    # TESTING + SKIP_MYSQL fixtures must not start the daemon.
    before = character_agent._started
    character_agent.start_character_agent(app)
    assert character_agent._started is before


def test_character_status_unauthorized(client):
    response = client.get('/api/character/status')
    assert response.status_code == 401
    assert response.get_json()['error'] == 'unauthorized'


def test_character_status_shape_when_allowed(client, monkeypatch):
    from srcs.api import routes as api_routes
    from srcs.character.agent import _set_status

    with client.session_transaction() as sess:
        sess['id'] = 'guesttok'

    monkeypatch.setattr(api_routes, '_may_use_character_room', lambda gid: True)
    _set_status(phase='walking', target='lobby', last_line='Stick: hi')

    response = client.get('/api/character/status')
    assert response.status_code == 200
    data = response.get_json()
    assert data['phase'] == 'walking'
    assert data['target'] == 'lobby'
    assert data['last_line'] == 'Stick: hi'
