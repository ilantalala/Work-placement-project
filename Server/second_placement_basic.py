import pandas as pd
from collections import defaultdict
import random
from first_placement_basic import optimize_shifts  # Make sure this import is correct
from datetime import datetime, timedelta
#The algorithm first sort the shifts by their cost from high to low, if 2 shifts have the same cost they will be 
# sorted by their amount of needed workers. then the algorithm will assign workers in cyclic.
def assign_employees_to_shifts(table1_path, optimized_shifts):
    # Load employee skills data
    table1 = pd.read_csv(table1_path)
    table1.columns = table1.columns.str.strip()
    
    # Create a dictionary of employees and their skills
    employees = defaultdict(list)
    for _, row in table1.iterrows():
        employee_name = row['Name']
        for skill_col in ['Skill1', 'Skill2', 'Skill3']:
            if pd.notna(row[skill_col]):
                employees[employee_name].append(row[skill_col].strip())

    # Function to get all employees with a specific skill
    def get_employees_with_skill(skill):
        return [emp for emp, skills in employees.items() if skill in skills]

    # Create the 'assigned_employees' column
    optimized_shifts['assigned_employees'] = [[] for _ in range(len(optimized_shifts))]

    # Sort shifts by cost_of_shift (descending) and then by number_of_employee (descending)
    optimized_shifts = optimized_shifts.sort_values(['cost_of_shift', 'number_of_employee'], ascending=[False, False])

    # Set to keep track of assigned employees for the day
    assigned_employees_for_day = set()

    # Assign employees to shifts cyclically
    while True:
        employees_assigned_this_cycle = False

        for index, shift in optimized_shifts.iterrows():
            if len(optimized_shifts.at[index, 'assigned_employees']) >= int(shift['number_of_employee']):
                continue  # Skip if shift is fully staffed

            skill = shift['skill'].strip()
            
            available_employees = [
                emp for emp in get_employees_with_skill(skill)
                if emp not in assigned_employees_for_day
            ]

            if available_employees:
                assigned_employee = available_employees[0]
                
                # Update the assigned_employees column
                optimized_shifts.at[index, 'assigned_employees'].append(assigned_employee)

                assigned_employees_for_day.add(assigned_employee)
                employees_assigned_this_cycle = True

        if not employees_assigned_this_cycle:
            break  # Stop if no employees were assigned in this cycle

    # Fill remaining positions with "Unfilled"
    for index, shift in optimized_shifts.iterrows():
        current_assignments = optimized_shifts.at[index, 'assigned_employees']
        unfilled_count = int(shift['number_of_employee']) - len(current_assignments)
        current_assignments.extend(["Unfilled"] * unfilled_count)
        optimized_shifts.at[index, 'assigned_employees'] = current_assignments

    # Sort back by start time for the final output
    optimized_shifts['start_datetime'] = pd.to_datetime(optimized_shifts['start_time'])
    optimized_shifts = optimized_shifts.sort_values('start_datetime')

    return optimized_shifts

def print_worker_summary(final_assignments):
    print("\nSummary of Worker Assignments:")
    for _, shift in final_assignments.iterrows():
        print(f"\nShift: {shift['skill']}")
        print(f"Time: {shift['start_time']} to {shift['end_time']}")
        
        assigned_employees = shift['assigned_employees']
        actual_workers = [emp for emp in assigned_employees if emp != "Unfilled"]
        
        print(f"Number of workers assigned: {len(actual_workers)}")
        if actual_workers:
            print("Assigned workers:")
            for worker in actual_workers:
                print(f"  - {worker}")
        else:
            print("No workers assigned to this shift.")
        print("-" * 40)

# Main execution
if __name__ == "__main__":
    print("Starting optimization...")
    optimized_shifts, status, total_cost = optimize_shifts()
    print(f"Optimization Status: {status}")
    print(f"Total Cost: {total_cost}")

    print("\nStarting employee assignment...")
    table1_path = "inputSkills.csv"
    final_assignments = assign_employees_to_shifts(table1_path, optimized_shifts)
    print(optimized_shifts)
    # Print the worker summary
    print_worker_summary(final_assignments)

    final_assignments.to_csv("final_shift_assignments.csv", index=False)
    print("Final shift assignments have been saved to 'final_shift_assignments.csv'")