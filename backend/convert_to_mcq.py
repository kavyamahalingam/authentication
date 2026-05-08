import os
from portal_models import Question
from models import get_db_connection

def convert_all_to_mcq():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Find all Short Answer questions
        cursor.execute("SELECT id FROM questions WHERE type = 'Short Answer'")
        questions = cursor.fetchall()
        
        if not questions:
            print("No 'Short Answer' questions found to convert.")
            return

        print(f"Found {len(questions)} questions to convert to MCQ.")

        for q in questions:
            q_id = q['id']
            
            # Update type to MCQ
            cursor.execute("UPDATE questions SET type = 'MCQ' WHERE id = %s", (q_id,))
            
            # Create 4 dummy options
            options = [
                {'text': 'Option A (Placeholder)', 'is_correct': True},
                {'text': 'Option B (Placeholder)', 'is_correct': False},
                {'text': 'Option C (Placeholder)', 'is_correct': False},
                {'text': 'Option D (Placeholder)', 'is_correct': False}
            ]
            
            # Check if options already exist to prevent duplicates
            cursor.execute("SELECT id FROM question_options WHERE question_id = %s", (q_id,))
            existing_options = cursor.fetchall()
            
            if not existing_options:
                for opt in options:
                    cursor.execute(
                        "INSERT INTO question_options (question_id, option_text, is_correct) VALUES (%s, %s, %s)",
                        (q_id, opt['text'], opt['is_correct'])
                    )
        
        conn.commit()
        print("Successfully converted all questions to MCQ and added placeholder options!")

    except Exception as e:
        print(f"An error occurred: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    convert_all_to_mcq()
