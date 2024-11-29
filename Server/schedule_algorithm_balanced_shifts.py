# schedule_algorithm_balanced_shifts.py
import pandas as pd
from collections import defaultdict
from datetime import datetime, time

def is_late_shift(end_time):
    """Check if a shift ends after 18:00"""
    shift_end = datetime.strptime(end_time, '%H:%M').time()
    return shift_end >= time(18, 0)

def assign_employees_to_shifts_balanced(employee_skills_data, optimized_shifts):
    try:
        # Previous data preprocessing remains the same...
        if isinstance(employee_skills_data, list):
            employee_skills_df = pd.DataFrame(employee_skills_data)
        else:
            employee_skills_df = employee_skills_data

        # Clean column names
        employee_skills_df.columns = employee_skills_df.columns.str.strip()
        
        # Create a dictionary of employees and their skills
        employees = defaultdict(list)
        for _, row in employee_skills_df.iterrows():
            employee_name = str(row['name']).strip() if 'name' in row else None
            if not employee_name:
                continue
                
            for skill_col in ['skill1', 'skill2', 'skill3']:
                if skill_col in row and pd.notna(row[skill_col]) and str(row[skill_col]).strip():
                    skill_value = str(row[skill_col]).strip()
                    employees[employee_name].append(skill_value)

        # Track late shifts per employee
        late_shifts_count = defaultdict(int)
        
        def get_employees_with_skill(skill):
            return [emp for emp, skills in employees.items() if skill in skills]

        # Convert data types
        optimized_shifts['cost_of_shift'] = pd.to_numeric(optimized_shifts['cost_of_shift'], errors='coerce')
        optimized_shifts['number_of_employee'] = pd.to_numeric(optimized_shifts['number_of_employee'], errors='coerce')

        # Sorting logic
        non_zero_shifts = optimized_shifts[optimized_shifts['number_of_employee'] > 0].copy()
        zero_shifts = optimized_shifts[optimized_shifts['number_of_employee'] == 0].copy()

        non_zero_shifts = non_zero_shifts.sort_values(
            ['number_of_employee', 'cost_of_shift'], 
            ascending=[False, True]
        )

        optimized_shifts = pd.concat([non_zero_shifts, zero_shifts])
        optimized_shifts['assigned_employees'] = [[] for _ in range(len(optimized_shifts))]

        # Track assignments per day
        daily_assignments = defaultdict(set)

        def can_assign_to_shift(employee, shift):
            """Check if employee can be assigned to this shift"""
            day = str(shift['day']).strip()
            end_time = str(shift['end_time']).strip()
            
            # Check if employee already has a shift that day
            if employee in daily_assignments[day]:
                return False
                
            # Check late shift limit
            if is_late_shift(end_time):
                if late_shifts_count[employee] >= 3:
                    return False
                    
            return True

        # Assignment process
        cycle_count = 0
        while True:
            cycle_count += 1
            assignments_this_cycle = 0

            for index, shift in optimized_shifts[optimized_shifts['number_of_employee'] > 0].iterrows():
                current_assignments = optimized_shifts.at[index, 'assigned_employees']
                if len(current_assignments) >= int(shift['number_of_employee']):
                    continue

                skill = str(shift['skill']).strip()
                day = str(shift['day']).strip()
                end_time = str(shift['end_time']).strip()
                
                # Get eligible employees
                available_employees = [
                    emp for emp in get_employees_with_skill(skill)
                    if can_assign_to_shift(emp, shift)
                ]

                if available_employees:
                    assigned_employee = available_employees[0]
                    optimized_shifts.at[index, 'assigned_employees'].append(assigned_employee)
                    daily_assignments[day].add(assigned_employee)
                    
                    # Track late shifts
                    if is_late_shift(end_time):
                        late_shifts_count[assigned_employee] += 1
                    
                    assignments_this_cycle += 1
                    print(f"DEBUG: Assigned {assigned_employee} to {skill} shift on {day}")
                    print(f"End time: {end_time}, Late shifts count: {late_shifts_count[assigned_employee]}")

            if assignments_this_cycle == 0:
                break

        # Fill remaining positions with "Unfilled"
        for index, shift in optimized_shifts.iterrows():
            if shift['number_of_employee'] > 0:
                current_assignments = optimized_shifts.at[index, 'assigned_employees']
                unfilled_count = int(shift['number_of_employee']) - len(current_assignments)
                if unfilled_count > 0:
                    current_assignments.extend(["Unfilled"] * unfilled_count)
                    optimized_shifts.at[index, 'assigned_employees'] = current_assignments

        # Print late shift summary
        print("\nLate Shift Summary:")
        for employee, count in late_shifts_count.items():
            print(f"{employee}: {count} late shifts")

        # Sort by start time for output
        optimized_shifts['start_datetime'] = pd.to_datetime(
            optimized_shifts['start_time'], 
            format='%H:%M', 
            errors='coerce'
        )
        final_shifts = optimized_shifts.sort_values('start_datetime')

        return final_shifts

    except Exception as e:
        print("Error in assign_employees_to_shifts:", str(e))
        import traceback
        traceback.print_exc()
        raise