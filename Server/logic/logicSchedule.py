# logicSchedule.py
from flask import jsonify, request
from models.schedule_model import Schedule
from models.files_model import Files
from models.shifts_model import Shifts
import pandas as pd
from datetime import datetime
from second_placement_basic import assign_employees_to_shifts
from second_placement_KPI1 import assign_employees_to_shifts_KPI1

def polish_employee_skills(employee_skills_data):
    """Polish employee skills data to match required format"""
    polished_data = []
    for employee in employee_skills_data:
        polished_employee = {
            'name': employee.get('name', '').strip(),
            'skill1': employee.get('skill1', '').strip(),
            'skill2': employee.get('skill2', '').strip(),
            'skill3': employee.get('skill3', '').strip()
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
            'name': employee.get('name', employee.get('name', '')).strip(),
            'skill1': employee.get('skill1', employee.get('skill1', '')).strip(),
            'skill2': employee.get('skill2', employee.get('skill2', '')).strip(),
            'skill3': employee.get('skill3', employee.get('skill3', '')).strip()
        }

        # Only add if has name and at least one skill
        if cleaned_employee['name'] and any([
            cleaned_employee['skill1'],
            cleaned_employee['skill2'],
            cleaned_employee['skill3']
        ]):
            cleaned_data.append(cleaned_employee)

    print("DEBUG: Cleaned employee data sample:", cleaned_data[:2])
    print(f"DEBUG: Processed {len(cleaned_data)} valid employees")
    
    if not cleaned_data:
        print("DEBUG: Employee data mapping:")
        for emp in raw_data[:2]:
            print("Original:", emp)
            print("Mapped:", {
                'name': emp.get('name', emp.get('name', '')).strip(),
                'skill1': emp.get('skill1', emp.get('skill1', '')).strip(),
                'skill2': emp.get('skill2', emp.get('skill2', '')).strip(),
                'skill3': emp.get('skill3', emp.get('skill3', '')).strip()
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
def update_shifts(identifier, scheduleId, shiftId):
    # ["emily", "john", "jane", "Unfilled", "Unfilled"]
    # will accept scheduleId, shiftId, and employees list. 
    # we need to update the employees list for the given shiftId in the given scheduleId
    # and we need to search if the employees are in another shift in the same schedule, if so, remove them from that shift
    try:
        data = request.json
        employees = data.get('employees')

        if not employees:
            return jsonify({"error": "Missing employees"}), 400
        
        schedule = Schedule()
        schedule_to_update = schedule.get_schedule_by_id(scheduleId)
        if not schedule_to_update:
            return jsonify({"error": "Schedule not found"}), 404



        shifts = schedule_to_update['schedule']
        shift_index = next((i for i, shift in enumerate(shifts) if shift["id"] == shiftId), -1)

        if shift_index == -1:
            raise Exception("Shift not found in schedule")

        shift_day = shifts[shift_index]['day']
        shifts[shift_index]['assigned_employees'] = employees

        for shift in shifts:
            if shift['day'] == shift_day and shift['id'] != shiftId:
                shift['assigned_employees'] = [
                    "Unfilled" if emp in employees and emp != "Unfilled" else emp
                    for emp in shift.get('assigned_employees', [])
                ]

        updated_schedule = schedule.update_schedule(scheduleId, shifts)
        if updated_schedule:
            return jsonify(updated_schedule), 200
        else:
            return jsonify({"error": "Error while updating shifts"}), 500
    except Exception as e:
        print("Error while updating shifts:", e)
        return jsonify({"error": str(e)}), 500 
def delete_shift(scheduleId, shiftId):
    try:
        schedule = Schedule()
        schedule_to_update = schedule.get_schedule_by_id(scheduleId)
        if not schedule_to_update:
            return jsonify({"error": "Schedule not found"}), 404

        shifts = schedule_to_update['schedule']
        shift_index = next((i for i, shift in enumerate(shifts) if shift["id"] == shiftId), -1)

        if shift_index == -1:
            raise Exception("Shift not found in schedule")

        shifts.pop(shift_index)

        updated_schedule = schedule.update_schedule(scheduleId, shifts)
        if updated_schedule:
            return jsonify(updated_schedule), 200
        else:
            return jsonify({"error": "Error while deleting shift"}), 500
    except Exception as e:
        print("Error while deleting shift:", e)
        return jsonify({"error": str(e)}), 500
