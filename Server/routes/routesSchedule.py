from flask import Blueprint

from logic.logicSchedule import get_schedules, create_schedule

# Create a Blueprint for routes
routes_schedule= Blueprint('routes_schedule', __name__)

# Define routes
@routes_schedule.route('/api/<identifier>/schedule', methods=['GET'])
def get_user_schedules(identifier):
     print("GET-SCHEDULE_ROUTE")
     return get_schedules(identifier)

@routes_schedule.route('/api/<identifier>/schedule', methods=['POST'])
def create_user_schedule(identifier):
     print("POST-SCHEDULE_ROUTE")
     print("create_schedule(identifier): ",create_schedule(identifier))
     return create_schedule(identifier)
