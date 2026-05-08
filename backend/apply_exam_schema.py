import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def apply_exam_schema():
    try:
        conn = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', 'kavya@2006'),
            database=os.getenv('DB_NAME', 'auth_db')
        )
        cursor = conn.cursor()
        
        print("Creating exams table...")
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

        print("Creating user_exams table...")
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

        print("Creating user_responses table...")
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
        
        conn.commit()
        print("Successfully applied exam system schema updates!")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error applying exam schema update: {e}")

if __name__ == "__main__":
    apply_exam_schema()
