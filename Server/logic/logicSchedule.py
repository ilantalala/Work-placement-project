from flask import jsonify, request
from models import Schedule

def get_schedule(identifier):
    try:
        schedule = Schedule()
        user_schedule = schedule.get_user_schedule(identifier)
        user_schedule['_id'] = str(user_schedule['_id'])
        return jsonify(user_schedule), 200
    except Exception as e:
        print("Error while getting user schdeule:", e)
        return jsonify({"error": str(e)}), 500
       