import pytest
from flask import Flask

from srcs import create_app
from srcs.core.routes import is_valid_knock_letter, should_reset_knock_buffer
from srcs.db import Keys_c, Rooms_c


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


def test_admin_route_without_session(client):
    response = client.get('/admin/')
    assert response.status_code == 200
    assert b'You Got it!' in response.data


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
    assert len(response.get_data(as_text=True)) == 1

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
    assert cursor.params == ('%ab%',)


def test_find_key_exact_match():
    cursor = FakeCursor(results=[(1,)])
    app = Flask(__name__)
    keys = Keys_c(app, FakeMySQL(cursor))

    result = keys.find_key('abc', equal=True)

    assert result == [(1,)]
    assert 'seq = %s' in cursor.query
    assert cursor.params == ('abc',)


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

    result = rooms.get_room(1)

    assert result == [('1.2.',)]
    assert 'FROM rooms' in cursor.query
    assert cursor.params == (1,)
