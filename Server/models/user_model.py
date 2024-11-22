from werkzeug.security import generate_password_hash, check_password_hash
from .base_model import BaseModel

class User(BaseModel):
    def __init__(self):
        self.collection_name = 'users'

    def get_users_collection(self):
        return self.get_collection(self.collection_name)

    def create_user(self, username, password, company_name, display_name):
        try:
            users = self.get_users_collection()
            hashed_password = generate_password_hash(password)
            users.insert_one({
                'username': username,
                'password': hashed_password,
                'company_name': company_name,
                'display_name': display_name
            })
            return True
        except Exception as e:
            print(f"Error creating user: {e}")
            return False

    def find_user(self, username):
        try:
            users = self.get_users_collection()
            return users.find_one({'username': username})
        except Exception as e:
            print(f"Error finding user: {e}")
            return None

    def find_user_by_name(self, user_name):
        try:
            users = self.get_users_collection()
            return users.find_one({'username': user_name})
        except Exception as e:
            print(f"Error finding user: {e}")
            return None
