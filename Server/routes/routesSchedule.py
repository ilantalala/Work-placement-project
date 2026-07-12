from flask import Blueprint

from auth.decorators import token_required
from logic.logicSchedule import (
    create_schedule,
    delete_schedule,
    delete_shift,
    get_schedule,
    get_schedules,
    update_schedule_shift,
)

routes_schedule = Blueprint('routes_schedule', __name__)


@routes_schedule.route('/api/schedule', methods=['GET'])
@token_required
def get_user_schedules():
    return get_schedules()


@routes_schedule.route('/api/schedule', methods=['POST'])
@token_required
def create_user_schedule():
    return create_schedule()


@routes_schedule.route('/api/schedule/<id>', methods=['GET'])
@token_required
def get_user_schedule(id):
    return get_schedule(id)


@routes_schedule.route('/api/schedule/<id>', methods=['DELETE'])
@token_required
def delete_user_schedule(id):
    return delete_schedule(id)


@routes_schedule.route('/api/schedule/<id>/edit/<shift_id>', methods=['PUT'])
@token_required
def edit_schedule_shifts(id, shift_id):
    return update_schedule_shift(id, shift_id)


@routes_schedule.route('/api/schedule/<id>/delete/<shift_id>', methods=['DELETE'])
@token_required
def delete_schedule_shift(id, shift_id):
    return delete_shift(id, shift_id)
