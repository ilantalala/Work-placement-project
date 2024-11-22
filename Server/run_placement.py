# run_placement.py
import pandas as pd
from first_placement_basic import optimize_shifts
from second_placement_basic import assign_employees_to_shifts
def print_worker_summary(final_assignments):
    """
    Print a detailed summary of worker assignments for each shift.
    """
    print("\nDetailed Summary of Worker Assignments:")
    print("=" * 80)
    
    # Sort by day and start time
    final_assignments['start_datetime'] = pd.to_datetime(
        final_assignments['start_time'], 
        format='%H:%M'
    )
    sorted_assignments = final_assignments.sort_values(['day', 'start_datetime'])
    
    current_day = None
    for _, shift in sorted_assignments.iterrows():
        # Print day header if it's a new day
        if current_day != shift['day']:
            current_day = shift['day']
            print(f"\n{current_day:=^80}")
        
        print(f"\nShift: {shift['skill']}")
        print(f"Time: {shift['start_time']} to {shift['end_time']}")
        print(f"Cost: {shift['cost_of_shift']}")
        print(f"Required workers: {int(shift['number_of_employee'])}")
        
        assigned_employees = shift['assigned_employees']
        actual_workers = [emp for emp in assigned_employees if emp != "Unfilled"]
        unfilled_count = sum(1 for emp in assigned_employees if emp == "Unfilled")
        
        print(f"Number of workers assigned: {len(actual_workers)}")
        if actual_workers:
            print("Assigned workers:")
            for i, worker in enumerate(actual_workers, 1):
                print(f"  {i}. {worker}")
        
        if unfilled_count > 0:
            print(f"Unfilled positions: {unfilled_count}")
        
        print("-" * 40)

def clean_column_names(df):
    """Clean column names by stripping whitespace and standardizing names"""
    df.columns = df.columns.str.strip()
    # Create a mapping of common column name variations
    column_mapping = {
        ' Name': 'Name',
        'name': 'Name',
        ' Skill1': 'Skill1',
        ' Skill2': 'Skill2',
        ' Skill3': 'Skill3',
        'ID': 'Name'  # If ID is used instead of Name
    }
    return df.rename(columns=column_mapping)

def run_placement_algorithms():
    try:
        # 1. Read and clean input CSV files
        print("Reading input files...")
        worker_requirements = pd.read_csv("inputHours.csv")
        shift_basket = pd.read_csv("timeRange.csv")
        employee_skills = pd.read_csv("inputSkills.csv")

        # Clean the DataFrames
        worker_requirements = clean_column_names(worker_requirements)
        shift_basket = clean_column_names(shift_basket)
        employee_skills = clean_column_names(employee_skills)

        # Convert number_of_employ to numeric if present
        if 'number_of_employ' in worker_requirements.columns:
            worker_requirements['number_of_employ'] = pd.to_numeric(
                worker_requirements['number_of_employ'], 
                errors='coerce'
            )

        print("\nData shapes:")
        print(f"Worker requirements: {worker_requirements.shape}")
        print(f"Shift basket: {shift_basket.shape}")
        print(f"Employee skills: {employee_skills.shape}")

        # Validate required columns
        required_worker_cols = ['day', 'skill', 'start_time', 'end_time', 'number_of_employ']
        required_shift_cols = ['day', 'start_time', 'end_time', 'cost_of_shift']
        required_employee_cols = ['Name', 'Skill1', 'Skill2', 'Skill3']

        for df, name, req_cols in [
            (worker_requirements, 'Worker requirements', required_worker_cols),
            (shift_basket, 'Shift basket', required_shift_cols),
            (employee_skills, 'Employee skills', required_employee_cols)
        ]:
            missing_cols = [col for col in req_cols if col not in df.columns]
            if missing_cols:
                raise ValueError(f"Missing required columns in {name}: {missing_cols}")

        # 2. Run first optimization algorithm
        print("\nStarting first optimization algorithm...")
        print("Worker requirements columns:", worker_requirements.columns.tolist())
        print("Shift basket columns:", shift_basket.columns.tolist())
        
        optimized_shifts, status, total_cost = optimize_shifts(
            worker_requirements,
            shift_basket
        )
        print(f"Optimization Status: {status}")
        print(f"Total Cost: {total_cost}")
        print(f"Optimized shifts shape: {optimized_shifts.shape}")
        print("Optimized shifts columns:", optimized_shifts.columns.tolist())

        # 3. Run second placement algorithm
        print("\nStarting second placement algorithm...")
        print("Employee skills columns:", employee_skills.columns.tolist())
        
        final_assignments = assign_employees_to_shifts(
            employee_skills,
            optimized_shifts
        )

        # 4. Print results
        print("\nFinal Assignments:")
        print_worker_summary(final_assignments)

        # 5. Save results
        if final_assignments is not None:
            final_assignments.to_csv("final_shift_assignments.csv", index=False)
            print("\nFinal assignments have been saved to 'final_shift_assignments.csv'")
        else:
            print("\nWarning: No assignments were generated")

        return final_assignments

    except FileNotFoundError as e:
        print(f"Error: Could not find input file: {e.filename}")
        print(f"Make sure the following files exist in the current directory:")
        print("- inputHours.csv")
        print("- timeRange.csv")
        print("- inputSkills.csv")
        return None
    except ValueError as e:
        print(f"Error: Invalid data format: {str(e)}")
        return None
    except Exception as e:
        print(f"Error during placement algorithms: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    print("Starting placement algorithms...")
    results = run_placement_algorithms()
    if results is not None:
        print("Successfully completed placement algorithms.")
        print(f"Processed {len(results)} shifts")
    else:
        print("Failed to complete placement algorithms.")