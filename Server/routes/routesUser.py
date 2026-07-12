# routesUser.py

from flask import Blueprint

from auth.decorators import token_required
from logic.logicUser import get_current_user, login, register, update_current_user

routes_user = Blueprint('routes_user', __name__)


@routes_user.route('/api/register', methods=['POST'])
def register_route():
    return register()


@routes_user.route('/api/login', methods=['POST'])
def login_route():
    return login()


@routes_user.route('/api/user/me', methods=['GET'])
@token_required
def get_current_user_route():
    return get_current_user()


@routes_user.route('/api/user/me', methods=['PUT'])
@token_required
def update_current_user_route():
    return update_current_user()
