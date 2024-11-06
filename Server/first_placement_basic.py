from pulp import *
import pandas as pd
from collections import defaultdict

def optimize_shifts(input_hours_file="inputHours.csv", time_range_file="timeRange.csv"):
    # Read data from CSV files into DataFrames
    table2_df = pd.read_csv(input_hours_file)
    table3_df = pd.read_csv(time_range_file)

    prob = LpProblem("Shift_Optimization", LpMinimize)

    # Calculate max_employees_per_shift based on table2 max half hour manpower
    max_employees_per_shift = table2_df['number_of_employ'].max()

    # Define decision variables for each shift, now including the day
    num_employees = LpVariable.dicts("NumEmployees", 
                                   range(len(table3_df)), 
                                   lowBound=0, 
                                   upBound=max_employees_per_shift, 
                                   cat='Integer')

    # Define fines for overstaffing and understaffing
    overstaffing_fine_factor = 10
    understaffing_fine_factor = 20

    def time_to_minutes(time_str):
        hours, minutes = map(int, time_str.split(':'))
        return hours * 60 + minutes

    # Create a dictionary to store required employees for each half-hour interval and day
    required_employees = defaultdict(int)
    for _, row in table2_df.iterrows():
        start = time_to_minutes(row['start_time'])
        end = time_to_minutes(row['end_time'])
        skill = row['skill']
        day = row['day']  # Now including the day
        for time in range(start, end, 30):
            required_employees[(day, skill, time)] = row['number_of_employ']

    # Determine the time range based on table3
    min_start_time = min(time_to_minutes(time) for time in table3_df['start_time'])
    max_end_time = max(time_to_minutes(time) for time in table3_df['end_time'])

    # Create variables for overstaffing and understaffing for each half-hour interval and day
    overstaffing = LpVariable.dicts("Overstaffing", 
        [(day, skill, time) 
         for day in set(table3_df['day'])
         for skill in set(table3_df['skill']) 
         for time in range(min_start_time, max_end_time, 30)], 
        lowBound=0)
    
    understaffing = LpVariable.dicts("Understaffing", 
        [(day, skill, time) 
         for day in set(table3_df['day'])
         for skill in set(table3_df['skill']) 
         for time in range(min_start_time, max_end_time, 30)], 
        lowBound=0)

    # Create constraints for each half-hour interval, now including days
    for day in set(table3_df['day']):
        for skill in set(table3_df['skill']):
            for time in range(min_start_time, max_end_time, 30):
                assigned_employees = lpSum([
                    num_employees[i] 
                    for i in range(len(table3_df)) 
                    if (table3_df.iloc[i]['skill'] == skill and
                        table3_df.iloc[i]['day'] == day and
                        time_to_minutes(table3_df.iloc[i]['start_time']) <= time < time_to_minutes(table3_df.iloc[i]['end_time']))
                ])
                
                prob += assigned_employees - overstaffing[(day, skill, time)] + understaffing[(day, skill, time)] == required_employees[(day, skill, time)]

    # Define the objective function to minimize overstaffing and understaffing
    prob += lpSum([
        overstaffing_fine_factor * overstaffing[(day, skill, time)] + 
        understaffing_fine_factor * understaffing[(day, skill, time)]
        for day in set(table3_df['day'])
        for skill in set(table3_df['skill']) 
        for time in range(min_start_time, max_end_time, 30)
    ])

    # Solve the problem
    prob.solve()

    # Update table3_df with the number of employees assigned
    table3_df['number_of_employee'] = [int(num_employees[i].varValue) if num_employees[i].varValue is not None else 0 
                                      for i in range(len(table3_df))]
    
    # Create a dictionary to store overstaffing and understaffing information
    staffing_info = {
        (day, skill, time): {
            'overstaffing': overstaffing[(day, skill, time)].varValue,
            'understaffing': understaffing[(day, skill, time)].varValue
        }
        for day in set(table3_df['day'])
        for skill in set(table3_df['skill'])
        for time in range(min_start_time, max_end_time, 30)
    }
   
    return table3_df, LpStatus[prob.status], value(prob.objective)