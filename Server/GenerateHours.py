import csv
from datetime import datetime, timedelta
from collections import defaultdict

# Function to convert string to time object
def convert_to_time(time_str):
    return datetime.strptime(time_str, "%H:%M")

# Function to generate intervals from a time range
def generate_intervals(start_time, end_time, number_of_employ):
    intervals = []
    current_time = start_time
    while current_time < end_time:
        next_time = current_time + timedelta(minutes=30)
        intervals.append({
            "start_time": current_time.strftime("%H:%M"),
            "end_time": next_time.strftime("%H:%M"),
            "number_of_employ": number_of_employ
        })
        current_time = next_time
    return intervals

# Read timeRange.csv and generate the inputHours.csv
def generate_input_hours(time_range_file, output_file):
    with open(time_range_file, mode='r') as infile:
        reader = csv.DictReader(infile)
        
        # Prepare a dictionary to accumulate number of employees for each interval
        output_data = defaultdict(lambda: {"number_of_employ": 0})
        
        for row in reader:
            # Extract the necessary information from the row
            day = row["day"]
            skill = row["skill"]
            start_time = convert_to_time(row["start_time"])
            end_time = convert_to_time(row["end_time"])
            number_of_employ = int(row["number_of_employ"])
            
            # Generate the 30-minute intervals
            intervals = generate_intervals(start_time, end_time, number_of_employ)
            
            for interval in intervals:
                # Use (day, skill, start_time) as the key for accumulation
                key = (day, skill, interval["start_time"], interval["end_time"])
                
                # Accumulate the number of employees for the same interval
                output_data[key]["number_of_employ"] += interval["number_of_employ"]
        
        # Convert the accumulated data into a list for writing to CSV
        final_output = []
        for key, value in output_data.items():
            day, skill, start_time, end_time = key
            final_output.append({
                "day": day,
                "skill": skill,
                "start_time": start_time,
                "end_time": end_time,
                "number_of_employ": value["number_of_employ"]
            })
        
        # Write the output data into inputHours.csv
        with open(output_file, mode='w', newline='') as outfile:
            fieldnames = ["day", "skill", "start_time", "end_time", "number_of_employ"]
            writer = csv.DictWriter(outfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(final_output)

# Run the function
generate_input_hours('timeRange.csv', 'inputHours.csv')
