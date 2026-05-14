from flask import Flask
from extensions import bcrypt, jwt, limiter, cors, mail
from routes import auth_bp
from profile_routes import profile_bp
from portal_routes import portal_bp
from flask_talisman import Talisman
from init_db import init_db
import os
import logging
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler("security.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def create_app():
    # Initialize database tables
    init_db()
    
    app = Flask(__name__)

    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-key-change-me')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-key-change-me')
    app.config['JWT_TOKEN_LOCATION'] = ['cookies']
    app.config['JWT_COOKIE_SECURE'] = os.getenv('JWT_COOKIE_SECURE', 'False') == 'True'
    app.config['JWT_COOKIE_CSRF_PROTECT'] = True
    app.config['JWT_ACCESS_COOKIE_PATH'] = '/'
    app.config['JWT_COOKIE_SAMESITE'] = os.getenv('JWT_COOKIE_SAMESITE', 'Lax')
    app.config['JWT_ERROR_MESSAGE_KEY'] = 'msg'
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=12)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

    # Mail Configuration (Gmail)
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME')

    # Initialize Extensions
    bcrypt.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)
    cors.init_app(app, supports_credentials=True, origins=["http://localhost:5173"])
    limiter.init_app(app)

    # JWT Claims Configuration
    @jwt.additional_claims_loader
    def add_claims_to_access_token(identity):
        from models import User
        user = User.find_by_email(identity)
        if user:
            return {"role": user.get('role', 'user')}
        return {"role": "user"}

    # Security Headers
    csp = {
        'default-src': "'self'",
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"], # unsafe-inline/eval often needed for dev/some react libs
        'style-src': ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
        'font-src': ["'self'", "https://fonts.gstatic.com"],
        'img-src': ["'self'", "data:"],
        'connect-src': ["'self'", "http://localhost:5000"]
    }
    Talisman(app, 
             content_security_policy=csp, 
             force_https=False, 
             strict_transport_security=True,
             session_cookie_secure=False,
             session_cookie_http_only=True)

    # Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(profile_bp, url_prefix='/api/profile')
    app.register_blueprint(portal_bp, url_prefix='/api/portal')

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(port=5000, debug=True)
