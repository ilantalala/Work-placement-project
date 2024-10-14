from flask import Flask
from flask_cors import CORS
from models import mongo, User, Files, Shifts

from routes.routesUser import routes_user
from routes.routesFiles import routes_files
from routes.routesShifts import routes_shifts


# Initialize Flask app
app = Flask(__name__)

# Configure MongoDB URI
app.config['MONGO_URI'] = 'mongodb://localhost:27017/Placement'

# Initialize PyMongo
mongo.init_app(app)

# Initialize User model
user = User()
files = Files()
# Enable CORS
CORS(app)

# Register Blueprint
app.register_blueprint(routes_user)
app.register_blueprint(routes_files)
app.register_blueprint(routes_shifts)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
