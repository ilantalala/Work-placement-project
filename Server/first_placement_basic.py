from pulp import *
import pandas as pd
from collections import defaultdict

# Read data from CSV files into DataFrames
table2_df = pd.read_csv("inputHours.csv")
table3_df = pd.read_csv("timeRange.csv")

# Define the problem as a maximization problem
prob = LpProblem("Shift_Optimization", LpMaximize)

# Define decision variables: Number of employees assigned to each shift
num_employees = LpVariable.dicts("NumEmployees", range(len(table3_df)), lowBound=0, cat='Integer')

# Define fines for overstaffing and understaffing
overstaffing_fine_factor = 0.1
understaffing_fine_factor = 0.1

# Create skill_schedule from table2_df
skill_schedule = defaultdict(dict)
for _, row in table2_df.iterrows():
    day = row['day']
    skill = row['skill']
    start_time = row['start_time']
    end_time = row['end_time']
    number_of_employ = row['number_of_employ']
    
    inner_key = (day, skill)
    if inner_key not in skill_schedule[skill]:
        skill_schedule[skill][inner_key] = []
    skill_schedule[skill][inner_key].append(((start_time, end_time), number_of_employ))

# Auxiliary variables for overstaffing and understaffing fines
overstaffing_fines = []
understaffing_fines = []

# Create the total fines
for shift_index, shift_row in table3_df.iterrows():
    for interval, required_employees_interval in skill_schedule[shift_row['skill']][(shift_row['day'], shift_row['skill'])]:
        overstaffing = LpVariable(f"Overstaffing_{shift_index}_{interval}", lowBound=0, cat='Continuous')
        understaffing = LpVariable(f"Understaffing_{shift_index}_{interval}", lowBound=0, cat='Continuous')
        
        prob += overstaffing >= num_employees[shift_index] - required_employees_interval
        prob += understaffing >= required_employees_interval - num_employees[shift_index]
        
        overstaffing_fines.append(overstaffing * overstaffing_fine_factor * shift_row['cost_of_shift'])
        understaffing_fines.append(understaffing * understaffing_fine_factor * shift_row['cost_of_shift'])

total_fines = lpSum(overstaffing_fines + understaffing_fines)

# Define the objective function to maximize total cost minus fines
prob += lpSum([
    num_employees[i] * table3_df.iloc[i]['cost_of_shift']
    for i in range(len(table3_df))
]) - total_fines

# Solve the problem
prob.solve()

# Print the updated table3_df with the number of employees assigned
table3_df['number_of_employee'] = [int(num_employees[i].varValue) if num_employees[i].varValue is not None else 0 for i in range(len(table3_df))]
print(table3_df)

# Print the final status of the problem
print("Final Status:", LpStatus[prob.status])

# Print the total cost of assigned shifts
print("Total Cost:", value(prob.objective))
