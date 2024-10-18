from flask import Blueprint

from logic.logicSchedule import get_schedules, create_schedule

# Create a Blueprint for routes
routes_schedule= Blueprint('routes_schedule', __name__)

# Define routes
@routes_schedule.route('/api/<identifier>/schedule', methods=['GET'])
def get_user_schedules(identifier):
     return get_schedules(identifier)

@routes_schedule.route('/api/<identifier>/schedule', methods=['POST'])
def create_user_schedule(identifier):
     return create_schedule(identifier)
