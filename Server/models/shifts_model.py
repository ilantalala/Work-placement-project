import uuid
from .base_model import BaseModel

class Shifts(BaseModel):
    def __init__(self):
        self.collection_name = 'shifts'

    def get_shifts_collection(self):
        return self.get_collection(self.collection_name)

    def get_user_shifts(self, currentUser):
        try:
            shifts = self.get_shifts_collection()
            return shifts.find_one({'identifier': currentUser})
        except Exception as e:
            print(f"Error finding shifts: {e}")
            return None

    def add_shifts(self, currentUser, shifts):
        if not currentUser:
            raise ValueError("currentUser cannot be None")

        try:
            for shift in shifts:
                shift['id'] = str(uuid.uuid4())

            shifts_collection = self.get_shifts_collection()
            shifts_collection.update_one(
                {'identifier': currentUser},
                {'$set': {'data': shifts}},
                upsert=True
            )
            return True
        except Exception as e:
            print(f"Error creating shifts: {e}")
            return False

    def update_user_shifts(self, currentUser, shifts):
        if not currentUser:
            raise ValueError("currentUser cannot be None")

        try:
            for shift in shifts:
                if 'id' not in shift:
                    shift['id'] = str(uuid.uuid4())

            shifts_collection = self.get_shifts_collection()
            shifts_collection.update_one(
                {'identifier': currentUser},
                {'$set': {'data': shifts}}
            )
            return shifts
        except Exception as e:
            print(f"Error updating shifts: {e}")
            return None

    def delete_user_shifts(self, currentUser):
        try:
            shifts_collection = self.get_shifts_collection()
            result = shifts_collection.delete_one({'identifier': currentUser})
            return result.deleted_count == 1
        except Exception as e:
            print(f"Error deleting shifts: {e}")
            return False