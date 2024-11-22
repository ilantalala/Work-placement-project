#logicShifts.py
from flask import jsonify, request
from models.shifts_model import Shifts

def get_shifts(identifier):
    try:
        shift = Shifts()
        user_shift = shift.get_user_shifts(identifier)
        if not user_shift:
            return jsonify({}), 200

        user_shift['_id'] = str(user_shift['_id'])
        return jsonify(user_shift), 200
    except Exception as e:
        print("Error while getting user shifts:", e)
        return jsonify({"error": str(e)}), 500
def update_shifts(identifier):
    try:
        data = request.json
        ##THE GET METHOD IS NOT
        new_shifts = data.get('data')

        shift = Shifts()
        user_shift = shift.update_user_shifts(identifier, new_shifts)
        if not user_shift:
            return jsonify({}), 200

        return jsonify(user_shift), 200
    except Exception as e:
        print("Error while updating user shifts:", e)
        return jsonify({"error": str(e)}), 500
