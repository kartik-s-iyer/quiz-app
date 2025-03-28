import os
from flask import Flask
from flask_cors import CORS

def create_app(test_config=None):
    # Create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    CORS(app)  # Enable CORS for all routes
    
    # Ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass
    
    # Import and register blueprints
    from app.routes import quiz, teams
    app.register_blueprint(quiz.bp)
    app.register_blueprint(teams.bp)
    
    return app 