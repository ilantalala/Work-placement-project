from flask import jsonify, request
from models import Schedule

def get_schedules(identifier):
    try:
        schedules = Schedule().get_schedules(identifier)
        return jsonify(schedules), 200
    except Exception as e:
        print("Error while getting schedules:", e)
        return jsonify({"error": str(e)}), 500
def create_schedule(identifier):
    try:
        data = request.json
        schedule_date = data.get('date')

        if not schedule_date:
            return jsonify({"error": "Missing date"}), 400
        
        schedule = Schedule()
        new_schedule = schedule.add_schedule(identifier, schedule_date)
        if new_schedule:
            new_schedule['_id'] = str(new_schedule['_id'])
            return jsonify(new_schedule), 200
        else:
            return jsonify({"error": "Error while creating schedule"}), 500
    except Exception as e:
        print("Error while creating schedule:", e)
        return jsonify({"error": str(e)}), 500
        