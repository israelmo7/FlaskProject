import os
from flask import Flask

def create_app():
    app = Flask(__name__)
    

from .admin import routes

# Registering blueprints
app.register_blueprint(admin.admin_bp)
