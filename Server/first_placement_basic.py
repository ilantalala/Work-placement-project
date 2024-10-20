from pulp import *
import pandas as pd
from collections import defaultdict

def optimize_shifts(input_hours_file="inputHours.csv", time_range_file="timeRange.csv"):
    # Read data from CSV files into DataFrames
    table2_df = pd.read_csv(input_hours_file)
    table3_df = pd.read_csv(time_range_file)

    # Define the problem as a minimization problem
    prob = LpProblem("Shift_Optimization", LpMinimize)

    # Calculate max_employees_per_shift based on table2 max half hour manpower
    max_employees_per_shift = table2_df['number_of_employ'].max()

    # Define decision variables: Number of employees assigned to each shift
    num_employees = LpVariable.dicts("NumEmployees", range(len(table3_df)), lowBound=0, upBound=max_employees_per_shift, cat='Integer')

    # Define fines for overstaffing and understaffing
    overstaffing_fine_factor = 10
    understaffing_fine_factor = 20

    # Helper function to convert time string to minutes
    def time_to_minutes(time_str):
        hours, minutes = map(int, time_str.split(':'))
        return hours * 60 + minutes

    # Create a dictionary to store required employees for each half-hour interval
    required_employees = defaultdict(int)
    for _, row in table2_df.iterrows():
        start = time_to_minutes(row['start_time'])
        end = time_to_minutes(row['end_time'])
        skill = row['skill']
        for time in range(start, end, 30):
            required_employees[(skill, time)] = row['number_of_employ']

    # Determine the time range based on table3
    min_start_time = min(time_to_minutes(time) for time in table3_df['start_time'])
    max_end_time = max(time_to_minutes(time) for time in table3_df['end_time'])

    # Create variables for overstaffing and understaffing for each half-hour interval
    overstaffing = LpVariable.dicts("Overstaffing", [(skill, time) for skill in set(table3_df['skill']) for time in range(min_start_time, max_end_time, 30)], lowBound=0)
    understaffing = LpVariable.dicts("Understaffing", [(skill, time) for skill in set(table3_df['skill']) for time in range(min_start_time, max_end_time, 30)], lowBound=0)

    # Create constraints for each half-hour interval
    for skill in set(table3_df['skill']):
        for time in range(min_start_time, max_end_time, 30):
            assigned_employees = lpSum([
                num_employees[i] 
                for i in range(len(table3_df)) 
                if table3_df.iloc[i]['skill'] == skill 
                and time_to_minutes(table3_df.iloc[i]['start_time']) <= time < time_to_minutes(table3_df.iloc[i]['end_time'])
            ])
            
            prob += assigned_employees - overstaffing[(skill, time)] + understaffing[(skill, time)] == required_employees[(skill, time)]

    # Define the objective function to minimize overstaffing and understaffing
    prob += lpSum([
        overstaffing_fine_factor * overstaffing[(skill, time)] + 
        understaffing_fine_factor * understaffing[(skill, time)]
        for skill in set(table3_df['skill']) 
        for time in range(min_start_time, max_end_time, 30)
    ])

    # Solve the problem
    prob.solve()

    # Update table3_df with the number of employees assigned
    table3_df['number_of_employee'] = [int(num_employees[i].varValue) if num_employees[i].varValue is not None else 0 for i in range(len(table3_df))]
    
    # Create a dictionary to store overstaffing and understaffing information
    staffing_info = {
        (skill, time): {
            'overstaffing': overstaffing[(skill, time)].varValue,
            'understaffing': understaffing[(skill, time)].varValue
        }
        for skill in set(table3_df['skill'])
        for time in range(min_start_time, max_end_time, 30)
    }
   
    return table3_df, LpStatus[prob.status], value(prob.objective)