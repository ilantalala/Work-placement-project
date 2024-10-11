import math
import uuid
from flask import jsonify, request
from datetime import datetime, timedelta
from models import Files, Schedule

def polish(data):
    def remove_r(text):
        return text.replace("\r", "")

    polished_data = []
    for item in data:
        polished_item = {}
        for key, value in item.items():
            polished_key = remove_r(key)
            polished_value = remove_r(value)
            polished_item[polished_key] = polished_value
        polished_data.append(polished_item)
    return polished_data

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

def calculate_average(schedules, time_ranges):
    try:
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
                new_array.append({"skill": skill, "day": day, "start": start, "end": end, "number_of_employ": math.ceil(sum / counter)})
        return new_array

    except Exception as e:
        return {"error": str(e)}


def process_csv_content(csv_content):
    try:
        # Split the content into lines
        lines = csv_content.strip().split('\n')

        # Extract headers from the first line
        headers = [header.strip() for header in lines[0].split(',')]

        # Process data from subsequent lines
        data = []
        for line in lines[1:]:
            values = [value.strip() for value in line.split(',')]

            # Create a dictionary using headers as keys and values as values
            entry = {headers[i]: values[i] for i in range(len(headers))}
            entry['_id'] = str(uuid.uuid4())

            data.append(entry)

        return data

    except Exception as e:
        print("Error processing CSV content:", e)
        return [] # Return an empty list in case of an error


def upload_data():
    try:
        files = Files()

        # Get JSON data from the request
        data = request.get_json()

        # Access data fields
        currentUser = data.get('CurrentUser')
        employee_skill_content = data.get('employeeSkillContent')
        worker_requirements_content = data.get('workerRequirementsContent')
        shift_basket_content = data.get('shiftBasketContent')

        if None in [employee_skill_content, worker_requirements_content, shift_basket_content]:
            return jsonify({"error": "Missing required data in the request"}), 400

        # Process CSV-like content and create arrays of JSON objects
        employee_skill_data = process_csv_content(employee_skill_content)
        worker_requirements_data = process_csv_content(worker_requirements_content)
        shift_basket_data = process_csv_content(shift_basket_content)

        # Polish the data
        employee_skill_data = polish(employee_skill_data)
        worker_requirements_data = polish(worker_requirements_data)
        shift_basket_data = polish(shift_basket_data)

        # Debugging logs
        #print('Processed Employee Skill Data:', employee_skill_data)
        #print('Processed Worker Requirements Data:', worker_requirements_data)
        #print('Processed Shift Basket Data:', shift_basket_data)

        # Save data to MongoDB
        print(currentUser)
        if files.add_files(currentUser, employee_skill_data, worker_requirements_data, shift_basket_data):
            print('Files saved successfully')
        else:
            print('Error: Failed to create files')

        # Calculate average and return the result
        final_table = calculate_average(worker_requirements_data, shift_basket_data)
        
        print("Final Table:", final_table)
        schedule = Schedule()
        schedule.add_schedule(currentUser, final_table)

        return jsonify(final_table), 200

    except Exception as e:
        print("Error details:", e)
        return jsonify({"error": str(e)}), 
        
def get_initial_data(identifier):
    try:
        files = Files()
        # Get data from MongoDB
        files_list = files.get_user_files(identifier)
        return jsonify(files_list), 200
    except Exception as e:
        print("Error details:", e)
        return jsonify({"error": str(e)}), 500
       