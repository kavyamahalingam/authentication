from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import Profile, User
from decorators import admin_required
import bleach
from marshmallow import Schema, fields, validate, ValidationError
import logging

logger = logging.getLogger(__name__)
profile_bp = Blueprint('profile', __name__)

class ProfileSchema(Schema):
    full_name = fields.Str(validate=validate.Length(max=255))
    headline = fields.Str(validate=validate.Length(max=255))
    biography = fields.Str()
    skills = fields.Str()
    experience = fields.Str()
    education = fields.Str()
    phone = fields.Str(validate=validate.Length(max=20))
    location = fields.Str(validate=validate.Length(max=255))
    website = fields.URL(validate=validate.Length(max=255))
    github_url = fields.URL(validate=validate.Length(max=255))
    linkedin_url = fields.URL(validate=validate.Length(max=255))

profile_schema = ProfileSchema()

def sanitize_input(data):
    if isinstance(data, str):
        return bleach.clean(data)
    if isinstance(data, dict):
        return {k: sanitize_input(v) for k, v in data.items()}
    return data

@profile_bp.route('', methods=['GET'])
@jwt_required()
def get_profile():
    email = get_jwt_identity()
    profile = Profile.get_by_user_email(email)
    if not profile:
        return jsonify({"msg": "Profile not found"}), 404
    
    profile.pop('id', None)
    profile.pop('user_id', None)
    return jsonify(profile), 200

@profile_bp.route('/<int:user_id>', methods=['GET'])
@admin_required
def get_user_profile(user_id):
    """Admin only: get profile of any user by their ID"""
    user = User.find_by_id(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    profile = Profile.get_by_user_email(user['email'])
    if not profile:
        return jsonify({"msg": "Profile not found"}), 404
    
    profile.pop('id', None)
    profile.pop('user_id', None)
    return jsonify(profile), 200

@profile_bp.route('', methods=['POST', 'PUT'])
@jwt_required()
def update_profile():
    email = get_jwt_identity()
    data = request.get_json()
    
    if not data:
        return jsonify({"msg": "No data provided"}), 400

    # Validate input
    try:
        validated_data = profile_schema.load(data)
    except ValidationError as err:
        return jsonify({"msg": "Validation error", "errors": err.messages}), 422

    # Sanitize input
    sanitized_data = sanitize_input(validated_data)

    if Profile.create_or_update(email, sanitized_data):
        logger.info(f"Profile updated for user: {email}")
        return jsonify({"msg": "Profile updated successfully"}), 200
    
    return jsonify({"msg": "Failed to update profile"}), 500
