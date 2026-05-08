import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def apply_schema_update():
    try:
        conn = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', 'kavya@2006'),
            database=os.getenv('DB_NAME', 'auth_db')
        )
        cursor = conn.cursor()
        
        print("Applying ALTER TABLE to users...")
        # Removed 'admin' as it is a duplicate of 'Admin' in case-insensitive collation
        alter_query = "ALTER TABLE users MODIFY COLUMN role ENUM('Admin', 'Teacher', 'Content Creator', 'user', 'staff') DEFAULT 'user';"
        cursor.execute(alter_query)
        conn.commit()
        print("Successfully updated role column!")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error applying schema update: {e}")

if __name__ == "__main__":
    apply_schema_update()
