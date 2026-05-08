from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from portal_models import Subject, Topic, Question, Exam, UserExam
from models import User
from decorators import admin_required, staff_required
import logging

logger = logging.getLogger(__name__)
portal_bp = Blueprint('portal', __name__)

# Helper to get user_id from identity
def get_current_user_id():
    email = get_jwt_identity()
    user = User.find_by_email(email)
    return user['id'] if user else None

# Stats
@portal_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_portal_stats():
    active_only = request.args.get('active_only') == 'true'
    return jsonify(Question.get_stats(active_only)), 200

# Subjects
@portal_bp.route('/subjects', methods=['GET'])
@jwt_required()
def get_subjects():
    active_only = request.args.get('active_only') == 'true'
    return jsonify(Subject.all(active_only)), 200

@portal_bp.route('/subjects', methods=['POST'])
@staff_required
def create_subject():
    data = request.get_json()
    if not data.get('name') or not data.get('code'):
        return jsonify({"msg": "Name and Code required"}), 400
    subject_id = Subject.create(data)
    return jsonify({"msg": "Subject created", "id": subject_id}), 201

@portal_bp.route('/subjects/<int:id>', methods=['DELETE'])
@admin_required
def delete_subject(id):
    if Subject.delete(id):
        return jsonify({"msg": "Subject deleted"}), 200
    return jsonify({"msg": "Delete failed"}), 500

# Topics
@portal_bp.route('/topics', methods=['GET'])
@jwt_required()
def get_topics():
    active_only = request.args.get('active_only') == 'true'
    return jsonify(Topic.all(active_only)), 200

@portal_bp.route('/topics/by-subject/<int:subject_id>', methods=['GET'])
@jwt_required()
def get_topics_by_subject(subject_id):
    return jsonify(Topic.find_by_subject(subject_id)), 200

@portal_bp.route('/topics', methods=['POST'])
@staff_required
def create_topic():
    data = request.get_json()
    if not data.get('name') or not data.get('subject_id'):
        return jsonify({"msg": "Name and Subject ID required"}), 400
    topic_id = Topic.create(data)
    return jsonify({"msg": "Topic created", "id": topic_id}), 201

@portal_bp.route('/topics/<int:topic_id>/sample', methods=['GET'])
@jwt_required()
def get_topic_sample(topic_id):
    questions = Question.all({'topic_id': topic_id})
    if questions:
        # Return only the first question without the correct answer flag if needed
        # But for preview, we can just show the text and options
        q = questions[0]
        # Mask correctness for students
        if 'options' in q:
            for opt in q['options']:
                opt['is_correct'] = None 
        return jsonify(q), 200
    return jsonify({"msg": "No questions found"}), 404

# Questions
@portal_bp.route('/questions', methods=['GET'])
@staff_required
def get_questions():
    filters = {
        'subject_id': request.args.get('subject_id'),
        'topic_id': request.args.get('topic_id'),
        'type': request.args.get('type'),
        'difficulty': request.args.get('difficulty')
    }
    return jsonify(Question.all(filters)), 200

@portal_bp.route('/questions', methods=['POST'])
@staff_required
def create_question():
    data = request.get_json()
    if not data.get('question_text') or not data.get('type'):
        return jsonify({"msg": "Question text and type required"}), 400
    question_id = Question.create(data)
    return jsonify({"msg": "Question created", "id": question_id}), 201

# Exams
@portal_bp.route('/exams', methods=['GET'])
@jwt_required()
def get_exams():
    return jsonify(Exam.all()), 200

@portal_bp.route('/exams', methods=['POST'])
@staff_required
def create_exam():
    data = request.get_json()
    if not data.get('title') or not data.get('subject_id'):
        return jsonify({"msg": "Title and Subject ID required"}), 400
    exam_id = Exam.create(data)
    return jsonify({"msg": "Exam created", "id": exam_id}), 201

@portal_bp.route('/exams/<int:exam_id>/start', methods=['POST'])
@jwt_required()
def start_exam(exam_id):
    user_id = get_current_user_id()
    session = UserExam.start(user_id, exam_id)
    if session:
        return jsonify(session), 201
    return jsonify({"msg": "Failed to start exam"}), 500

@portal_bp.route('/exams/session/<int:user_exam_id>', methods=['GET'])
@jwt_required()
def get_exam_session(user_exam_id):
    session = UserExam.get_session(user_exam_id)
    if session:
        return jsonify(session), 200
    return jsonify({"msg": "Session not found"}), 404

@portal_bp.route('/exams/session/<int:user_exam_id>/submit', methods=['POST'])
@jwt_required()
def submit_exam(user_exam_id):
    data = request.get_json()
    responses = data.get('responses', {})
    result = UserExam.submit(user_exam_id, responses)
    if result:
        return jsonify(result), 200
    return jsonify({"msg": "Submission failed"}), 500

@portal_bp.route('/exams/results', methods=['GET'])
@jwt_required()
def get_user_results():
    user_id = get_current_user_id()
    return jsonify(UserExam.get_results(user_id)), 200

# Admin / Activity Monitoring
@portal_bp.route('/admin/exams/activities', methods=['GET'])
@staff_required
def get_exam_activities():
    return jsonify(UserExam.get_all_activities()), 200

# User Management
@portal_bp.route('/users', methods=['GET'])
@staff_required
def get_all_users():
    users = User.get_all()
    return jsonify(users), 200

@portal_bp.route('/users/<int:user_id>/role', methods=['PUT'])
@admin_required
def update_user_role(user_id):
    data = request.get_json()
    new_role = data.get('role')
    valid_roles = ['Admin', 'Teacher', 'Content Creator', 'user', 'staff', 'admin']
    if new_role not in valid_roles:
        return jsonify({"msg": "Invalid role"}), 400
    
    if User.update_role(user_id, new_role):
        return jsonify({"msg": f"User role updated to {new_role}"}), 200
    return jsonify({"msg": "Update failed"}), 500
