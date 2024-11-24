import datetime
import pandas as pd
from bson import ObjectId
from flask import Flask
import ast
from .base_model import BaseModel
from .shifts_model import Shifts
from .files_model import Files
class Schedule(BaseModel):
    def __init__(self):
        self.collection_name = 'schedule'

    def get_schedule_collection(self):
        return self.get_collection(self.collection_name)

    def get_user_schedule(self, currentUser):
        try:
            schedule = self.get_schedule_collection()
            return schedule.find({'identifier': currentUser})
        except Exception as e:
            print(f"Error finding schedule: {e}")
            return None

    def get_schedule_by_id(self, schedule_id):
        try:
            schedule = self.get_schedule_collection()
            schedule_id = ObjectId(schedule_id)
            return schedule.find_one({'_id': schedule_id})
        except Exception as e:
            print(f"Error finding schedule: {e}")
            return None
    def update_schedule(self, schedule_id, schedule_data):
        try:
            print(schedule_data)
            schedule = self.get_schedule_collection()
            schedule_id = ObjectId(schedule_id)
            result = schedule.update_one(
                {'_id': schedule_id},
                {
                    '$set': {
                        'schedule': schedule_data,
                    }
                }
            )
            if result.acknowledged:
                sch = schedule.find_one({'_id': schedule_id})
                sch['_id'] = str(sch['_id'])
                return sch
            return None
        except Exception as e:
            print(f"Error updating schedule: {e}")
            return None

    def add_schedule(self, currentUser, scheduleDate, schedule_data):
        if not currentUser:
            raise ValueError("currentUser cannot be None")
        if not scheduleDate:
            raise ValueError("scheduleDate cannot be None")
        if not schedule_data:
            raise ValueError("schedule_data cannot be None")

        try:
            start_date = scheduleDate[0]
            end_date = scheduleDate[1]

            schedule_collection = self.get_schedule_collection()
            result = schedule_collection.update_one(
                {
                    'identifier': currentUser,
                    'start_date': start_date,
                    'end_date': end_date
                },
                {
                    '$set': {
                        'employee_skill': schedule_data['employee_skill'],
                        'shifts': schedule_data['shifts'],
                        'schedule': schedule_data['schedule'],
                        'meta': schedule_data.get('meta', {})
                    }
                },
                upsert=True
            )

            if result.acknowledged:
                return schedule_collection.find_one({
                    'identifier': currentUser,
                    'start_date': start_date,
                    'end_date': end_date
                })
            return None

        except Exception as e:
            print(f"Error creating schedule: {e}")
            import traceback
            traceback.print_exc()
            return None