from flask import jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from models import User

SECRET_KEY = 'hiiihiiiii'

def register():
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')
        companyName = data.get('companyName')

        # Validate required fields
        if not username or not password or not companyName:
            return jsonify({'error': 'Username, password, and company name are required'}), 400

        user = User()

        # Check if the user already exists
        if user.find_user(username):
            return jsonify({'error': 'Username already exists'}), 409  # HTTP 409 Conflict

        # Create user if the username does not exist
        if user.create_user(username, password, companyName):
            return jsonify({'message': 'User registered successfully'}), 201
        else:
            return jsonify({'error': 'Failed to register user'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def login():
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400

        user = User()
        user_data = user.find_user(username)

        if user_data and check_password_hash(user_data.get('password'), password):
            return jsonify({'message': 'Login successful'}), 200
        else:
            return jsonify({'error': 'Invalid username or password'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def verify_token():
    try:
        token = request.headers.get('Authorization')

        if not token:
            return jsonify({'error': 'Token is missing'}), 401

        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return jsonify({'message': 'Token is valid', 'username': decoded_token.get('username')}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token has expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401