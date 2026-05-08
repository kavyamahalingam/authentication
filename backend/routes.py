from flask import Blueprint, request, jsonify, make_response
import string
import io
import csv
import re
import logging
import random
import os
from datetime import datetime, timedelta
from flask_mail import Message
from extensions import bcrypt, jwt, limiter, mail
from models import User, Otp, Activity
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    set_access_cookies, set_refresh_cookies,
    unset_jwt_cookies, jwt_required, get_jwt_identity,
    get_jwt
)

logger = logging.getLogger(__name__)
auth_bp = Blueprint('auth', __name__)

def validate_password(password):
    # Minimum 8 characters, at least one letter and one number
    return len(password) >= 8 and any(c.isdigit() for c in password) and any(c.isalpha() for c in password)

@auth_bp.route('/register', methods=['POST'])
@limiter.limit("5 per minute")
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    otp_code = data.get('otp_code')

    if not email or not password or not otp_code:
        return jsonify({"msg": "Email, password, and OTP required"}), 400
    
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"msg": "Invalid email format"}), 400

    if not validate_password(password):
        return jsonify({"msg": "Password must be at least 8 characters and contain both letters and numbers"}), 400

    if User.find_by_email(email):
        return jsonify({"msg": "User already exists"}), 409

    # Verify OTP before registration
    if not Otp.verify(email, otp_code):
        return jsonify({"msg": "Invalid or expired OTP"}), 400

    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    if User.create(email, hashed_pw):
        logger.info(f"New user registered: {email}")
        return jsonify({"msg": "User registered successfully"}), 201
    
    return jsonify({"msg": "Registration failed"}), 500

@auth_bp.route('/admin/register', methods=['POST'])
@limiter.limit("3 per minute")
def admin_register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    otp_code = data.get('otp_code')
    admin_key = data.get('admin_key')

    if not email or not password or not otp_code or not admin_key:
        return jsonify({"msg": "Email, password, OTP, and Admin Key required"}), 400
    
    if admin_key != os.getenv('ADMIN_REGISTRATION_KEY'):
        logger.warning(f"Unauthorized admin registration attempt: {email}")
        return jsonify({"msg": "Invalid Admin Registration Key"}), 403

    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"msg": "Invalid email format"}), 400

    if not validate_password(password):
        return jsonify({"msg": "Password must be at least 8 characters and contain both letters and numbers"}), 400

    if User.find_by_email(email):
        return jsonify({"msg": "User already exists"}), 409

    if not Otp.verify(email, otp_code):
        return jsonify({"msg": "Invalid or expired OTP"}), 400

    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    if User.create(email, hashed_pw, role='admin'):
        logger.info(f"New admin registered: {email}")
        return jsonify({"msg": "Admin registered successfully"}), 201
    
    return jsonify({"msg": "Registration failed"}), 500

