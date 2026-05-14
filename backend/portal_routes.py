from flask import Blueprint, request, jsonify
import os
import requests
import json
import re
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from portal_models import Subject, Topic, Question, Exam, UserExam
from models import User
from decorators import admin_required, staff_required
import logging

import httpx

logger = logging.getLogger(__name__)
portal_bp = Blueprint('portal', __name__)

def generate_questions_gemini(subject, topic, q_type, level, count=5, prompt=None):
    api_key = os.getenv('GEMINI_API_KEY')
    model = "gemini-2.5-flash"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

    # Build the prompt based on question type
    if not prompt:
        format_instructions = ""
        if q_type.upper() in ["MCQ", "MULTIPLE CHOICE QUESTIONS"]:
            format_instructions = """
            Format each question as a JSON object with:
            - "question": The question text
            - "options": An array of 4 options (strings only, do NOT include prefixes like "A)" or "1.")
            - "correct_answer": The exact text of the correct option (must match one of the options exactly)
            - "explanation": Brief explanation
            """
        elif q_type.upper() in ["T/F", "TF", "TRUE/FALSE QUESTIONS", "TRUE/FALSE"]:
            format_instructions = """
            Format each question as a JSON object with:
            - "question": The true/false statement
            - "correct_answer": "True" or "False"
            - "explanation": Brief explanation
            """
        elif q_type.upper() in ["FIB", "FILL IN THE BLANKS", "FILL IN BLANKS"]:
            format_instructions = """
            Format each question as a JSON object with:
            - "question": The sentence with a blank indicated by '___'
            - "correct_answer": The word or phrase that fills the blank
            - "explanation": Brief explanation
            """
        else:
            format_instructions = """
            Format each question as a JSON object with:
            - "question": The question text
            - "correct_answer": The answer
            - "explanation": Brief explanation
            """

        prompt = f"""Generate {count} questions for the following specifications:
        Subject: {subject}
        Topic: {topic}
        Type: {q_type}
        Difficulty Level: {level}

        Requirements:
        - Return strictly in JSON format.
        - Structure it as an object with a "questions" array containing the question objects.
        {format_instructions}
        """

    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    
    try:
        logger.info(f"Generating {count} {level} questions for {subject}/{topic}")
        # httpx often handles SSL/TLS handshakes better in newer Python versions
        with httpx.Client(verify=False, timeout=120.0) as client:
            response = client.post(url, json=payload)
            if response.status_code == 200:
                result = response.json()
                content = result['candidates'][0]['content']['parts'][0]['text']
                logger.debug(f"Raw AI Content: {content[:500]}...") # Log first 500 chars
                
                # More robust JSON extraction
                json_match = re.search(r'(\{.*\}|\[.*\])', content, re.DOTALL)
                if json_match:
                    content = json_match.group(1)
                else:
                    # Fallback to old cleaning method if regex fails
                    content = re.sub(r'```json\s*', '', content, flags=re.IGNORECASE)
                    content = re.sub(r'```\s*$', '', content).strip()
                
                # Clean content of common AI-generated JSON artifacts
                content = content.replace('\\n', '\n').replace('\\t', '\t')
                
                try:
                    return json.loads(content, strict=False)
                except json.JSONDecodeError as je:
                    logger.warning(f"Initial JSON decode failed: {je}. Attempting cleanup.")
                    # If it fails, try to escape backslashes that aren't already part of a valid escape
                    content = re.sub(r'\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})', r'\\\\', content)
                    try:
                        return json.loads(content, strict=False)
                    except json.JSONDecodeError as je2:
                        logger.error(f"JSON decode failed after cleanup: {je2}. Content: {content}")
                        raise je2
            else:
                logger.error(f"Gemini API error {response.status_code}: {response.text}")
                return {"error": f"AI Service error ({response.status_code})", "detail": response.text}
    except Exception as e:
        logger.error(f"Unexpected error in AI generation: {e}")
        return {"error": "AI Generation Failed", "detail": str(e)}

