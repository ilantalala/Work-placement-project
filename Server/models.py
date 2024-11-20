from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
import pandas as pd
import ast


mongo = PyMongo()

class User:
    def create_user(self, username, password, company_name, display_name):
        try:
            users = self.get_users_collection()
            hashed_password = generate_password_hash(password)
            users.insert_one({'username': username, 'password': hashed_password, 'company_name': company_name, 'display_name': display_name})  # Include company_name field
            return True
        except Exception as e:
            print(f"Error creating user: {e}")
            return False

    def find_user(self, username):
        try:
            users = self.get_users_collection()
            user_document = users.find_one({'username': username})
            return user_document
        except Exception as e:
            print(f"Error finding user: {e}")
            return None

    def get_users_collection(self):
        # Access the users collection from the MongoDB database
        db = mongo.db
        if 'users' not in db.list_collection_names():
            # If the users collection does not exist, create it
            db.create_collection('users')
        return db.users
    def find_user_by_name(self, user_name):
        try:
            users = self.get_users_collection()
            user_document = users.find_one({'username': user_name})
            return user_document
        except Exception as e:
            print(f"Error finding user: {e}")
            return None
        
class Files:
    def add_files(self,currentUser,employee_skill,worker_requirements,shift_basket):
         print(currentUser)
         try:
            files = self.get_files_collection()
            files.update_one(
                {'identifier': currentUser, 'type': 'employee_skill'}, 
                {'$set': {'data': employee_skill}}, 
                upsert=True 
            )

            # Upsert worker_requirements data
            files.update_one(
                {'identifier': currentUser, 'type': 'worker_requirements'}, 
                {'$set': {'data': worker_requirements}}, 
                upsert=True 
            )

            # Upsert shift_basket data
            files.update_one(
                {'identifier': currentUser, 'type': 'shift_basket'}, 
                {'$set': {'data': shift_basket}},  
                upsert=True  
            )

            return True
         except Exception as e:
            print(f"Error creating files: {e}")
            return False
    def find_file(self,currentUser):
        try:
            files = self.get_files_collection()
            files_document = files.find_one({'identifier': currentUser})
            return files_document
        except Exception as e:
            print(f"Error finding file: {e}")
            return None
    def get_user_files(self, currentUser):
        try:
            files = self.get_files_collection()
            all_files = files.find({ 'identifier': currentUser}, { '_id': 0 })            
            return list(all_files)
        except Exception as e:
            print(f"Error while finding user files: {e}")
            return None
    def get_files_collection(self):
        # Access the files collection from the MongoDB database
        db = mongo.db
        if 'files' not in db.list_collection_names():
            # If the files collection does not exist, create it
            db.create_collection('files')
        return db.files

class Shifts:
    def get_user_shifts(self, currentUser):
        try:
            shifts = self.get_shifts_collection()
            shifts_document = shifts.find_one({'identifier': currentUser})
            return shifts_document
        except Exception as e:
            print(f"Error finding shifts: {e}")
            return None
    def add_shifts(self,currentUser,shifts):
        print("user is", currentUser)
            # Check if currentUser is None or empty
        if not currentUser:
            raise ValueError("currentUser cannot be None")

        try:
            for shift in shifts:
                shift['id'] = str(uuid.uuid4())  # Add a unique ID to each shift

            # Get the shifts collection
            shifts_collection = self.get_shifts_collection()

            # Upsert the shifts data
            shifts_collection.update_one(
                {'identifier': currentUser},  # Query to find the document by user identifier
                {'$set': {'data': shifts}},  # Update operation to set the shifts data
                upsert=True  # Insert if no document matches the query
            )
            return True
        except Exception as e:
            print(f"Error creating shifts: {e}")
            return False
    def update_user_shifts(self, currentUser, shifts):
        # Check if currentUser is None or empty
        if not currentUser:
            raise ValueError("currentUser cannot be None")

        try:
            for shift in shifts:
                if 'id' not in shift:
                    shift['id'] = str(uuid.uuid4())  # Add a unique ID to each shift

            # Get the shifts collection
            shifts_collection = self.get_shifts_collection()

            # Update the shifts data
            shifts_collection.update_one(
                {'identifier': currentUser},  # Query to find the document by user identifier
                {'$set': {'data': shifts}}  # Update operation to set the shifts data
            )
            return shifts
        except Exception as e:
            print(f"Error updating shifts: {e}")
            return None
    def get_shifts_collection(self):
        db = mongo.db
        if 'shifts' not in db.list_collection_names():
            # If the shifts collection does not exist, create it
            db.create_collection('shifts')
        return db.shifts
class Schedule:
    def get_user_schedule(self, currentUser):
        try:
            schedule = self.get_schedule_collection()
            schedules = schedule.find({'identifier': currentUser})
            return schedules
        except Exception as e:
            print(f"Error finding schedule: {e}")
            return None
    def add_schedule(self,currentUser,scheduleDate):
        if not currentUser:
            raise ValueError("currentUser cannot be None")
        
        if not scheduleDate:
            raise ValueError("scheduleDate cannot be None")
        try:
            # 1. get the shifts (placement data) from db
            # 2. get the workers (employeeSkills) from db
            # create a schedule for the user (mock)
            # save in db: { workers, shifts, schedule, date, identifier }

            # Get date 
            start_date = scheduleDate[0]
            end_date = scheduleDate[1]

            # Get the shifts collection
            shifts_collection = Shifts().get_shifts_collection()
            shifts_document = shifts_collection.find_one({'identifier': currentUser})
            shifts = shifts_document['data']

            # Get the files collection
            files_collection = Files().get_files_collection()
            files_document = files_collection.find_one({'identifier': currentUser, 'type': "employee_skill"})
            employee_skill = files_document['data']

            # print("tomtom shifts", shifts)
            # print("tomtom employee_skill", employee_skill)

            # Create a schedule for the user
            ## TEMP CODE - UNTIL ALGORITHM IS FINISHED!!!
            schedule_csv = pd.read_csv("final_shift_assignments.csv")
            schedule = json_array = schedule_csv.to_dict(orient='records')

            for item in schedule:
                item['assigned_employees'] = ast.literal_eval(item['assigned_employees'])
                item['id'] = str(uuid.uuid4())

            # print("tomtom", schedule)
            # Get the schedule collection
            schedule_collection = self.get_schedule_collection()

            # Upsert the schedule data
            schedule_collection.update_one(
                {'identifier': currentUser, 'start_date': start_date, 'end_date': end_date}, 
                {'$set': { 'employee_skill': employee_skill, 'shifts': shifts, 'schedule': schedule }}, 
                upsert=True 
            )
            new_schedule = schedule_collection.find_one({'identifier': currentUser, 'start_date': start_date, 'end_date': end_date})
            return new_schedule
        except Exception as e:
            print(f"Error creating schedule: {e}")
            return False
    def get_schedule_collection(self):
        db = mongo.db
        if 'schedule' not in db.list_collection_names():
            # If the schedule collection does not exist, create it
            db.create_collection('schedule')
        return db.schedule