@auth_bp.route('/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"msg": "Invalid credentials"}), 401

    user = User.find_by_email(email)
    generic_error = {"msg": "Invalid email or password"}

    if not user:
        logger.warning(f"Failed login attempt: Non-existent user {email}")
        return jsonify(generic_error), 401

    if user['locked_until'] and user['locked_until'] > datetime.now():
        logger.warning(f"Login attempt on locked account: {email}")
        return jsonify({"msg": "Account is temporarily locked. Please try again later."}), 403

    if bcrypt.check_password_hash(user['password_hash'], password):
        User.reset_failed_attempts(email)
        
        # Create access and refresh tokens
        access_token = create_access_token(identity=email)
        refresh_token = create_refresh_token(identity=email)
        
        logger.info(f"User login successful: {email}")
        response = make_response(jsonify({
            "msg": "Login successful", 
            "user": {
                "id": user['id'],
                "email": email,
                "role": user.get('role', 'user')
            }
        }))
        set_access_cookies(response, access_token)
        set_refresh_cookies(response, refresh_token)
        
        # Log Activity
        Activity.create(
            user_id=user['id'],
            action_type='login',
            description='User logged in',
            ip_address=request.remote_addr,
            user_agent=request.user_agent.string
        )
        
        return response
    else:
        new_attempts = user['failed_attempts'] + 1
        locked_until = None
        if new_attempts >= 5:
            locked_until = datetime.now() + timedelta(minutes=15)
            logger.error(f"Account locked due to multiple failures: {email}")
        
        logger.warning(f"Failed login attempt: Incorrect password for {email} (Attempt {new_attempts}/5)")
        User.update_failed_attempts(email, new_attempts, locked_until)
        return jsonify(generic_error), 401

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    response = make_response(jsonify({"msg": "Token refreshed"}))
    set_access_cookies(response, access_token)
    return response

@auth_bp.route('/logout', methods=['POST'])
def logout():
    response = make_response(jsonify({"msg": "Logout successful"}))
    unset_jwt_cookies(response)
    
    # Log Activity if possible
    try:
        email = get_jwt_identity()
        if email:
            user = User.find_by_email(email)
            if user:
                Activity.create(
                    user_id=user['id'],
                    action_type='logout',
                    description='User logged out'
                )
    except:
        pass

    logger.info("User logged out")
    return response

from decorators import admin_required

@auth_bp.route('/users', methods=['GET'])
@admin_required
def get_users():
    """Admin only: list all users"""
    users = User.all()
    return jsonify(users), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    email = get_jwt_identity()
    user = User.find_by_email(email)
    if user:
        return jsonify({
            'id': user['id'],
            'email': user['email'],
            'role': user.get('role', 'user')
        }), 200
    return jsonify({"msg": "User not found"}), 404

@auth_bp.route('/send-otp', methods=['POST'])
@limiter.limit("3 per minute")
def send_otp():
    data = request.get_json()
    email = data.get('email')
    purpose = data.get('purpose', 'verification') # 'verification' or 'reset'
    
    if not email:
        return jsonify({"msg": "Email required"}), 400
    
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"msg": "Invalid email format"}), 400

    # If purpose is reset, user must exist. If verification, user must NOT exist.
    user = User.find_by_email(email)
    if purpose == 'reset' and not user:
        return jsonify({"msg": "If your email is in our system, you will receive an OTP."}), 200
    if purpose == 'verification' and user:
        return jsonify({"msg": "User already exists"}), 409

    # Generate 6-digit OTP
    otp_code = ''.join(random.choices(string.digits, k=6))
    
    if Otp.create(email, otp_code):
        try:
            subject = "Your Verification OTP" if purpose == 'verification' else "Your Password Reset OTP"
            body = f"Your secure OTP is: {otp_code}\nIt will expire in 10 minutes."
            
            msg = Message(
                subject,
                recipients=[email],
                body=body
            )
            mail.send(msg)
            logger.info(f"OTP sent to {email} for {purpose}")
            return jsonify({"msg": "OTP sent successfully"}), 200
        except Exception as e:
            logger.error(f"Error sending email: {e}")
            return jsonify({"msg": "Failed to send email. Please try again later."}), 500

    return jsonify({"msg": "Failed to generate OTP"}), 500

@auth_bp.route('/forgot-password', methods=['POST'])
@limiter.limit("3 per minute")
def forgot_password():
    # This route can now just call send_otp or we can keep it for backward compatibility
    # but let's make it consistent with the new flow if needed.
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({"msg": "Email required"}), 400
        
    user = User.find_by_email(email)
    if not user:
        logger.warning(f"OTP requested for non-existent email: {email}")
        return jsonify({"msg": "If your email is in our system, you will receive an OTP."}), 200

    otp_code = ''.join(random.choices(string.digits, k=6))
    
    if Otp.create(email, otp_code):
        try:
            msg = Message(
                "Your Password Reset OTP",
                recipients=[email],
                body=f"Your secure OTP for password reset is: {otp_code}\nIt will expire in 10 minutes."
            )
            mail.send(msg)
            logger.info(f"OTP sent to {email}")
            return jsonify({"msg": "If your email is in our system, you will receive an OTP."}), 200
        except Exception as e:
            logger.error(f"Error sending email: {e}")
            return jsonify({"msg": "Failed to send email. Please try again later."}), 500

    return jsonify({"msg": "Failed to generate OTP"}), 500

