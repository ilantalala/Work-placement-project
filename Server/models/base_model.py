from flask_pymongo import PyMongo
mongo = PyMongo()
class BaseModel:
    def get_collection(self, collection_name):
        db = mongo.db
        if collection_name not in db.list_collection_names():
            db.create_collection(collection_name)
        return db[collection_name]
