import os
import re
from portal_models import Subject, Topic, Question
from models import get_db_connection

def parse_and_seed(file_path):
    print("Starting to parse and seed questions...")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    blocks = content.split('---')
    
    # Keep track of existing to avoid duplicates in this run
    subjects_cache = {}
    topics_cache = {}

    for block in blocks:
        block = block.strip()
        if not block:
            continue
            
        lines = block.split('\n')
        header = None
        questions = []
        
        for line in lines:
            line = line.strip()
            if line.startswith('##'):
                header = line
            elif re.match(r'^\d+\.', line):
                q_text = re.sub(r'^\d+\.\s*', '', line)
                questions.append(q_text)

        if not header:
            continue
            
        # Parse header "## 1. Data Structure – Array, Tree, List"
        # Extract the part after the number
        header_text = re.sub(r'^##\s*\d+\.\s*', '', header)
        
        # Split by dash to get Subject and Topic
        # There might be an en-dash '–' or standard hyphen '-'
        parts = re.split(r'\s*[-–]\s*', header_text, maxsplit=1)
        if len(parts) == 2:
            subject_name = parts[0].strip()
            topic_name = parts[1].strip()
        else:
            subject_name = parts[0].strip()
            topic_name = parts[0].strip() # Fallback if no dash
            
        # 1. Get or Create Subject
        if subject_name not in subjects_cache:
            # Check DB
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT id FROM subjects WHERE name=%s", (subject_name,))
            existing = cursor.fetchone()
            if existing:
                subjects_cache[subject_name] = existing['id']
            else:
                code = subject_name[:3].upper() + "_" + str(len(subjects_cache) + 1)
                sub_id = Subject.create({
                    'name': subject_name,
                    'code': code,
                    'description': f'Questions related to {subject_name}',
                    'status': 'Active'
                })
                subjects_cache[subject_name] = sub_id
            cursor.close()
            conn.close()
            
        subject_id = subjects_cache[subject_name]
        
        # 2. Get or Create Topic
        topic_key = f"{subject_id}_{topic_name}"
        if topic_key not in topics_cache:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT id FROM topics WHERE subject_id=%s AND name=%s", (subject_id, topic_name))
            existing = cursor.fetchone()
            if existing:
                topics_cache[topic_key] = existing['id']
            else:
                top_id = Topic.create({
                    'subject_id': subject_id,
                    'name': topic_name,
                    'description': f'{topic_name} topic under {subject_name}',
                    'status': 'Active'
                })
                topics_cache[topic_key] = top_id
            cursor.close()
            conn.close()
            
        topic_id = topics_cache[topic_key]
        
        # 3. Create Questions
        for q_text in questions:
            # Check if question exists
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM questions WHERE subject_id=%s AND topic_id=%s AND question_text=%s", 
                           (subject_id, topic_id, q_text))
            if cursor.fetchone():
                print(f"Skipping existing question: {q_text[:30]}...")
            else:
                Question.create({
                    'subject_id': subject_id,
                    'topic_id': topic_id,
                    'type': 'Short Answer',
                    'question_text': q_text,
                    'difficulty': 'Medium',
                    'correct_answer': 'N/A', # Short answer questions don't have a specific correct answer listed
                    'explanation': '',
                    'status': 'Active'
                })
                print(f"Added question: {q_text[:30]}...")
            cursor.close()
            conn.close()

if __name__ == '__main__':
    parse_and_seed('questions_data.txt')
    print("Seeding completed successfully!")
