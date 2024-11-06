# routesUser.py

from flask import Blueprint

from logic.logicUser import register, login, verify_token, get_user_by_name

# Create a Blueprint for routes
routes_user = Blueprint('routes_user', __name__)

# Define routes
@routes_user.route('/api/register', methods=['POST'])
def register_route():
     return register()

@routes_user.route('/api/login', methods=['POST'])
def login_route():
     return login()

@routes_user.route('/api/verify_token', methods=['POST'])
def verify_token_route():
     return verify_token()

@routes_user.route('/api/user/<username>', methods=['GET'])
def get_user(username):
     return get_user_by_name(username)