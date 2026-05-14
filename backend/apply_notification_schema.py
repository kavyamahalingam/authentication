import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

def update_schema():
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', 'kavya@2006'),
            database=os.getenv('DB_NAME', 'auth_db')
        )
        if connection.is_connected():
            cursor = connection.cursor()
            
            # Check if is_read column exists
            cursor.execute("SHOW COLUMNS FROM user_activities LIKE 'is_read'")
            result = cursor.fetchone()
            
            if not result:
                cursor.execute("ALTER TABLE user_activities ADD COLUMN is_read BOOLEAN DEFAULT FALSE")
                print("Added is_read column to user_activities table.")
            else:
                print("is_read column already exists.")

            # Add is_role_specific column to filter easier if needed, 
            # but we can also use role categories in code.
            # Let's add 'category' to make it cleaner
            cursor.execute("SHOW COLUMNS FROM user_activities LIKE 'category'")
            result = cursor.fetchone()
            if not result:
                cursor.execute("ALTER TABLE user_activities ADD COLUMN category VARCHAR(50) DEFAULT 'General'")
                print("Added category column to user_activities table.")

            connection.commit()
            print("Schema update complete!")
            
    except Error as e:
        print(f"Error: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == '__main__':
    update_schema()
