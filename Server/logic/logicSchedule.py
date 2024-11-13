# logicSchedule.py
from flask import jsonify, request
from models.schedule_model import Schedule
from models.files_model import Files
from models.shifts_model import Shifts
import pandas as pd
from datetime import datetime
from second_placement_basic import assign_employees_to_shifts

def polish_employee_skills(employee_skills_data):
    """Polish employee skills data to match required format"""
    polished_data = []
    for employee in employee_skills_data:
        polished_employee = {
            'Name': employee.get('Name', '').strip(),
            'Skill1': employee.get('Skill1', '').strip(),
            'Skill2': employee.get('Skill2', '').strip(),
            'Skill3': employee.get('Skill3', '').strip()
        }
        polished_data.append(polished_employee)
    return polished_data

def get_schedules(identifier):
    try:
        schedules_cursor = Schedule().get_user_schedule(identifier)
        schedules_list = list(schedules_cursor)

        for schedule in schedules_list:
            if '_id' in schedule:
                schedule['_id'] = str(schedule['_id'])

        return jsonify(schedules_list), 200
    except Exception as e:
        print("Error while getting schedules:", e)
        return jsonify({"error": str(e)}), 500

def process_employee_data(raw_data):
    """Process and validate employee data"""
    print("DEBUG: Raw employee data sample:", raw_data[:2])
    
    cleaned_data = []
    for employee in raw_data:
        # Create standardized employee record
        cleaned_employee = {
            'Name': employee.get('name', employee.get('Name', '')).strip(),
            'Skill1': employee.get('skill1', employee.get('Skill1', '')).strip(),
            'Skill2': employee.get('skill2', employee.get('Skill2', '')).strip(),
            'Skill3': employee.get('skill3', employee.get('Skill3', '')).strip()
        }

        # Only add if has name and at least one skill
        if cleaned_employee['Name'] and any([
            cleaned_employee['Skill1'],
            cleaned_employee['Skill2'],
            cleaned_employee['Skill3']
        ]):
            cleaned_data.append(cleaned_employee)

    print("DEBUG: Cleaned employee data sample:", cleaned_data[:2])
    print(f"DEBUG: Processed {len(cleaned_data)} valid employees")
    
    if not cleaned_data:
        print("DEBUG: Employee data mapping:")
        for emp in raw_data[:2]:
            print("Original:", emp)
            print("Mapped:", {
                'Name': emp.get('name', emp.get('Name', '')).strip(),
                'Skill1': emp.get('skill1', emp.get('Skill1', '')).strip(),
                'Skill2': emp.get('skill2', emp.get('Skill2', '')).strip(),
                'Skill3': emp.get('skill3', emp.get('Skill3', '')).strip()
            })
    
    return cleaned_data
def create_schedule(identifier):
    try:
        data = request.json
        schedule_date = data.get('date')

        if not schedule_date:
            return jsonify({"error": "Missing date"}), 400

        # Get required data from database
        files_model = Files()
        shifts_model = Shifts()

        # Get employee skills data
        employee_skills_doc = files_model.find_file_by_type(identifier, 'employee_skill')
        if not employee_skills_doc or 'data' not in employee_skills_doc:
            print(f"Employee skills not found for user {identifier}")
            return jsonify({"error": "Employee skills data not found"}), 404

        try:
            # Process and clean employee data
            employee_skills_data = process_employee_data(employee_skills_doc['data'])
            if not employee_skills_data:
                return jsonify({"error": "No valid employee skills data found after processing"}), 400

            # Get shifts data
            shifts_doc = shifts_model.get_user_shifts(identifier)
            if not shifts_doc or 'data' not in shifts_doc:
                return jsonify({"error": "Optimized shifts data not found"}), 404

            # Convert to DataFrame for the algorithm
            employee_skills_df = pd.DataFrame(employee_skills_data)
            optimized_shifts = pd.DataFrame(shifts_doc['data'])
            
            # Run second placement algorithm
            final_schedule_df = assign_employees_to_shifts(
                employee_skills_df,
                optimized_shifts
            )

            # Convert the final schedule to records
            schedule = []
            for _, row in final_schedule_df.iterrows():
                record = {}
                for column in final_schedule_df.columns:
                    value = row[column]
                    if column == 'assigned_employees':
                        record[column] = value if isinstance(value, list) else list(value)
                    elif isinstance(value, pd.Timestamp):
                        record[column] = value.strftime('%Y-%m-%d %H:%M:%S')
                    elif hasattr(value, 'item'):
                        record[column] = value.item()
                    else:
                        record[column] = value
                schedule.append(record)

            # Create schedule data
            schedule_data = {
                'employee_skill': employee_skills_data,
                'shifts': shifts_doc['data'],
                'schedule': schedule,
                'date_range': schedule_date,
                'meta': {
                    'total_shifts': len(schedule),
                    'total_employees': len(employee_skills_data),
                    'last_updated': datetime.utcnow().isoformat()
                }
            }

            # Save to database
            schedule_model = Schedule()
            new_schedule = schedule_model.add_schedule(identifier, schedule_date, schedule_data)
            
            if new_schedule:
                new_schedule['_id'] = str(new_schedule['_id'])
                return jsonify(new_schedule), 200
            
            # If we get here, something went wrong with saving
            return jsonify({"error": "Failed to save schedule"}), 500

        except Exception as e:
            print("Error in schedule processing:", str(e))
            import traceback
            traceback.print_exc()
            return jsonify({"error": f"Schedule processing error: {str(e)}"}), 500

    except Exception as e:
        print("Error while creating schedule:", str(e))
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500