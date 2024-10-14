from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
import uuid

mongo = PyMongo()

class User:
    def create_user(self, username, password, company_name):
        try:
            users = self.get_users_collection()
            hashed_password = generate_password_hash(password)
            users.insert_one({'username': username, 'password': hashed_password, 'company_name': company_name})  # Include company_name field
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