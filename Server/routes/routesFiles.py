# routeFiles.py

from flask import Blueprint

from logic.logicFiles import upload_data, get_initial_data

# Create a Blueprint for routes
routes_files = Blueprint('routes_files', __name__)

@routes_files.route('/api/upload-data', methods=['POST'])
def upload_data_route():
     return upload_data()

@routes_files.route('/api/<identifier>/get_initial_data', methods=['GET'])
def get_initial_data_route(identifier):
     return get_initial_data(identifier)