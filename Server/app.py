import os

from flask import Flask
from flask_cors import CORS
from models import mongo
from models.user_model import User
from models.files_model import Files
from models.shifts_model import Shifts
from models.schedule_model import Schedule

from routes.routesUser import routes_user
from routes.routesFiles import routes_files
from routes.routesShifts import routes_shifts
from routes.routesSchedule import routes_schedule


# Initialize Flask app
app = Flask(__name__)

# Configure MongoDB URI
app.config['MONGO_URI'] = 'mongodb://localhost:27017/Placement'
app.config['JWT_SECRET'] = os.environ.get('JWT_SECRET', 'dev-secret-change-me')

# Initialize PyMongo
mongo.init_app(app)

# Initialize User model
user = User()
files = Files()
shifts = Shifts()
schedule = Schedule()

# Enable CORS
CORS(app)

# Register Blueprint
app.register_blueprint(routes_user)
app.register_blueprint(routes_files)
app.register_blueprint(routes_shifts)
app.register_blueprint(routes_schedule)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
