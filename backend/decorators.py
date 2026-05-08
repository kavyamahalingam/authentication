from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt, jwt_required
from models import User

def role_required(role):
    def decorator(f):
        @wraps(f)
        @jwt_required()
        def decorated_function(*args, **kwargs):
            claims = get_jwt()
            user_role = claims.get('role', 'user')
            
            if user_role != role:
                return jsonify({"msg": "Access forbidden: insufficient permissions"}), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def admin_required(f):
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        claims = get_jwt()
        user_role = claims.get('role', 'user')
        if user_role.lower() != 'admin':
            return jsonify({"msg": "Admin access required"}), 403
        return f(*args, **kwargs)
    return decorated_function

def staff_required(f):
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        claims = get_jwt()
        user_role = claims.get('role', 'user')
        # MySQL is case-insensitive, but we check specific values here.
        # 'Admin' covers both 'Admin' and 'admin' in terms of logic if we use .lower() or just rely on the list.
        if user_role in ['Admin', 'Teacher', 'Content Creator', 'staff']:
            return f(*args, **kwargs)
        return jsonify({"msg": "Staff access required"}), 403
    return decorated_function

def user_required(f):
    return role_required('user')(f)
