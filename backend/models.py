import mysql.connector
from mysql.connector import Error, pooling
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)

# Initialize connection pool
try:
    db_pool = pooling.MySQLConnectionPool(
        pool_name="auth_pool",
        pool_size=5,
        pool_reset_session=True,
        host=os.getenv('DB_HOST', 'localhost'),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', ''),
        database=os.getenv('DB_NAME', 'auth_db')
    )
    logger.info("Database connection pool initialized")
except Error as e:
    logger.error(f"Error creating connection pool: {e}")
    db_pool = None

def get_db_connection():
    try:
        if db_pool:
            return db_pool.get_connection()
        # Fallback if pool failed to initialize
        return mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', 'kavya@2006'),
            database=os.getenv('DB_NAME', 'auth_db')
        )
    except Error as e:
        logger.error(f"DATABASE CONNECTION ERROR: {e}")
        return None

class User:
    @staticmethod
    def find_by_email(email):
        conn = get_db_connection()
        if not conn: 
            logger.error(f"Failed to find user {email}: Database connection error")
            return None
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("SELECT id, email, password_hash, role, failed_attempts, locked_until FROM users WHERE email = %s", (email,))
            user = cursor.fetchone()
            return user
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def find_by_id(user_id):
        conn = get_db_connection()
        if not conn: return None
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
            return cursor.fetchone()
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def create(email, password_hash, role='user'):
        conn = get_db_connection()
        if not conn: return False
        cursor = conn.cursor()
        try:
            cursor.execute(
                "INSERT INTO users (email, password_hash, role) VALUES (%s, %s, %s)",
                (email, password_hash, role)
            )
            conn.commit()
            return True
        except Error as e:
            logger.error(f"Error creating user {email}: {e}")
            return False
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def update_failed_attempts(email, attempts, locked_until=None):
        conn = get_db_connection()
        if not conn: return
        cursor = conn.cursor()
        try:
            cursor.execute(
                "UPDATE users SET failed_attempts = %s, locked_until = %s WHERE email = %s",
                (attempts, locked_until, email)
            )
            conn.commit()
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def reset_failed_attempts(email):
        conn = get_db_connection()
        if not conn: return
        cursor = conn.cursor()
        try:
            cursor.execute(
                "UPDATE users SET failed_attempts = 0, locked_until = NULL, last_login = %s WHERE email = %s",
                (datetime.now(), email)
            )
            conn.commit()
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def all():
        conn = get_db_connection()
        if not conn: return []
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("SELECT id, email, role, created_at, last_login FROM users")
            return cursor.fetchall()
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def get_all():
        return User.all()

    @staticmethod
    def update_role(user_id, role):
        conn = get_db_connection()
        if not conn: return False
        cursor = conn.cursor()
        try:
            cursor.execute("UPDATE users SET role = %s WHERE id = %s", (role, user_id))
            conn.commit()
            return True
        except Error as e:
            logger.error(f"Error updating role for user {user_id}: {e}")
            return False
        finally:
            cursor.close()
            conn.close()

class Otp:
    @staticmethod
    def create(email, otp_code):
        conn = get_db_connection()
        if not conn: return False
        cursor = conn.cursor()
        try:
            # Delete any existing OTPs for this email
            cursor.execute("DELETE FROM otps WHERE email = %s", (email,))
            
            expires_at = datetime.now() + timedelta(minutes=10)
            cursor.execute(
                "INSERT INTO otps (email, otp_code, expires_at) VALUES (%s, %s, %s)",
                (email, otp_code, expires_at)
            )
            conn.commit()
            return True
        except Error as e:
            logger.error(f"Error storing OTP for {email}: {e}")
            return False
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def verify(email, otp_code):
        conn = get_db_connection()
        if not conn: return False
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute(
                "SELECT * FROM otps WHERE email = %s AND otp_code = %s AND expires_at > %s",
                (email, otp_code, datetime.now())
            )
            otp = cursor.fetchone()
            if otp:
                # Delete OTP after successful verification
                cursor.execute("DELETE FROM otps WHERE email = %s", (email,))
                conn.commit()
                return True
            return False
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def update_password(email, new_password_hash):
        conn = get_db_connection()
        if not conn: return False
        cursor = conn.cursor()
        try:
            cursor.execute(
                "UPDATE users SET password_hash = %s, failed_attempts = 0, locked_until = NULL WHERE email = %s",
                (new_password_hash, email)
            )
            conn.commit()
            return True
        finally:
            cursor.close()
            conn.close()

