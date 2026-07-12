# routesShifts.py

from flask import Blueprint

from auth.decorators import token_required
from logic.logicShifts import delete_shifts, get_shifts, update_shifts

routes_shifts = Blueprint('routes_shifts', __name__)


@routes_shifts.route('/api/shifts', methods=['GET'])
@token_required
def get_user_shifts():
    return get_shifts()


@routes_shifts.route('/api/shifts', methods=['PUT'])
@token_required
def update_user_shifts():
    return update_shifts()


@routes_shifts.route('/api/shifts', methods=['DELETE'])
@token_required
def delete_user_shifts():
    return delete_shifts()
