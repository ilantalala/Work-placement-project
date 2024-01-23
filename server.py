from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, time

app = Flask(__name__)
CORS(app)


def filter_schedules_by_time(schedules, skill, day, start, end):
    filtered_schedules = []
    time_format = "%H:%M"  # Define the time format

    for schedule in schedules:
        schedule_skill = schedule["skill"]
        schedule_day = schedule["day"]
        schedule_start = schedule["start_time"]
        schedule_end = schedule["end_time"]

        time_start = datetime.strptime(schedule_start, time_format).time()
        time_end = datetime.strptime(schedule_end, time_format).time()

        start_time = datetime.strptime(start, time_format).time()
        end_time = datetime.strptime(end, time_format).time()

        if (
            schedule_skill == skill
            and schedule_day == day
            and start_time <= time_start <= end_time
            and start_time <= time_end <= end_time
        ):
            filtered_schedules.append(schedule)

    return filtered_schedules


@app.route('/api/calculate-average', methods=['POST'])
def calculate_average():
    try:
        schedules = request.json.get('schedules', [])
        time_ranges = request.json.get('employ_data', [])
        new_array = []

        for shift in time_ranges:
            start = shift["start_time"]
            end = shift["end_time"]
            skill = shift["skill"]
            day = shift["day"]

            filtered_schedules = filter_schedules_by_time(schedules, skill, day, start, end)

            sum, counter = 0, 0
            for schedule in filtered_schedules:
                counter += 1
                sum += int(schedule["number_of_employ"])

            if counter > 0:
                new_array.append({"skill": skill, "day": day, "start": start, "end": end, "number_of_employ": (sum / counter)})

        response = {"time_ranges": new_array}
        print(new_array)
        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)})


if __name__ == '__main__':
    app.run(debug=True)
