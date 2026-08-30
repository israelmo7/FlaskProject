import json
import logging
import os
from pathlib import Path

from flask import Flask, jsonify, redirect, render_template, request

from srcs.admin.routes import admin_bp
from srcs.core.routes import core_bp, init_db_c
from srcs.db import get_package
from srcs.rooms.routes import init_db_r, rooms_bp

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
    app.config['SESSION_COOKIE_PATH'] = data_conf['ses']['PATH']
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

    app.register_blueprint(rooms_bp, url_prefix='/room')
    app.register_blueprint(core_bp, url_prefix='/data')
    app.register_blueprint(admin_bp, url_prefix='/admin')

    if not app.config.get('SKIP_MYSQL'):
        from flask_mysqldb import MySQL

        mysql = MySQL(app)
        rooms_c, keys_c, guests_c = get_package(app, mysql)
        init_db_r(rooms_c, keys_c, guests_c)
        init_db_c(rooms_c, keys_c, guests_c)

        app.extensions['mysql'] = mysql
        app.extensions['rooms_c'] = rooms_c
        app.extensions['keys_c'] = keys_c
        app.extensions['guests_c'] = guests_c
    else:
        app.extensions['mysql'] = None
        app.extensions['rooms_c'] = None
        app.extensions['keys_c'] = None
        app.extensions['guests_c'] = None

    @app.route('/', methods=['GET'])
    def gindex():
        return render_template("gindex.html")

    @app.route('/<value>', methods=['POST'])
    def join_room(value):
        ret = jsonify(success=False)
        if app.config.get('SKIP_MYSQL'):
            return ret

        mysql_ext = app.extensions['mysql']

        if isinstance(value, str) and 0 < len(value) < 15:
            with mysql_ext.connection.cursor() as cur:
                cur.execute(
                    "SELECT id FROM keys_t WHERE sessions LIKE %s",
                    (f'%{value}%',),
                )
                ans = cur.fetchall()

                if len(ans) == 1:
                    cur.execute("SELECT * FROM guests WHERE pocket = %s", (value,))
                    ans = cur.fetchall()
                    if len(ans) == 0:
                        cur.execute(
                            "INSERT INTO guests (pocket) VALUES (%s)",
                            (value,),
                        )
                        mysql_ext.connection.commit()
                    ret = redirect('/admin')

        return ret

    if os.environ.get("FLASK_ENABLE_TEST_ROUTE") == "1":

        @app.route('/test/<parm>')
        def tests(parm):
            ret = jsonify(success=True)
            mysql_ext = app.extensions['mysql']
            try:
                parm_int = int(parm, 10)
            except ValueError:
                return jsonify(success=False)

            with mysql_ext.connection.cursor() as cur:
                cur.execute(
                    "UPDATE keys_t SET sessions = %s WHERE id = %s",
                    (parm_int, 99),
                )
                mysql_ext.connection.commit()
            return ret

    return app
