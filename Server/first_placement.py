from pulp import *
import pandas as pd
from collections import defaultdict
from datetime import datetime
# Read data from CSV files into DataFrames
table1_df = pd.read_csv("inputSkills.csv")
table2_df = pd.read_csv("inputHours.csv")
table3_df = pd.read_csv("timeRange.csv")

# Define the problem as a maximization problem
prob = LpProblem("Shift_Optimization", LpMaximize)

# Define decision variables: Shift[i][j] is 1 if worker j is assigned to shift i, 0 otherwise
shift_vars = LpVariable.dicts("Shift", (range(len(table3_df)), range(len(table1_df))), 0, 1, LpInteger)

# Define number of employees assigned to each shift
num_employees = LpVariable.dicts("NumEmployees", range(len(table3_df)), lowBound=0, cat='Integer')

# Strip any leading or trailing spaces from the column names
table1_df.columns = table1_df.columns.str.strip()

#-------DATA STRUCTRES-------------------------------------------
# Create the hashmap
hashmap = {}
# Iterate over each row in table1_df
for index, row in table1_df.iterrows():
    # Iterate over each skill column (Skill1, Skill2, Skill3)
    for skill_column in ['skill1', 'skill2', 'skill3']:
        # Get the skill value from the current skill column
        skill = row[skill_column].strip()  # Remove leading and trailing spaces
        # Check if the skill exists in the hashmap
        if skill not in hashmap:
            # If the skill does not exist, initialize it as an empty list
            hashmap[skill] = []
        # Strip leading and trailing spaces from the name
        name = row['name'].strip()
        # Append the tuple (ID, Name) to the list corresponding to the skill
        hashmap[skill].append((row['ID'], name))
    

skill_schedule = defaultdict(dict)

# Populate the data structure
for _, row in table2_df.iterrows():
    day = row['day']
    skill = row['skill']
    start_time = row['start_time']
    end_time = row['end_time']
    number_of_employ = row['number_of_employ']
    
    # Create the time interval key
    time_interval = (start_time, end_time)
    
    # Create the key for the inner dictionary
    inner_key = (day, skill)
    
    # Check if the inner key exists in the outer dictionary
    if inner_key not in skill_schedule[skill]:
        # If not, initialize it with an empty list
        skill_schedule[skill][inner_key] = []
    
    # Append the time interval and number of employees to the list
    skill_schedule[skill][inner_key].append((time_interval, number_of_employ))

def StringtoInt(time_string):
    hours, minutes = map(int, time_string.split(':'))
    return hours * 60 + minutes
overlap_shifts = {}

for i, row1 in table3_df.iterrows():
    start_time1 = StringtoInt(row1['start_time'])
    end_time1 = StringtoInt(row1['end_time'])
    overlap_shifts[i] = []
    
    for j, row2 in table3_df.iterrows():
        if i == j:
            continue  # Skip comparing the same shift with itself
        
        start_time2 = StringtoInt(row2['start_time'])
        end_time2 = StringtoInt(row2['end_time'])
        
        # Check if shifts overlap
        if start_time1 < end_time2 and start_time2 < end_time1:
            overlap_shifts[i].append(j)

skill_counts = {}
# Create a dictionary to store the number of workers with each skill
for skill, workers in hashmap.items():
    cleaned_skill = skill.strip()  # Clean the skill name by removing trailing spaces
    num_workers = len(workers)  # Count the number of workers for the current skill
    skill_counts[cleaned_skill] = num_workers  # Store the count in the skill_counts dictionary
#-------------CONSTRAINTS-------------------------------
#A fine of half the cost of the shift for placing more than necessary, and a fine of the cost of a shift for a lack of an employee.
total_fines = lpSum(
    [
        (required_employees_interval - num_employees[shift_index]) * (shift_row['cost_of_shift']/2)
        if required_employees_interval - num_employees[shift_index] >= 1
        else shift_row['cost_of_shift']
        for shift_index, shift_row in table3_df.iterrows()
        for interval, required_employees_interval in skill_schedule[shift_row['skill']][(shift_row['day'], shift_row['skill'])]
    ]
)

# Add total fines to the objective function (since we are maximizing the total cost, subtract fines)
prob += lpSum([shift_vars[i][j] * table3_df.iloc[i]['cost_of_shift'] for i in range(len(table3_df)) for j in range(len(table1_df))]) - total_fines, "Total_Cost_of_Shifts"

# Ensure a worker is only assigned to a shift if they have the required skill
for i in range(len(table3_df)):
    required_skill = table3_df.iloc[i]['skill']
    for j in range(len(table1_df)):
        workers_with_skill = hashmap.get(required_skill, [])  # Get list of workers with required skill
        worker_id_name = (table1_df.iloc[j]['ID'], table1_df.iloc[j]['name'].strip())
        if worker_id_name in workers_with_skill:
            prob += shift_vars[i][j] <= 1, f"Skill_Constraint_Shift_{i}_Worker_{j}"
        else:
            prob += shift_vars[i][j] == 0, f"Skill_Constraint_Shift_{i}_Worker_{j}"

# Constraints to ensure each worker could not take negative numbers of shifts
for j in range(len(table1_df)):
    for i in range(len(table3_df)):
        # prob += lpSum([shift_vars[i][j] for i in range(len(table3_df))]) <= 1, f"One_Shift_Per_Worker_{j}_{i}"
        prob += lpSum([shift_vars[i][j] for i in range(len(table3_df))]) >= 0

    # Adding constraints for overlapping shifts
    if j in overlap_shifts:
        for k in overlap_shifts[j]:
            prob += lpSum([shift_vars[k][j]]) == 0, f"Overlap_Constraint_{j}_{k}"

# Ensure the total number of employees assigned to shifts for each skill does not exceed the number of workers with that skill
for skill, num_workers_with_skill in skill_counts.items():
    skill_shifts = table3_df[table3_df['skill'] == skill]
    for _, shift_row in skill_shifts.iterrows():
        shift_index = shift_row.name
        prob += num_employees[shift_index] == lpSum([shift_vars[shift_index][j] for j in range(len(table1_df))]), f"Num_Employees_Shift_{shift_index}"
        prob += num_employees[shift_index] <= num_workers_with_skill, f"Num_Workers_Skill_{skill}_Shift_{shift_index}"
        prob += num_employees[shift_index] >= 0, f"Non_Negative_Num_Employees_Shift_{shift_index}"  # Constraint for non-negative num_employees

# Solve the problem
prob.solve()

# Update table3_df with the number of employees assigned to each shift
table3_df['number_of_employee'] = [int(num_employees[i].varValue) if num_employees[i].varValue is not None else 0 for i in range(len(table3_df))]

# Print the updated table3_df
print(table3_df)

# Print the final status of the problem
print("Final Status:", LpStatus[prob.status])

# # Print the total cost of assigned shifts
print("Total Cost:", value(prob.objective))

# Print details of variables if needed
# for v in prob.variables():
#     print(v.name, "=", v.varValue)