@auth_bp.route('/reset-password', methods=['POST'])
@limiter.limit("5 per minute")
def reset_password():
    data = request.get_json()
    email = data.get('email')
    otp_code = data.get('otp_code')
    new_password = data.get('new_password')
    
    if not email or not otp_code or not new_password:
        return jsonify({"msg": "All fields required"}), 400
        
    if not validate_password(new_password):
        return jsonify({"msg": "Password must be at least 8 characters and contain both letters and numbers"}), 400

    # Verify OTP
    if Otp.verify(email, otp_code):
        new_pw_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
        if Otp.update_password(email, new_pw_hash):
            logger.info(f"Password reset successful for {email}")
            return jsonify({"msg": "Password reset successful. You can now login."}), 200
        return jsonify({"msg": "Failed to update password"}), 500
        
    logger.warning(f"Invalid or expired OTP attempt for {email}")
    return jsonify({"msg": "Invalid or expired OTP"}), 400

@auth_bp.route('/test-email', methods=['POST'])
def test_email():
    """Endpoint to test if email configuration is working"""
    email = request.get_json().get('email')
    if not email:
        return jsonify({"msg": "Email required"}), 400
    
    try:
        msg = Message(
            "Test Email from Flask Auth",
            recipients=[email],
            body="If you are reading this, your Flask-Mail configuration is correct!"
        )
        mail.send(msg)
        logger.info(f"Test email sent successfully to {email}")
        return jsonify({"msg": "Test email sent! Check your inbox (and spam folder)."}), 200
    except Exception as e:
        logger.error(f"Test email failed: {e}")
        return jsonify({"msg": f"Failed to send test email: {str(e)}"}), 500

@auth_bp.route('/activity', methods=['POST'])
@jwt_required(optional=True)
def log_activity():
    data = request.get_json()
    action_type = data.get('action_type')
    description = data.get('description')
    page_url = data.get('page_url')
    
    if not action_type:
        return jsonify({"msg": "Action type required"}), 400
        
    user_id = None
    email = get_jwt_identity()
    if email:
        user = User.find_by_email(email)
        if user:
            user_id = user['id']
            
    Activity.create(
        user_id=user_id,
        action_type=action_type,
        description=description,
        page_url=page_url,
        ip_address=request.remote_addr,
        user_agent=request.user_agent.string
    )
    return jsonify({"msg": "Activity logged"}), 200

@auth_bp.route('/admin/activities', methods=['GET'])
@admin_required
def get_activities():
    filters = {
        'user_id': request.args.get('user_id'),
        'action_type': request.args.get('action_type'),
        'start_date': request.args.get('start_date'),
        'end_date': request.args.get('end_date')
    }
    activities = Activity.get_all(filters)
    return jsonify(activities), 200

@auth_bp.route('/admin/stats', methods=['GET'])
@admin_required
def get_admin_stats():
    stats = Activity.get_stats()
    return jsonify(stats), 200

@auth_bp.route('/admin/export-activities', methods=['GET'])
@admin_required
def export_activities():
    activities = Activity.get_all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow(['ID', 'User Email', 'Action Type', 'Description', 'Page URL', 'IP Address', 'Timestamp'])
    
    for act in activities:
        writer.writerow([
            act['id'],
            act.get('email', 'Anonymous'),
            act['action_type'],
            act['description'],
            act['page_url'],
            act['ip_address'],
            act['timestamp']
        ])
    
    output.seek(0)
    response = make_response(output.getvalue())
    response.headers["Content-Disposition"] = "attachment; filename=activities.csv"
    response.headers["Content-type"] = "text/csv"
    return response