@portal_bp.route('/generate-questions', methods=['POST'])
@staff_required
def generate_questions_route():
    data = request.get_json()
    required = ['subject', 'topic', 'type', 'level']
    if not all(k in data for k in required):
        missing = [k for k in required if k not in data]
        logger.warning(f"Missing required fields for question generation: {missing}. Data: {data}")
        return jsonify({"msg": f"Missing required fields: {', '.join(missing)}"}), 400
    
    count = data.get('count', 1)
    # Get subject and topic IDs
    subject_id = data.get('subject_id')
    topic_id = data.get('topic_id')
    
    gen_type = data.get('type', 'MCQ')
    
    # Check if we are generating topics instead of questions
    if gen_type == 'Topics Only':
        subject_name = data.get('subject', 'General')
        prompt = f"Generate {count} distinct and educational topics/modules for the academic subject '{subject_name}'. For each topic, provide a name and a brief 1-sentence description. Return strictly as a JSON object with a 'topics' key."
        result = generate_questions_gemini(subject=subject_name, topic="Curriculum Planning", q_type="Topics", level="Advanced", count=count, prompt=prompt)
        return jsonify(result)

    result = generate_questions_gemini(
        subject=data['subject'],
        topic=data['topic'],
        q_type=gen_type,
        level=data['level'],
        count=count
    )
    
    if isinstance(result, dict) and result.get('error'):
        return jsonify(result), 500
        
    if auto_save and subject_id and topic_id:
        inserted_ids = []
        for q_data in result.get('questions', []):
            # Prepare data for Question.create with fallback field names
            q_text = q_data.get('question') or q_data.get('question_text')
            correct = q_data.get('correct_answer') or q_data.get('answer')
            
            if not q_text:
                continue

            create_data = {
                'subject_id': subject_id,
                'topic_id': topic_id,
                'type': data['type'],
                'question_text': q_text,
                'difficulty': data['level'],
                'correct_answer': correct,
                'explanation': q_data.get('explanation', ''),
                'tags': q_data.get('tags', ''),
                'status': 'Active'
            }
            # Handle options for MCQ
            if data['type'] == 'MCQ' and q_data.get('options'):
                raw_options = q_data.get('options', [])
                create_data['options'] = []
                
                # Function to clean option/answer for comparison
                def clean(s):
                    if not isinstance(s, str): return str(s).lower().strip()
                    # Remove common prefixes like "A) ", "1. ", "a. "
                    cleaned = re.sub(r'^[A-Za-z0-9][\).]\s*', '', s)
                    return cleaned.lower().strip()

                clean_correct = clean(correct)
                
                for opt in raw_options:
                    opt_text = ""
                    is_correct = False
                    
                    if isinstance(opt, str):
                        opt_text = opt
                        is_correct = (clean(opt) == clean_correct) or (opt == correct)
                    elif isinstance(opt, dict):
                        opt_text = opt.get('text') or opt.get('option_text') or opt.get('option') or ""
                        is_correct = opt.get('is_correct') or (clean(opt_text) == clean_correct) or (opt_text == correct)
                    
                    if opt_text:
                        create_data['options'].append({'text': opt_text, 'is_correct': bool(is_correct)})
                
                # Fallback: if no correct option found, try to use the first one as correct (better than none)
                # or better yet, if the correct answer is just "A", "B", "C", or "D"
                if not any(o['is_correct'] for o in create_data['options']):
                    if len(correct) == 1 and correct.upper() in "ABCD":
                        idx = ord(correct.upper()) - ord('A')
                        if 0 <= idx < len(create_data['options']):
                            create_data['options'][idx]['is_correct'] = True
                
            qid = Question.create(create_data)
            if qid:
                inserted_ids.append(qid)
        
        return jsonify({
            "msg": f"Successfully generated and inserted {len(inserted_ids)} questions",
            "inserted_count": len(inserted_ids)
        }), 201

    return jsonify(result), 200
# Removed duplicate portal_bp definition

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
