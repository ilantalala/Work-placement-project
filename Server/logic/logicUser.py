#logicUser.py
from flask import g, jsonify, request
from werkzeug.security import check_password_hash

from auth.jwt_utils import generate_token
from models.user_model import User


def register():
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')
        companyName = data.get('companyName')
        displayName = data.get('displayName')

        if not username or not password or not companyName:
            return jsonify({'error': 'Username, password, and company name are required'}), 400

        user = User()

        if user.find_user(username):
            return jsonify({'error': 'Username already exists'}), 409

        if user.create_user(username, password, companyName, displayName):
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
            return jsonify({
                'message': 'Login successful',
                'token': generate_token(username),
                'username': username,
            }), 200
        else:
            return jsonify({'error': 'Invalid username or password'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def get_current_user():
    try:
        user = User()
        user_data = user.find_user_by_name(g.current_user)
        if not user_data:
            return jsonify({'error': 'User not found'}), 404

        user_data['_id'] = str(user_data['_id'])
        del user_data['password']
        return jsonify(user_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def update_current_user():
    try:
        data = request.json
        field_map = {
            'displayName': 'display_name',
            'companyName': 'company_name',
            'password': 'password',
        }
        fields_to_update = {
            field_map[k]: v
            for k, v in data.items()
            if k in field_map and v
        }

        if not fields_to_update:
            return jsonify({'error': 'No valid fields to update'}), 400

        user = User()
        if user.update_user(g.current_user, fields_to_update):
            updated_user = user.find_user_by_name(g.current_user)
            updated_user['_id'] = str(updated_user['_id'])
            del updated_user['password']
            return jsonify({'message': 'User updated successfully', 'user': updated_user}), 200
        return jsonify({'error': 'Failed to update user'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500
