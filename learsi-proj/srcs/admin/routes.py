from flask import Blueprint, redirect

admin_bp = Blueprint(
    'admin_bp', __name__, template_folder='templates', static_folder='static'
)


@admin_bp.route('/', methods=['GET'])
def admin_home():
    """Admin is a normal room (rtype=admin); keep /admin as a shortcut."""
    return redirect('/room/admin')
