# second_placement_basic.py
import pandas as pd
from collections import defaultdict
from datetime import datetime

def assign_employees_to_shifts(employee_skills_data, optimized_shifts):
    """
    Assign employees to shifts based on their skills and shift requirements.
    First sorts shifts by number_of_employee (most needed first), 
    then by cost_of_shift (cheapest first).
    """
    try:
        # Convert employee_skills_data to DataFrame if needed
        if isinstance(employee_skills_data, list):
            employee_skills_df = pd.DataFrame(employee_skills_data)
        else:
            employee_skills_df = employee_skills_data

        print("DEBUG: Employee skills DataFrame shape:", employee_skills_df.shape)
        print("DEBUG: Employee skills columns:", employee_skills_df.columns)
        print("DEBUG: First few rows of employee skills:")
        print(employee_skills_df.head())

        # Clean column names
        employee_skills_df = employee_skills_df.applymap(
            lambda x: x.strip() if isinstance(x, str) else x
        )
        
        # Create a dictionary of employees and their skills
        employees = defaultdict(list)
        for _, row in employee_skills_df.iterrows():
            employee_name = row.get('name', None)
            if not employee_name:
                continue

            # Clean the employee name
            employee_name = str(employee_name).strip()

            for skill_col in ['skill1', 'skill2', 'skill3']:
                skill_value = row.get(skill_col, None)
                if skill_value and pd.notna(skill_value):
                    # Clean the skill value
                    skill_value = str(skill_value).strip()
                    employees[employee_name].append(skill_value)

        print("DEBUG: Created employees dictionary with", len(employees), "employees")
        print("DEBUG: Sample employees and their skills:")
        for emp, skills in list(employees.items())[:5]:
            print(f"{emp}: {skills}")

        # Function to get all employees with a specific skill
        def get_employees_with_skill(skill):
            return [emp for emp, skills in employees.items() if skill in skills]

        # Ensure optimized_shifts is a DataFrame
        if not isinstance(optimized_shifts, pd.DataFrame):
            optimized_shifts = pd.DataFrame(optimized_shifts)

        # Convert columns to correct types
        optimized_shifts['cost_of_shift'] = pd.to_numeric(optimized_shifts['cost_of_shift'], errors='coerce')
        optimized_shifts['number_of_employee'] = pd.to_numeric(optimized_shifts['number_of_employee'], errors='coerce')

        print("\nDEBUG: Before sorting:")
        print(optimized_shifts[['skill', 'number_of_employee', 'cost_of_shift']].head())

        # Changed sorting logic:
        # 1. First separate shifts that need workers from those that don't
        non_zero_shifts = optimized_shifts[optimized_shifts['number_of_employee'] > 0].copy()
        zero_shifts = optimized_shifts[optimized_shifts['number_of_employee'] == 0].copy()

        # 2. Sort non-zero shifts by number_of_employee (descending) and cost_of_shift (ascending)
        non_zero_shifts = non_zero_shifts.sort_values(
            ['number_of_employee', 'cost_of_shift'], 
            ascending=[False, True]  # Descending for number_of_employee, ascending for cost
        )

        # 3. Concatenate back with zero-employee shifts
        optimized_shifts = pd.concat([non_zero_shifts, zero_shifts])

        print("\nDEBUG: After sorting:")
        print(optimized_shifts[['skill', 'number_of_employee', 'cost_of_shift']])

        # Create the 'assigned_employees' column
        optimized_shifts['assigned_employees'] = [[] for _ in range(len(optimized_shifts))]

        total_assignments_needed = optimized_shifts['number_of_employee'].sum()
        total_assignments_made = 0
        print(f"\nDEBUG: Total assignments needed: {total_assignments_needed}")

        # Track assignments per day to prevent multiple shifts per day
        daily_assignments = defaultdict(set)

        # Assign employees to shifts cyclically
        cycle_count = 0
        while True:
            cycle_count += 1
            assignments_this_cycle = 0
            print(f"\nDEBUG: Starting cycle {cycle_count}")

            # Process shifts ordered by number of employees needed and cost
            for index, shift in optimized_shifts[optimized_shifts['number_of_employee'] > 0].iterrows():
                current_assignments = optimized_shifts.at[index, 'assigned_employees']
                if len(current_assignments) >= int(shift['number_of_employee']):
                    continue

                skill = str(shift['skill']).strip()
                day = str(shift['day']).strip()
                
                # Get available employees for this skill who haven't been assigned today
                available_employees = [
                    emp for emp in get_employees_with_skill(skill)
                    if emp not in daily_assignments[day]  # Only check current day
                ]

                if available_employees:
                    assigned_employee = available_employees[0]
                    optimized_shifts.at[index, 'assigned_employees'].append(assigned_employee)
                    daily_assignments[day].add(assigned_employee)
                    assignments_this_cycle += 1
                    total_assignments_made += 1
                    print(f"DEBUG: Assigned {assigned_employee} to {skill} shift on {day}")
                    print(f"Workers needed: {shift['number_of_employee']}, Cost: {shift['cost_of_shift']}")

            print(f"DEBUG: Made {assignments_this_cycle} assignments in cycle {cycle_count}")
            if assignments_this_cycle == 0:
                break

        print(f"\nDEBUG: Total assignments made: {total_assignments_made}")

        # Fill remaining positions with "Unfilled"
        for index, shift in optimized_shifts.iterrows():
            if shift['number_of_employee'] > 0:
                current_assignments = optimized_shifts.at[index, 'assigned_employees']
                unfilled_count = int(shift['number_of_employee']) - len(current_assignments)
                if unfilled_count > 0:
                    current_assignments.extend(["Unfilled"] * unfilled_count)
                    optimized_shifts.at[index, 'assigned_employees'] = current_assignments

        # Sort back by start time for the final output
        optimized_shifts['start_datetime'] = pd.to_datetime(
            optimized_shifts['start_time'], 
            format='%H:%M', 
            errors='coerce'
        )
        final_shifts = optimized_shifts.sort_values('start_datetime')

        print("\nDEBUG: Final assignments sample:")
        for _, shift in final_shifts[final_shifts['number_of_employee'] > 0].head().iterrows():
            print(f"Shift: {shift['skill']} on {shift['day']}")
            print(f"Workers needed: {shift['number_of_employee']}")
            print(f"Cost: {shift['cost_of_shift']}")
            print(f"Assigned: {shift['assigned_employees']}")
            print("---")

        return final_shifts

    except Exception as e:
        print("Error in assign_employees_to_shifts:", str(e))
        import traceback
        traceback.print_exc()
        raise