import pandas as pd
from collections import defaultdict
from datetime import datetime

def assign_employees_to_shifts(employee_skills_data, optimized_shifts):
    """
    Assign employees to shifts based on their skills and shift requirements.
    Uses cyclic assignment to maintain balance between shifts.
    """
    try:
        # Convert and clean employee skills data
        if isinstance(employee_skills_data, list):
            employee_skills_df = pd.DataFrame(employee_skills_data)
        else:
            employee_skills_df = employee_skills_data

        # Clean string values
        for col in employee_skills_df.columns:
            if employee_skills_df[col].dtype == 'object':
                employee_skills_df[col] = employee_skills_df[col].apply(
                    lambda x: x.strip() if isinstance(x, str) else x
                )
        
        # Create employees dictionary
        employees = defaultdict(list)
        for _, row in employee_skills_df.iterrows():
            employee_name = row['name']
            if not isinstance(employee_name, str):
                continue
            
            for skill_col in ['skill1', 'skill2', 'skill3']:
                if skill_col in employee_skills_df.columns:
                    skill_value = row[skill_col]
                    if isinstance(skill_value, str):
                        skill_value = skill_value.strip()
                        employees[employee_name].append(skill_value)

        def get_employees_with_skill(skill):
            return [emp for emp, skills in employees.items() if skill in skills]

        # Prepare optimized_shifts DataFrame
        if not isinstance(optimized_shifts, pd.DataFrame):
            optimized_shifts = pd.DataFrame(optimized_shifts)

        optimized_shifts['cost_of_shift'] = pd.to_numeric(optimized_shifts['cost_of_shift'], errors='coerce')
        optimized_shifts['number_of_employee'] = pd.to_numeric(optimized_shifts['number_of_employee'], errors='coerce')

        # Sort shifts
        non_zero_shifts = optimized_shifts[optimized_shifts['number_of_employee'] > 0].copy()
        zero_shifts = optimized_shifts[optimized_shifts['number_of_employee'] == 0].copy()

        non_zero_shifts = non_zero_shifts.sort_values(
            ['number_of_employee', 'cost_of_shift'], 
            ascending=[False, True]
        )
        
        optimized_shifts = pd.concat([non_zero_shifts, zero_shifts])
        optimized_shifts['assigned_employees'] = [[] for _ in range(len(optimized_shifts))]

        # Track assignments
        daily_assignments = defaultdict(set)
        total_assignments_needed = int(optimized_shifts['number_of_employee'].sum())
        total_assignments_made = 0

        # Cyclic assignment
        max_cycles = int(optimized_shifts['number_of_employee'].max())+1 # Safety limit
        cycle = 0
        
        while total_assignments_made < total_assignments_needed and cycle < max_cycles:
            cycle += 1
            assignments_this_cycle = 0

            # Get shifts that still need workers
            incomplete_shifts = optimized_shifts[
                optimized_shifts.apply(
                    lambda row: len(row['assigned_employees']) < row['number_of_employee'] 
                    if row['number_of_employee'] > 0 else False, 
                    axis=1
                )
            ]

            if incomplete_shifts.empty:
                break

            # Process each incomplete shift once per cycle
            for index, shift in incomplete_shifts.iterrows():
                current_assignments = optimized_shifts.at[index, 'assigned_employees']
                needed_employees = int(shift['number_of_employee'])
                
                if len(current_assignments) >= needed_employees:
                    continue

                skill = str(shift['skill']).strip()
                day = str(shift['day']).strip()
                
                # Get available employees for this shift
                available_employees = [
                    emp for emp in get_employees_with_skill(skill)
                    if emp not in daily_assignments[day]
                ]

                # Try to assign one employee to this shift
                if available_employees:
                    employee = available_employees[0]
                    optimized_shifts.at[index, 'assigned_employees'].append(employee)
                    daily_assignments[day].add(employee)
                    assignments_this_cycle += 1
                    total_assignments_made += 1
            
            if assignments_this_cycle == 0:
                break

        # Fill unfilled positions
        for index, shift in optimized_shifts.iterrows():
            if shift['number_of_employee'] > 0:
                current_assignments = optimized_shifts.at[index, 'assigned_employees']
                unfilled_count = int(shift['number_of_employee']) - len(current_assignments)
                if unfilled_count > 0:
                    current_assignments.extend(["Unfilled"] * unfilled_count)
                    optimized_shifts.at[index, 'assigned_employees'] = current_assignments

        # Sort by start time for final output
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