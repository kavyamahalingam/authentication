from models import get_db_connection
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class Subject:
    @staticmethod
    def all(active_only=False):
        conn = get_db_connection()
        if not conn: return []
        cursor = conn.cursor(dictionary=True)
        try:
            if active_only:
                cursor.execute("""
                    SELECT s.*, COUNT(DISTINCT t.id) as topic_count
                    FROM subjects s
                    JOIN topics t ON s.id = t.subject_id
                    JOIN questions q ON t.id = q.topic_id
                    JOIN exams e ON (e.topic_id = t.id OR (e.topic_id IS NULL AND e.subject_id = s.id))
                    WHERE s.status = 'Active' AND t.status = 'Active' AND q.status = 'Active' AND e.status = 'Active'
                    GROUP BY s.id
                    ORDER BY s.name ASC
                """)
            else:
                cursor.execute("""
                    SELECT s.*, COUNT(t.id) as topic_count 
                    FROM subjects s
                    LEFT JOIN topics t ON s.id = t.subject_id
                    GROUP BY s.id
                    ORDER BY s.name ASC
                """)
            return cursor.fetchall()
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def create(data):
        conn = get_db_connection()
        if not conn: return False
        cursor = conn.cursor()
        try:
            cursor.execute(
                "INSERT INTO subjects (name, code, description, thumbnail_url, status) VALUES (%s, %s, %s, %s, %s)",
                (data['name'], data['code'], data.get('description'), data.get('thumbnail_url'), data.get('status', 'Active'))
            )
            conn.commit()
            return cursor.lastrowid
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def update(id, data):
        conn = get_db_connection()
        if not conn: return False
        cursor = conn.cursor()
        try:
            cursor.execute(
                "UPDATE subjects SET name=%s, code=%s, description=%s, thumbnail_url=%s, status=%s WHERE id=%s",
                (data['name'], data['code'], data.get('description'), data.get('thumbnail_url'), data.get('status'), id)
            )
            conn.commit()
            return True
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def delete(id):
        conn = get_db_connection()
        if not conn: return False
        cursor = conn.cursor()
        try:
            cursor.execute("DELETE FROM subjects WHERE id=%s", (id,))
            conn.commit()
            return True
        finally:
            cursor.close()
            conn.close()

class Topic:
    @staticmethod
    def all(active_only=False):
        conn = get_db_connection()
        if not conn: return []
        cursor = conn.cursor(dictionary=True)
        try:
            if active_only:
                cursor.execute("""
                    SELECT DISTINCT t.*, s.name as subject_name 
                    FROM topics t 
                    JOIN subjects s ON t.subject_id = s.id 
                    JOIN questions q ON t.id = q.topic_id
                    JOIN exams e ON t.id = e.topic_id
                    WHERE t.status = 'Active' AND s.status = 'Active' AND q.status = 'Active' AND e.status = 'Active'
                    ORDER BY s.name, t.sequence
                """)
            else:
                cursor.execute("""
                    SELECT t.*, s.name as subject_name 
                    FROM topics t 
                    JOIN subjects s ON t.subject_id = s.id 
                    ORDER BY s.name, t.sequence
                """)
            return cursor.fetchall()
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def find_by_subject(subject_id):
        conn = get_db_connection()
        if not conn: return []
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("SELECT * FROM topics WHERE subject_id=%s ORDER BY sequence", (subject_id,))
            return cursor.fetchall()
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def create(data):
        conn = get_db_connection()
        if not conn: return False
        cursor = conn.cursor()
        try:
            cursor.execute(
                "INSERT INTO topics (subject_id, name, description, sequence, status) VALUES (%s, %s, %s, %s, %s)",
                (data['subject_id'], data['name'], data.get('description'), data.get('sequence', 0), data.get('status', 'Active'))
            )
            conn.commit()
            return cursor.lastrowid
        finally:
            cursor.close()
            conn.close()

