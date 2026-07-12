#logicFiles.py
import io
import uuid
import pandas as pd
from flask import g, jsonify, request
from models.files_model import Files
from models.shifts_model import Shifts
from optimized_shift_algorithm import optimize_shifts


def parse_csv_content(csv_content):
    try:
        df = pd.read_csv(io.StringIO(csv_content))
        df['_id'] = [str(uuid.uuid4()) for _ in range(len(df))]
        return df.to_dict('records')
    except Exception as e:
        print("Error processing CSV content:", e)
        return []


def upload_data():
    try:
        files = Files()
        data = request.get_json()
        current_user = g.current_user

        employee_skill_content = data.get('employeeSkillContent')
        worker_requirements_content = data.get('workerRequirementsContent')
        shift_basket_content = data.get('shiftBasketContent')

        if None in [employee_skill_content, worker_requirements_content, shift_basket_content]:
            return jsonify({"error": "Missing required data in the request"}), 400

        employee_skill_data = parse_csv_content(employee_skill_content)
        worker_requirements_data = parse_csv_content(worker_requirements_content)
        shift_basket_data = parse_csv_content(shift_basket_content)

        if files.add_files(current_user, employee_skill_data, worker_requirements_data, shift_basket_data):
            print('Files saved successfully')

            try:
                worker_requirements_df = pd.DataFrame(worker_requirements_data)
                shift_basket_df = pd.DataFrame(shift_basket_data)

                worker_requirements_df['number_of_employ'] = pd.to_numeric(worker_requirements_df['number_of_employ'])

                final_table, status, objective = optimize_shifts(worker_requirements_df, shift_basket_df)

                final_table_list = final_table.to_dict('records')
                for shift in final_table_list:
                    if '_id' in shift:
                        del shift['_id']

                shift = Shifts()
                shift.add_shifts(current_user, final_table_list)

                return jsonify({
                    'message': 'Files saved successfully',
                    'data': final_table_list
                }), 200

            except Exception as e:
                print(f"Optimization error: {str(e)}")
                import traceback
                traceback.print_exc()
                return jsonify({
                    'error': f'Optimization error: {str(e)}'
                }), 500
        else:
            return jsonify({
                'error': 'Error: Failed to create files'
            }), 500

    except Exception as e:
        print(f"Upload error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': f'Upload error: {str(e)}'
        }), 500


def get_initial_data():
    try:
        files = Files()
        files_list = files.get_user_files(g.current_user)
        return jsonify(files_list), 200
    except Exception as e:
        print("Error details:", e)
        return jsonify({"error": str(e)}), 500


def delete_files():
    try:
        files = Files()
        if files.delete_user_files(g.current_user):
            return jsonify({"message": "Files deleted successfully"}), 200
        return jsonify({"error": "No files found to delete"}), 404
    except Exception as e:
        print("Error deleting files:", e)
        return jsonify({"error": str(e)}), 500
