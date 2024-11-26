from flask import Blueprint, render_template

rooms_bp = Blueprint('rooms_bp', __name__, template_folder = 'templates',static_folder = 'static')


@rooms_bp.route('/',methods=['GET'])
@rooms_bp.route('/<value>',methods=['GET'])
def blabla(value = None):
    print ("Inside rooms_bp")
    return "Success"