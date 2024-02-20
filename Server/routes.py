# routes.py

from flask import Blueprint

from logic import register, login, verify_token, upload_data

# Create a Blueprint for routes
routes_bp = Blueprint('routes', __name__)

# Define routes
@routes_bp.route('/api/register', methods=['POST'])
def register_route():
     return register()

@routes_bp.route('/api/login', methods=['POST'])
def login_route():
     return login()

@routes_bp.route('/api/verify_token', methods=['POST'])
def verify_token_route():
     return verify_token()

@routes_bp.route('/api/upload-data', methods=['POST'])
def upload_data_route():
     return upload_data()
