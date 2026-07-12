#logicShifts.py
from flask import g, jsonify, request
from models.shifts_model import Shifts


def get_shifts():
    try:
        shift = Shifts()
        user_shift = shift.get_user_shifts(g.current_user)
        if not user_shift:
            return jsonify({}), 200

        user_shift['_id'] = str(user_shift['_id'])
        return jsonify(user_shift), 200
    except Exception as e:
        print("Error while getting user shifts:", e)
        return jsonify({"error": str(e)}), 500


def update_shifts():
    try:
        data = request.json
        new_shifts = data.get('data')

        shift = Shifts()
        user_shift = shift.update_user_shifts(g.current_user, new_shifts)
        if not user_shift:
            return jsonify({}), 200

        return jsonify(user_shift), 200
    except Exception as e:
        print("Error while updating user shifts:", e)
        return jsonify({"error": str(e)}), 500


def delete_shifts():
    try:
        shift = Shifts()
        if shift.delete_user_shifts(g.current_user):
            return jsonify({"message": "Shifts deleted successfully"}), 200
        return jsonify({"error": "No shifts found to delete"}), 404
    except Exception as e:
        print("Error while deleting user shifts:", e)
        return jsonify({"error": str(e)}), 500
