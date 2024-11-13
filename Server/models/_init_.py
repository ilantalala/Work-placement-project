# models/__init__.py
from flask_pymongo import PyMongo
from .user_model import User
from .files_model import Files
from .shifts_model import Shifts
from .schedule_model import Schedule

mongo = PyMongo()

__all__ = ['User', 'Files', 'Shifts', 'Schedule', 'mongo']
