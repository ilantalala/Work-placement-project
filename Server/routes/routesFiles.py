# routeFiles.py

from flask import Blueprint

from auth.decorators import token_required
from logic.logicFiles import delete_files, get_initial_data, upload_data

routes_files = Blueprint('routes_files', __name__)


@routes_files.route('/api/upload-data', methods=['POST'])
@token_required
def upload_data_route():
    return upload_data()


@routes_files.route('/api/files', methods=['GET'])
@token_required
def get_initial_data_route():
    return get_initial_data()


@routes_files.route('/api/files', methods=['DELETE'])
@token_required
def delete_files_route():
    return delete_files()
