import json
import logging
import os
from pathlib import Path

from flask import Flask, render_template

from srcs.core.routes import core_bp, init_db_c
from srcs.db import get_package
from srcs.rooms.routes import init_db_r, rooms_bp
from srcs.api.routes import api_bp, init_db_a

logger = logging.getLogger(__name__)

CONFIG_PATH = Path(__file__).resolve().parents[2] / "config.json"


def _load_json_config(app):
    if not CONFIG_PATH.exists():
        logger.warning("Config file not found at %s", CONFIG_PATH)
        return

    with CONFIG_PATH.open() as config_file:
        data_conf = json.load(config_file)

    app.config['MYSQL_HOST'] = data_conf['db']['HOST']
    app.config['MYSQL_USER'] = data_conf['db']['USER']
    app.config['MYSQL_PASSWORD'] = data_conf['db']['PASSWORD']
    app.config['MYSQL_DB'] = data_conf['db']['NAME']
    app.config["SESSION_PERMANENT"] = data_conf['ses']['PERMANENT']
    app.config["SESSION_TYPE"] = data_conf['ses']['TYPE']
    # Cookie must cover /data, /room, /api — never a narrow path.
    cookie_path = data_conf['ses'].get('PATH') or '/'
    if cookie_path != '/':
        logger.warning(
            "SESSION_COOKIE_PATH=%r is not '/'; forcing '/' so knock/rooms share the session",
            cookie_path,
        )
        cookie_path = '/'
    app.config['SESSION_COOKIE_PATH'] = cookie_path
    app.config['CHAT_CAPACITY'] = data_conf['chat']['CAPACITY']
    app.config['SESSION_LENGTH'] = data_conf['ses']['LENGTH']
    app.config['SESSION_TIMEOUT'] = data_conf['ses']['TIMEOUT']
    app.secret_key = data_conf['ses']['SECRET_KEY']


def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
        TESTING=False,
    )

    if test_config is None:
        _load_json_config(app)
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.from_mapping(test_config)

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # Three blueprints: rooms (door), data (knock), api (React JSON)
    app.register_blueprint(rooms_bp, url_prefix='/room')
    app.register_blueprint(core_bp, url_prefix='/data')
    app.register_blueprint(api_bp, url_prefix='/api')
    
    if not app.config.get('SKIP_MYSQL'):
        from flask_mysqldb import MySQL

        mysql = MySQL(app)
        rooms_c, keys_c, guests_c = get_package(app, mysql)
        init_db_r(rooms_c, keys_c, guests_c)
        init_db_c(rooms_c, keys_c, guests_c)
        init_db_a(rooms_c, keys_c, guests_c)
        
        app.extensions['mysql'] = mysql
        app.extensions['rooms_c'] = rooms_c
        app.extensions['keys_c'] = keys_c
        app.extensions['guests_c'] = guests_c


        from srcs.rooms.routes import start_guest_cleaner
        start_guest_cleaner(app)
    
    else:
        app.extensions['mysql'] = None
        app.extensions['rooms_c'] = None
        app.extensions['keys_c'] = None
        app.extensions['guests_c'] = None

    @app.route('/', methods=['GET'])
    def gindex():
        return render_template("gindex.html")

    return app
