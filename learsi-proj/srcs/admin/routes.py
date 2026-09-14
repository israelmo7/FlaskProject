from flask import Blueprint, render_template, session

admin_bp = Blueprint(
    'admin_bp', __name__, template_folder='templates', static_folder='static'
)


@admin_bp.route('/')
def admin_home():
    guest_id = session.get('id', '')[:8] if session.get('id') else None
    if guest_id:
        return render_template("panel.html", se=guest_id)
    return "You Got it!"
