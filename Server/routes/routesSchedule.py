from flask import Blueprint

from logic.logicSchedule import get_schedules, create_schedule, update_shifts, delete_shift

# Create a Blueprint for routes
routes_schedule= Blueprint('routes_schedule', __name__)

# Define routes
@routes_schedule.route('/api/<identifier>/schedule', methods=['GET'])
def get_user_schedules(identifier):
     print("GET-SCHEDULE_ROUTE")
     res = get_schedules(identifier)
     print ("davidos", res, type(res))
     return res

@routes_schedule.route('/api/<identifier>/schedule', methods=['POST'])
def create_user_schedule(identifier):
     return create_schedule(identifier)

@routes_schedule.route('/api/schedule/<id>/edit/<shift_id>', methods=['PUT'])
def edit_schedule_shifts(id, shift_id):
     return update_shifts(id, shift_id)

@routes_schedule.route('/api/schedule/<id>/delete/<shift_id>', methods=['DELETE'])
def delete_schedule_shift(id, shift_id):
     return delete_shift(id, shift_id)
