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
        
class Tables:
    def create_tables(self,currentUser,employee_skill,worker_requirements,shift_basket):
         try:
            tables = self.get_tables_collection()
            tables.insert_one({'identifier': currentUser, 'data': employee_skill})
            tables.insert_one({'identifier': currentUser, 'data': worker_requirements})
            tables.insert_one({'identifier': currentUser, 'data': shift_basket})
            return True
         except Exception as e:
            print(f"Error creating tables: {e}")
            return False
    def find_table(self,currentUser):
        try:
            tables = self.get_tables_collection()
            tables_document = tables.find_one({'identifier': currentUser})
            return tables_document
        except Exception as e:
            print(f"Error finding table: {e}")
            return None        
    def get_tables_collection(self):
        # Access the tables collection from the MongoDB database
        db = mongo.db
        if 'tables' not in db.list_collection_names():
            # If the tables collection does not exist, create it
            db.create_collection('tables')
        return db.tables   