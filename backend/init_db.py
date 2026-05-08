import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

def init_db():
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', 'kavya@2006'),
            database=os.getenv('DB_NAME', 'auth_db')
        )
        if connection.is_connected():
            cursor = connection.cursor()
            
            # Create Users Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                failed_attempts INT DEFAULT 0,
                locked_until TIMESTAMP NULL,
                last_login TIMESTAMP NULL,
                role ENUM('Admin', 'Teacher', 'Content Creator', 'user') DEFAULT 'user',
                INDEX idx_email (email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """)
            print("Users table checked/created.")

            # Create OTPs Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS otps (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                otp_code VARCHAR(6) NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_email_otp (email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """)
            print("OTPs table checked/created.")

            # Create Profiles Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS profiles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL UNIQUE,
                full_name VARCHAR(255),
                headline VARCHAR(255),
                biography TEXT,
                skills TEXT,
                experience TEXT,
                education TEXT,
                phone VARCHAR(20),
                location VARCHAR(255),
                website VARCHAR(255),
                github_url VARCHAR(255),
                linkedin_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """)
            print("Profiles table checked/created.")

            # Create Activities Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_activities (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                action_type VARCHAR(50) NOT NULL,
                description TEXT,
                page_url VARCHAR(255),
                ip_address VARCHAR(45),
                user_agent TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                session_id VARCHAR(255),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_timestamp (user_id, timestamp),
                INDEX idx_action_type (action_type)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """)
            print("Activities table checked/created.")
            
            # Create Subjects Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS subjects (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                code VARCHAR(50) NOT NULL UNIQUE,
                description TEXT,
                thumbnail_url VARCHAR(255),
                status ENUM('Active', 'Inactive') DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """)
            print("Subjects table checked/created.")

            # Create Topics Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS topics (
                id INT AUTO_INCREMENT PRIMARY KEY,
                subject_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                sequence INT DEFAULT 0,
                status ENUM('Active', 'Inactive') DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
                INDEX idx_subject_id (subject_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """)
            print("Topics table checked/created.")

            # Create Questions Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS questions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                subject_id INT NOT NULL,
                topic_id INT NOT NULL,
                type ENUM('MCQ', 'True/False', 'Short Answer', 'Fill in the Blank') NOT NULL,
                question_text TEXT NOT NULL,
                difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
                correct_answer TEXT,
                explanation TEXT,
                tags VARCHAR(255),
                status ENUM('Active', 'Draft') DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
                FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
                INDEX idx_subject_topic (subject_id, topic_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """)
            print("Questions table checked/created.")

            # Create Question Options Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS question_options (
                id INT AUTO_INCREMENT PRIMARY KEY,
                question_id INT NOT NULL,
                option_text TEXT NOT NULL,
                is_correct BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
                INDEX idx_question_id (question_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """)
            print("Question options table checked/created.")

            # Create Exams Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS exams (
                id INT AUTO_INCREMENT PRIMARY KEY,
                subject_id INT NOT NULL,
                topic_id INT,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                duration_minutes INT DEFAULT 30,
                passing_score INT DEFAULT 50,
                status ENUM('Active', 'Draft', 'Inactive') DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
                FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """)
            print("Exams table checked/created.")

            # Create User Exams Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_exams (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                exam_id INT NOT NULL,
                score DECIMAL(5,2) DEFAULT 0,
                total_questions INT DEFAULT 0,
                status ENUM('Started', 'Completed') DEFAULT 'Started',
                started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """)
            print("User exams table checked/created.")

            # Create User Responses Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_responses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_exam_id INT NOT NULL,
                question_id INT NOT NULL,
                selected_option_id INT,
                answer_text TEXT,
                is_correct BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (user_exam_id) REFERENCES user_exams(id) ON DELETE CASCADE,
                FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
                FOREIGN KEY (selected_option_id) REFERENCES question_options(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """)
            print("User responses table checked/created.")
            
            connection.commit()
            print("Database initialization complete!")
            
    except Error as e:
        print(f"Error while connecting to MySQL: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == '__main__':
    init_db()
