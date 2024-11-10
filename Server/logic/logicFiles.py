import math
import uuid
import pandas as pd
from flask import jsonify, request
from datetime import datetime, timedelta
from models import Files, Shifts
from first_placement_basic import optimize_shifts  

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
#TO DELETE
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
        lines = csv_content.strip().split('\n')
        headers = [header.strip() for header in lines[0].split(',')]
        
        data = []
        for line in lines[1:]:
            values = [value.strip() for value in line.split(',')]
            entry = {headers[i]: values[i] for i in range(len(headers))}
            entry['_id'] = str(uuid.uuid4())
            data.append(entry)

        return data

    except Exception as e:
        print("Error processing CSV content:", e)
        return []

def upload_data():
    try:
        files = Files()

        # Get JSON data from the request
        data = request.get_json()

        # Access data fields and process them
        currentUser = data.get('currentUser')
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

        # Save data to MongoDB
        if files.add_files(currentUser, employee_skill_data, worker_requirements_data, shift_basket_data):
            print('Files saved successfully')
            
            try:
                # Convert to pandas DataFrames
                worker_requirements_df = pd.DataFrame(worker_requirements_data)
                shift_basket_df = pd.DataFrame(shift_basket_data)

                # Convert necessary columns to numeric
                worker_requirements_df['number_of_employ'] = pd.to_numeric(worker_requirements_df['number_of_employ'])
                
                # Get optimized shifts
                final_table, status, objective = optimize_shifts(worker_requirements_df, shift_basket_df)
                
                # Convert DataFrame to list and remove '_id' field
                final_table_list = final_table.to_dict('records')
                for shift in final_table_list:
                    if '_id' in shift:
                        del shift['_id']
                
                print("final_table_list:\n", final_table_list)
                
                # Insert the result
                shift = Shifts()
                shift.add_shifts(currentUser, final_table_list)

                return jsonify({
                    'message': 'Files saved successfully',
                    'data': final_table_list
                }), 200

            except Exception as e:
                print(f"Optimization error: {str(e)}")
                import traceback
                traceback.print_exc()
                return jsonify({
                    'error': f'Optimization error: {str(e)}'
                }), 500
        else:
            return jsonify({
                'error': 'Error: Failed to create files'
            }), 500

    except Exception as e:
        print(f"Upload error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': f'Upload error: {str(e)}'
        }), 500

def get_initial_data(identifier):
    try:
        files = Files()
        # Get data from MongoDB
        files_list = files.get_user_files(identifier)
        return jsonify(files_list), 200
    except Exception as e:
        print("Error details:", e)
        return jsonify({"error": str(e)}), 500