# routesShifts.py

from flask import Blueprint

from logic.logicShifts import get_shifts, update_shifts

# Create a Blueprint for routes
routes_shifts= Blueprint('routes_shifts', __name__)

# Define routes
@routes_shifts.route('/api/<identifier>/shifts', methods=['GET'])
def get_user_shifts(identifier):
     return get_shifts(identifier)

@routes_shifts.route('/api/<identifier>/shifts', methods=['PUT'])
def update_user_shifts(identifier):
     return update_shifts(identifier)
