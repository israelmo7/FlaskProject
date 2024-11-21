from flask import Blueprint


# Defining a blueprint
admin_bp = Blueprint(
    'admin_bp', __name__,
    template_folder='templates',
    static_folder='static'
)
@admin_bp.route('/admin')
def admin_home():
    return "Hello World!"