class Profile:
    @staticmethod
    def get_by_user_email(email):
        conn = get_db_connection()
        if not conn: return None
        cursor = conn.cursor(dictionary=True)
        try:
            query = """
                SELECT p.* FROM profiles p 
                JOIN users u ON p.user_id = u.id 
                WHERE u.email = %s
            """
            cursor.execute(query, (email,))
            return cursor.fetchone()
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def create_or_update(email, profile_data):
        conn = get_db_connection()
        if not conn: return False
        cursor = conn.cursor(dictionary=True)
        try:
            # Get user_id first
            cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
            user = cursor.fetchone()
            if not user: return False
            user_id = user['id']

            # Check if profile exists
            cursor.execute("SELECT id FROM profiles WHERE user_id = %s", (user_id,))
            exists = cursor.fetchone()

            fields = [
                'full_name', 'headline', 'biography', 'skills', 
                'experience', 'education', 'phone', 'location', 
                'website', 'github_url', 'linkedin_url'
            ]
            
            # Prepare values, using None for missing fields
            values = [profile_data.get(f) for f in fields]

            if exists:
                # Update
                set_clause = ", ".join([f"{f} = %s" for f in fields])
                query = f"UPDATE profiles SET {set_clause} WHERE user_id = %s"
                cursor.execute(query, (*values, user_id))
            else:
                # Insert
                cols = ", ".join(['user_id'] + fields)
                placeholders = ", ".join(['%s'] * (len(fields) + 1))
                query = f"INSERT INTO profiles ({cols}) VALUES ({placeholders})"
                cursor.execute(query, (user_id, *values))
            
            conn.commit()
            return True
        except Error as e:
            logger.error(f"Error saving profile for {email}: {e}")
            return False
        finally:
            cursor.close()
            conn.close()

class Activity:
    @staticmethod
    def create(user_id, action_type, description=None, page_url=None, ip_address=None, user_agent=None, session_id=None, **kwargs):
        conn = get_db_connection()
        if not conn: return False
        cursor = conn.cursor()
        try:
            cursor.execute(
                """INSERT INTO user_activities 
                   (user_id, action_type, description, page_url, ip_address, user_agent, session_id, category) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
                (user_id, action_type, description, page_url, ip_address, user_agent, session_id, kwargs.get('category', 'General'))
            )
            conn.commit()
            return True
        except Error as e:
            logger.error(f"Error logging activity {action_type} for user {user_id}: {e}")
            return False
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def get_all(filters=None):
        conn = get_db_connection()
        if not conn: return []
        cursor = conn.cursor(dictionary=True)
        try:
            query = """
                SELECT a.*, u.email 
                FROM user_activities a 
                LEFT JOIN users u ON a.user_id = u.id 
                WHERE 1=1
            """
            params = []
            if filters:
                if filters.get('user_id'):
                    query += " AND a.user_id = %s"
                    params.append(filters['user_id'])
                if filters.get('action_type'):
                    query += " AND a.action_type = %s"
                    params.append(filters['action_type'])
                if filters.get('start_date'):
                    query += " AND a.timestamp >= %s"
                    params.append(filters['start_date'])
                if filters.get('end_date'):
                    query += " AND a.timestamp <= %s"
                    params.append(filters['end_date'])
            
            query += " ORDER BY a.timestamp DESC LIMIT 1000"
            cursor.execute(query, tuple(params))
            return cursor.fetchall()
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def get_notifications(role, user_id=None):
        conn = get_db_connection()
        if not conn: return []
        cursor = conn.cursor(dictionary=True)
        try:
            query = "SELECT * FROM user_activities WHERE 1=1"
            params = []
            
            if role == 'Admin':
                query += " AND category IN ('System', 'Security', 'Logistics')"
            elif role in ['Teacher', 'Content Creator', 'staff']:
                query += " AND category IN ('Exam Completed', 'Exam Attended')"
            else:
                # Students see scheduled exams and updates
                query += " AND category IN ('Exam Scheduled', 'Academic Update')"
            
            query += " ORDER BY timestamp DESC LIMIT 50"
            cursor.execute(query, tuple(params))
            return cursor.fetchall()
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def mark_as_read(activity_ids):
        conn = get_db_connection()
        if not conn: return False
        cursor = conn.cursor()
        try:
            if not activity_ids: return True
            format_strings = ','.join(['%s'] * len(activity_ids))
            cursor.execute(f"UPDATE user_activities SET is_read = TRUE WHERE id IN ({format_strings})", tuple(activity_ids))
            conn.commit()
            return True
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def get_unread_count(role, user_id=None):
        conn = get_db_connection()
        if not conn: return 0
        cursor = conn.cursor(dictionary=True)
        try:
            query = "SELECT COUNT(*) as count FROM user_activities WHERE is_read = FALSE"
            if role == 'Admin':
                query += " AND category IN ('System', 'Security', 'Logistics')"
            elif role in ['Teacher', 'Content Creator', 'staff']:
                query += " AND category IN ('Exam Completed', 'Exam Attended')"
            else:
                query += " AND category IN ('Exam Scheduled', 'Academic Update')"
            
            cursor.execute(query)
            return cursor.fetchone()['count']
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def get_stats():
        conn = get_db_connection()
        if not conn: return {}
        cursor = conn.cursor(dictionary=True)
        try:
            stats = {}
            
            # Total Users
            cursor.execute("SELECT COUNT(*) as count FROM users")
            stats['total_users'] = cursor.fetchone()['count']
            
            # Logins Today
            today = datetime.now().strftime('%Y-%m-%d')
            cursor.execute("SELECT COUNT(*) as count FROM user_activities WHERE action_type = 'login' AND DATE(timestamp) = %s", (today,))
            stats['logins_today'] = cursor.fetchone()['count']
            
            # Active Sessions (Approx: distinct users with activity in last 30 mins)
            thirty_mins_ago = datetime.now() - timedelta(minutes=30)
            cursor.execute("SELECT COUNT(DISTINCT user_id) as count FROM user_activities WHERE timestamp > %s", (thirty_mins_ago,))
            stats['active_sessions'] = cursor.fetchone()['count']
            
            return stats
        finally:
            cursor.close()
            conn.close()
