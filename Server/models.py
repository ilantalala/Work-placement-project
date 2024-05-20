from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash

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
         try:
            files = self.get_files_collection()
            files.insert_one({'identifier': currentUser, 'data': employee_skill, 'type': 'employee_skill'})
            files.insert_one({'identifier': currentUser, 'data': worker_requirements, 'type': 'worker_requirements'})
            files.insert_one({'identifier': currentUser, 'data': shift_basket, 'type' : 'shift_basket'})
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