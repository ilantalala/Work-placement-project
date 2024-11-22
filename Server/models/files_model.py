from .base_model import BaseModel

class Files(BaseModel):
    def __init__(self):
        self.collection_name = 'files'

    def get_files_collection(self):
        return self.get_collection(self.collection_name)

    def add_files(self, currentUser, employee_skill, worker_requirements, shift_basket):
        try:
            files = self.get_files_collection()
            files.update_one(
                {'identifier': currentUser, 'type': 'employee_skill'},
                {'$set': {'data': employee_skill}},
                upsert=True
            )
            files.update_one(
                {'identifier': currentUser, 'type': 'worker_requirements'},
                {'$set': {'data': worker_requirements}},
                upsert=True
            )
            files.update_one(
                {'identifier': currentUser, 'type': 'shift_basket'},
                {'$set': {'data': shift_basket}},
                upsert=True
            )
            return True
        except Exception as e:
            print(f"Error creating files: {e}")
            return False

    def find_file(self, currentUser):
        try:
            files = self.get_files_collection()
            return files.find_one({'identifier': currentUser})
        except Exception as e:
            print(f"Error finding file: {e}")
            return None
    def find_file_by_type(self, currentUser, file_type):
        """Find a specific file by user and type"""
        try:
            files = self.get_files_collection()
            return files.find_one({
                'identifier': currentUser,
                'type': file_type
            })
        except Exception as e:
            print(f"Error finding file by type: {e}")
            return None
    def get_user_files(self, currentUser):
        try:
            files = self.get_files_collection()
            all_files = files.find({'identifier': currentUser}, {'_id': 0})
            return list(all_files)
        except Exception as e:
            print(f"Error while finding user files: {e}")
            return None
