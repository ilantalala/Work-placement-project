from flask import jsonify, request
from models import Schedule
# import json

def get_schedules(identifier):
    try:
        schedules_cursor = Schedule().get_user_schedule(identifier)

        schedules_list = list(schedules_cursor)  # Now it's JSON-serializable

        # If MongoDB ObjectIds are part of the data, you need to convert them to strings
        for schedule in schedules_list:
            if '_id' in schedule:
                schedule['_id'] = str(schedule['_id'])  # Convert ObjectId to string

        # Now you can serialize it to JSON
        # json_result = json.dumps(schedules_list)

        return jsonify(schedules_list), 200
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
        