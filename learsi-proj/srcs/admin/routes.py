from flask import Blueprint, render_template, session

admin_bp = Blueprint(
    'admin_bp', __name__, template_folder='templates', static_folder='static'
)


@admin_bp.route('/<kid>', methods=['GET'])
def admin_login(kid):
    guest_id = session.get('id', '')[:8] if session.get('id') else None
    if not guest_id:
        return '', 403

    pocket = guests_c.get_guest(guest_id)
    if not pocket:
        return '', 403

    if pocket != kid:
        return '', 403

    return render_template(
        "admin.html",
        se=guest_id)
