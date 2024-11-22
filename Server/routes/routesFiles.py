# routeFiles.py

from flask import Blueprint

from logic.logicFiles import upload_data, get_initial_data

# Create a Blueprint for routes
routes_files = Blueprint('routes_files', __name__)

@routes_files.route('/api/upload-data', methods=['POST'])
def upload_data_route():
     print("POST-FILES_ROUTE")
     return upload_data()

@routes_files.route('/api/<identifier>/get_initial_data', methods=['GET'])
def get_initial_data_route(identifier):
     print("GET-FILES_ROUTE")
     return get_initial_data(identifier)