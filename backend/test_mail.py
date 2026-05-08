import os
from flask import Flask
from flask_mail import Mail, Message
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Mail Configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME')

mail = Mail(app)

def test_connection():
    print(f"--- Testing Mail Configuration ---")
    print(f"MAIL_USERNAME: {app.config['MAIL_USERNAME']}")
    print(f"MAIL_PASSWORD: {'****' if app.config['MAIL_PASSWORD'] else 'MISSING'}")
    
    if not app.config['MAIL_USERNAME'] or not app.config['MAIL_PASSWORD']:
        print("ERROR: Missing credentials in .env file!")
        return

    with app.app_context():
        try:
            print("Attempting to connect to Gmail...")
            msg = Message(
                "Final Connection Test",
                recipients=[app.config['MAIL_USERNAME']],
                body="If you receive this, your configuration is 100% correct!"
            )
            mail.send(msg)
            print("SUCCESS! Test email sent successfully.")
        except Exception as e:
            print(f"FAILED! Gmail rejected the connection.")
            print(f"Error details: {e}")
            print("\nReminder: Make sure you are using a 16-character 'App Password', not your regular password.")

if __name__ == '__main__':
    test_connection()
