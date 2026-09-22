from flask import Blueprint, render_template, session

admin_bp = Blueprint(
    'admin_bp', __name__, template_folder='templates', static_folder='static'
)

rooms_c, keys_c, guests_c = 0, 0, 0


def init_db_a(r, k, g):
    global rooms_c, keys_c, guests_c
    rooms_c, keys_c, guests_c = r, k, g


@admin_bp.route('/', methods=['GET'])
def admin_login():
    guest_id = session.get('id', '')[:8] if session.get('id') else None
    if not guest_id:
        return '', 403

    pocket = guests_c.get_pocket(guest_id)
    if not pocket:
        return '', 403

    pocket = pocket[0]
    if pocket != kid:
        return '', 403

    return render_template(
        "admin.html",
        se=guest_id)
