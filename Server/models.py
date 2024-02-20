from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash

mongo = PyMongo()

class User:
    def create_user(self, username, password):
        try:
            users = self.get_users_collection()
            hashed_password = generate_password_hash(password)
            users.insert_one({'username': username, 'password': hashed_password})
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