class Question:
    @staticmethod
    def all(filters=None):
        conn = get_db_connection()
        if not conn: return []
        cursor = conn.cursor(dictionary=True)
        try:
            query = """
                SELECT q.*, s.name as subject_name, t.name as topic_name 
                FROM questions q
                JOIN subjects s ON q.subject_id = s.id
                JOIN topics t ON q.topic_id = t.id
            """
            params = []
            if filters:
                conditions = []
                if filters.get('subject_id'):
                    conditions.append("q.subject_id = %s")
                    params.append(filters['subject_id'])
                if filters.get('topic_id'):
                    conditions.append("q.topic_id = %s")
                    params.append(filters['topic_id'])
                if filters.get('type'):
                    conditions.append("q.type = %s")
                    params.append(filters['type'])
                if filters.get('difficulty'):
                    conditions.append("q.difficulty = %s")
                    params.append(filters['difficulty'])
                
                if conditions:
                    query += " WHERE " + " AND ".join(conditions)
            
            query += " ORDER BY q.created_at DESC"
            cursor.execute(query, params)
            questions = cursor.fetchall()
            
            # Fetch options for MCQ
            for q in questions:
                if q['type'] == 'MCQ':
                    cursor.execute("SELECT id, option_text, is_correct FROM question_options WHERE question_id=%s", (q['id'],))
                    q['options'] = cursor.fetchall()
            
            return questions
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def find_by_topic(topic_id):
        return Question.all({'topic_id': topic_id})

    @staticmethod
    def create(data):
        conn = get_db_connection()
        if not conn: return False
        cursor = conn.cursor()
        try:
            cursor.execute(
                """INSERT INTO questions 
                   (subject_id, topic_id, type, question_text, difficulty, correct_answer, explanation, tags, status) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                (data['subject_id'], data['topic_id'], data['type'], data['question_text'], 
                 data.get('difficulty', 'Medium'), data.get('correct_answer'), 
                 data.get('explanation'), data.get('tags'), data.get('status', 'Active'))
            )
            question_id = cursor.lastrowid
            
            if data['type'] == 'MCQ' and data.get('options'):
                for opt in data['options']:
                    cursor.execute(
                        "INSERT INTO question_options (question_id, option_text, is_correct) VALUES (%s, %s, %s)",
                        (question_id, opt['text'], opt.get('is_correct', False))
                    )
            
            conn.commit()
            return question_id
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def get_stats(active_only=False):
        conn = get_db_connection()
        if not conn: return {}
        cursor = conn.cursor(dictionary=True)
        try:
            if active_only:
                cursor.execute("""
                    SELECT COUNT(DISTINCT s.id) as count 
                    FROM subjects s 
                    JOIN topics t ON s.id = t.subject_id 
                    JOIN questions q ON t.id = q.topic_id 
                    JOIN exams e ON (e.topic_id = t.id OR (e.topic_id IS NULL AND e.subject_id = s.id))
                    WHERE q.status = 'Active' AND s.status = 'Active' AND t.status = 'Active' AND e.status = 'Active'
                """)
                subjects = cursor.fetchone()['count']
                
                cursor.execute("""
                    SELECT COUNT(DISTINCT t.id) as count 
                    FROM topics t 
                    JOIN questions q ON t.id = q.topic_id 
                    JOIN subjects s ON t.subject_id = s.id
                    JOIN exams e ON t.id = e.topic_id
                    WHERE q.status = 'Active' AND t.status = 'Active' AND s.status = 'Active' AND e.status = 'Active'
                """)
                topics = cursor.fetchone()['count']
                
                cursor.execute("SELECT COUNT(*) as count FROM questions WHERE status='Active'")
                questions = cursor.fetchone()['count']
                
                cursor.execute("SELECT COUNT(*) as count FROM exams WHERE status='Active'")
                exams = cursor.fetchone()['count']
            else:
                cursor.execute("SELECT COUNT(*) as count FROM subjects")
                subjects = cursor.fetchone()['count']
                cursor.execute("SELECT COUNT(*) as count FROM topics")
                topics = cursor.fetchone()['count']
                cursor.execute("SELECT COUNT(*) as count FROM questions")
                questions = cursor.fetchone()['count']
                cursor.execute("SELECT COUNT(*) as count FROM exams")
                exams = cursor.fetchone()['count']
            
            return {
                'subjects': subjects,
                'topics': topics,
                'questions': questions,
                'exams': exams
            }
        finally:
            cursor.close()
            conn.close()

class Exam:
    @staticmethod
    def all():
        conn = get_db_connection()
        if not conn: return []
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("""
                SELECT e.*, s.name as subject_name, t.name as topic_name 
                FROM exams e
                JOIN subjects s ON e.subject_id = s.id
                LEFT JOIN topics t ON e.topic_id = t.id
                ORDER BY e.created_at DESC
            """)
            return cursor.fetchall()
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def create(data):
        conn = get_db_connection()
        if not conn: return False
        cursor = conn.cursor()
        try:
            cursor.execute(
                """INSERT INTO exams (subject_id, topic_id, title, description, duration_minutes, passing_score, status) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                (data['subject_id'], data.get('topic_id'), data['title'], data.get('description'), 
                 data.get('duration_minutes', 30), data.get('passing_score', 50), data.get('status', 'Active'))
            )
            conn.commit()
            return cursor.lastrowid
        finally:
            cursor.close()
            conn.close()

