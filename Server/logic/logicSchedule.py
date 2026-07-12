# logicSchedule.py
from flask import g, jsonify, request
from models.schedule_model import Schedule
from models.files_model import Files
from models.shifts_model import Shifts
import pandas as pd
from schedule_algorithm_basic import assign_employees_to_shifts
from schedule_algorithm_balanced_shifts import assign_employees_to_shifts_balanced


def get_schedules():
    try:
        schedules_cursor = Schedule().get_user_schedule(g.current_user)
        schedules_list = list(schedules_cursor)

        for schedule in schedules_list:
            if '_id' in schedule:
                schedule['_id'] = str(schedule['_id'])
        return jsonify(schedules_list), 200
    except Exception as e:
        print("Error while getting schedules:", e)
        return jsonify({"error": str(e)}), 500


def get_schedule(schedule_id):
    try:
        schedule = Schedule().get_schedule_by_id(schedule_id)
        if not schedule:
            return jsonify({"error": "Schedule not found"}), 404

        if schedule['identifier'] != g.current_user:
            return jsonify({"error": "Forbidden"}), 403

        schedule['_id'] = str(schedule['_id'])
        return jsonify(schedule), 200
    except Exception as e:
        print("Error while getting schedule:", e)
        return jsonify({"error": str(e)}), 500


def delete_schedule(schedule_id):
    try:
        schedule_model = Schedule()
        schedule = schedule_model.get_schedule_by_id(schedule_id)
        if not schedule:
            return jsonify({"error": "Schedule not found"}), 404

        if schedule['identifier'] != g.current_user:
            return jsonify({"error": "Forbidden"}), 403

        if schedule_model.delete_schedule(schedule_id):
            return jsonify({"message": "Schedule deleted successfully"}), 200
        return jsonify({"error": "Failed to delete schedule"}), 500
    except Exception as e:
        print("Error while deleting schedule:", e)
        return jsonify({"error": str(e)}), 500


def process_employee_data(raw_data):
    """Process and validate employee data"""
    cleaned_data = []
    for employee in raw_data:
        cleaned_employee = {
            'name': employee.get('name', employee.get('name', '')).strip(),
            'skill1': employee.get('skill1', employee.get('skill1', '')).strip(),
            'skill2': employee.get('skill2', employee.get('skill2', '')).strip(),
            'skill3': employee.get('skill3', employee.get('skill3', '')).strip()
        }

        if cleaned_employee['name'] and any([
            cleaned_employee['skill1'],
            cleaned_employee['skill2'],
            cleaned_employee['skill3']
        ]):
            cleaned_data.append(cleaned_employee)

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


def create_schedule():
    try:
        data = request.json
        schedule_date = data.get('date')
        prioritize = data.get('prioritize')
        current_user = g.current_user

        if not schedule_date:
            return jsonify({"error": "Missing date"}), 400

        files_model = Files()
        shifts_model = Shifts()

        employee_skills_doc = files_model.find_file_by_type(current_user, 'employee_skill')
        if not employee_skills_doc or 'data' not in employee_skills_doc:
            print(f"Employee skills not found for user {current_user}")
            return jsonify({"error": "Employee skills data not found"}), 404

        try:
            employee_skills_data = process_employee_data(employee_skills_doc['data'])
            if not employee_skills_data:
                return jsonify({"error": "No valid employee skills data found after processing"}), 400

            shifts_doc = shifts_model.get_user_shifts(current_user)
            if not shifts_doc or 'data' not in shifts_doc:
                return jsonify({"error": "Optimized shifts data not found"}), 404

            employee_skills_df = pd.DataFrame(employee_skills_data)
            optimized_shifts = pd.DataFrame(shifts_doc['data'])

            final_schedule_df = (
                assign_employees_to_shifts_balanced(employee_skills_df, optimized_shifts)
                if prioritize
                else assign_employees_to_shifts(employee_skills_df, optimized_shifts)
            )

            schedule = []
            for _, row in final_schedule_df.iterrows():
                record = {}
                for column in final_schedule_df.columns:
                    value = row[column]
                    if column == 'assigned_employees':
                        record[column] = value if isinstance(value, list) else list(value)
                    elif hasattr(value, 'item'):
                        record[column] = value.item()
                    else:
                        record[column] = value
                schedule.append(record)

            schedule_data = {
                'employee_skill': employee_skills_data,
                'shifts': shifts_doc['data'],
                'schedule': schedule,
                'date_range': schedule_date,
            }

            schedule_model = Schedule()
            new_schedule = schedule_model.add_schedule(current_user, schedule_date, schedule_data)

            if new_schedule:
                new_schedule['_id'] = str(new_schedule['_id'])
                return jsonify(new_schedule), 200

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


def _verify_schedule_ownership(schedule_to_update):
    if schedule_to_update['identifier'] != g.current_user:
        return jsonify({"error": "Forbidden"}), 403
    return None


def update_schedule_shift(scheduleId, shiftId):
    try:
        data = request.json
        employees = data.get('employees')

        if not employees:
            return jsonify({"error": "Missing employees"}), 400

        schedule = Schedule()
        schedule_to_update = schedule.get_schedule_by_id(scheduleId)
        if not schedule_to_update:
            return jsonify({"error": "Schedule not found"}), 404

        ownership_error = _verify_schedule_ownership(schedule_to_update)
        if ownership_error:
            return ownership_error

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

        ownership_error = _verify_schedule_ownership(schedule_to_update)
        if ownership_error:
            return ownership_error

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
