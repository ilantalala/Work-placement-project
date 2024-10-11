# routesSchedule.py

from flask import Blueprint

from logic.logicSchedule import get_schedule

# Create a Blueprint for routes
routes_schedule = Blueprint('routes_schedule', __name__)

# Define routes
@routes_schedule.route('/api/<identifier>/schedule', methods=['GET'])
def get_user_schedule(identifier):
     return get_schedule(identifier)