class UserExam:
    @staticmethod
    def start(user_id, exam_id):
        conn = get_db_connection()
        if not conn: return False
        cursor = conn.cursor(dictionary=True)
        try:
            # Check for existing in-progress exam
            cursor.execute("SELECT id FROM user_exams WHERE user_id=%s AND exam_id=%s AND status='Started'", (user_id, exam_id))
            existing = cursor.fetchone()
            if existing:
                user_exam_id = existing['id']
                cursor.close()
                return UserExam.get_session(user_exam_id)

            # Get total questions available for this exam scope
            cursor.execute("SELECT subject_id, topic_id FROM exams WHERE id=%s", (exam_id,))
            exam_info = cursor.fetchone()
            
            q_query = "SELECT COUNT(*) as count FROM questions WHERE subject_id=%s AND status='Active'"
            params = [exam_info['subject_id']]
            if exam_info['topic_id']:
                q_query += " AND topic_id=%s"
                params.append(exam_info['topic_id'])
            
            cursor.execute(q_query, tuple(params))
            total_q = cursor.fetchone()['count']

            cursor.execute(
                "INSERT INTO user_exams (user_id, exam_id, total_questions) VALUES (%s, %s, %s)",
                (user_id, exam_id, total_q)
            )
            conn.commit()
            user_exam_id = cursor.lastrowid
            
            # Return full session data immediately
            cursor.close()
            return UserExam.get_session(user_exam_id)
        finally:
            if cursor: cursor.close()
            if conn: conn.close()

    @staticmethod
    def get_session(user_exam_id):
        conn = get_db_connection()
        if not conn: return None
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("""
                SELECT ue.*, e.title, e.duration_minutes 
                FROM user_exams ue 
                JOIN exams e ON ue.exam_id = e.id 
                WHERE ue.id = %s
            """, (user_exam_id,))
            session = cursor.fetchone()
            
            if session:
                # Fetch questions for this exam
                cursor.execute("SELECT subject_id, topic_id FROM exams WHERE id=%s", (session['exam_id'],))
                exam_info = cursor.fetchone()
                
                q_query = "SELECT id, question_text, type FROM questions WHERE subject_id=%s AND status='Active'"
                params = [exam_info['subject_id']]
                if exam_info['topic_id']:
                    q_query += " AND topic_id=%s"
                    params.append(exam_info['topic_id'])
                
                cursor.execute(q_query, tuple(params))
                questions = cursor.fetchall()
                
                # Optimized: Batch fetch options for MCQ questions
                mcq_ids = [q['id'] for q in questions if q['type'] == 'MCQ']
                if mcq_ids:
                    format_strings = ','.join(['%s'] * len(mcq_ids))
                    cursor.execute(f"SELECT id, question_id, option_text FROM question_options WHERE question_id IN ({format_strings})", tuple(mcq_ids))
                    all_options = cursor.fetchall()
                    
                    # Group options by question_id
                    options_map = {}
                    for opt in all_options:
                        qid = opt['question_id']
                        if qid not in options_map: options_map[qid] = []
                        options_map[qid].append({'id': opt['id'], 'option_text': opt['option_text']})
                    
                    for q in questions:
                        if q['type'] == 'MCQ':
                            q['options'] = options_map.get(q['id'], [])
                
                session['questions'] = questions
            
            return session
        finally:
            if cursor: cursor.close()
            if conn: conn.close()

    @staticmethod
    def submit(user_exam_id, responses):
        conn = get_db_connection()
        if not conn: return False
        cursor = conn.cursor(dictionary=True)
        try:
            score = 0
            total_correct = 0
            
            for q_id, answer in responses.items():
                is_correct = False
                selected_option_id = None
                answer_text = None

                cursor.execute("SELECT id, type, correct_answer FROM questions WHERE id=%s", (q_id,))
                question = cursor.fetchone()

                if question['type'] == 'MCQ':
                    selected_option_id = answer
                    cursor.execute("SELECT is_correct FROM question_options WHERE id=%s", (answer,))
                    opt = cursor.fetchone()
                    if opt and opt['is_correct']:
                        is_correct = True
                elif question['type'] == 'True/False':
                    answer_text = answer
                    if str(answer).lower() == str(question['correct_answer']).lower():
                        is_correct = True
                else: # Fill in the Blank / Short Answer
                    answer_text = answer
                    if str(answer).strip().lower() == str(question['correct_answer']).strip().lower():
                        is_correct = True

                if is_correct:
                    total_correct += 1

                cursor.execute(
                    """INSERT INTO user_responses (user_exam_id, question_id, selected_option_id, answer_text, is_correct) 
                       VALUES (%s, %s, %s, %s, %s)""",
                    (user_exam_id, q_id, selected_option_id, answer_text, is_correct)
                )

            # Calculate final score percentage
            cursor.execute("SELECT total_questions FROM user_exams WHERE id=%s", (user_exam_id,))
            total_q = cursor.fetchone()['total_questions']
            if total_q > 0:
                score = (total_correct / total_q) * 100

            cursor.execute(
                "UPDATE user_exams SET score=%s, status='Completed', completed_at=%s WHERE id=%s",
                (score, datetime.now(), user_exam_id)
            )
            conn.commit()
            return {'score': score, 'correct': total_correct, 'total': total_q}
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def get_results(user_id):
        conn = get_db_connection()
        if not conn: return []
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("""
                SELECT ue.*, e.title as exam_title, e.passing_score, s.name as subject_name 
                FROM user_exams ue 
                JOIN exams e ON ue.exam_id = e.id 
                JOIN subjects s ON e.subject_id = s.id 
                WHERE ue.user_id = %s AND ue.status = 'Completed'
                ORDER BY ue.completed_at DESC
            """, (user_id,))
            return cursor.fetchall()
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def get_all_activities():
        conn = get_db_connection()
        if not conn: return []
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("""
                SELECT ue.*, u.email as user_email, e.title as exam_title 
                FROM user_exams ue 
                JOIN users u ON ue.user_id = u.id 
                JOIN exams e ON ue.exam_id = e.id 
                ORDER BY ue.started_at DESC
            """)
            return cursor.fetchall()
        finally:
            cursor.close()
            conn.close()
