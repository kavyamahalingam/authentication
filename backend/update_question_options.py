"""
Script to replace placeholder options with real options for all 100 questions
across the first 10 subjects (the CS + English topics).
"""
from models import get_db_connection

# Full question bank with real options
# Format: { subject_name: [ (question_text_snippet, [options], correct_index_0based) ] }
QUESTION_BANK = {
    "Data Structure – Array, Tree, List": [
        (
            "What is a data structure",
            ["A programming language", "A way to organize and store data", "A computer network", "An operating system"],
            1
        ),
        (
            "What is an array",
            ["A collection of elements stored in sequence", "A type of database", "A network device", "A compiler"],
            0
        ),
        (
            "What are the advantages of arrays",
            ["Easy access to elements", "Faster searching", "Simple storage of similar data", "All of the above"],
            3
        ),
        (
            "What is a linked list",
            ["A fixed-size structure", "A collection of nodes connected by pointers", "A sorting algorithm", "A database table"],
            1
        ),
        (
            "What is the difference between array and linked list",
            ["Arrays use contiguous memory", "Linked lists use nodes", "Arrays have fixed size", "All of the above"],
            3
        ),
        (
            "What is a tree in data structure",
            ["A linear structure", "A hierarchical structure", "A database", "A loop structure"],
            1
        ),
        (
            "What is the root node in a tree",
            ["The last node", "The top node", "The middle node", "The child node"],
            1
        ),
        (
            "What is binary tree",
            ["A tree with two roots", "A tree where each node has at most two children", "A linked list", "A graph"],
            1
        ),
        (
            "What is stack and queue",
            ["Data structures", "Operating systems", "Databases", "Networks"],
            0
        ),
        (
            "What is the use of data structures in programming",
            ["To organize data efficiently", "To design hardware", "To connect networks", "To create viruses"],
            0
        ),
    ],
    "Algorithm & Sorting – Bubble, Merge, Quick Sort": [
        (
            "What is an algorithm",
            ["A step-by-step procedure to solve a problem", "A database", "A hardware device", "A network protocol"],
            0
        ),
        (
            "What is sorting",
            ["Arranging data in order", "Deleting data", "Encrypting data", "Compressing data"],
            0
        ),
        (
            "Explain bubble sort",
            ["A sorting algorithm that swaps adjacent elements", "A searching algorithm", "A database query", "A networking process"],
            0
        ),
        (
            "What is merge sort",
            ["Divide and conquer sorting algorithm", "Linear search method", "Encryption technique", "Operating system process"],
            0
        ),
        (
            "What is quick sort",
            ["A slow sorting algorithm", "A divide and conquer sorting algorithm using pivot", "A database model", "A memory management technique"],
            1
        ),
        (
            "Which sorting algorithm is faster",
            ["Bubble sort", "Merge sort", "Quick sort", "Merge sort and Quick sort"],
            3
        ),
        (
            "What is time complexity",
            ["Time taken by algorithm", "Memory size", "CPU speed", "Hard disk size"],
            0
        ),
        (
            "What is the best case of bubble sort",
            ["O(n²)", "O(log n)", "O(n)", "O(1)"],
            2
        ),
        (
            "What is divide and conquer technique",
            ["Breaking problem into smaller parts", "Deleting data", "Joining networks", "Compressing files"],
            0
        ),
        (
            "What are the applications of sorting algorithms",
            ["Searching data", "Organizing records", "Data analysis", "All of the above"],
            3
        ),
    ],
    "OOPS – OOPS Concepts": [
        (
            "What is OOPS",
            ["Object-Oriented Programming System", "Operating System", "Database language", "Networking protocol"],
            0
        ),
        (
            "What is a class",
            ["Blueprint for objects", "Function", "Variable", "Array"],
            0
        ),
        (
            "What is an object",
            ["Instance of a class", "Function", "Loop", "File"],
            0
        ),
        (
            "What is inheritance",
            ["Reusing properties of another class", "Creating database", "Sorting data", "Memory allocation"],
            0
        ),
        (
            "What is polymorphism",
            ["One function with many forms", "Database connection", "Network security", "File handling"],
            0
        ),
        (
            "What is encapsulation",
            ["Wrapping data and methods together", "Sorting technique", "Searching method", "Encryption process"],
            0
        ),
        (
            "What is abstraction",
            ["Hiding implementation details", "Showing all data", "Deleting data", "Copying files"],
            0
        ),
        (
            "What is constructor",
            ["Special method to initialize object", "Loop statement", "Variable type", "Network device"],
            0
        ),
        (
            "What is method overloading",
            ["Same method name with different parameters", "Duplicate database", "Memory overflow", "Virus attack"],
            0
        ),
        (
            "What are the advantages of OOPS",
            ["Code reusability", "Security", "Maintainability", "All of the above"],
            3
        ),
    ],
    "Database Management System – SQL, NoSQL": [
        (
            "What is DBMS",
            ["Database Management System", "Data Backup Management System", "Digital Binary Management System", "Database Binary Machine System"],
            0
        ),
        (
            "What is SQL",
            ["Structured Query Language", "Simple Query Language", "Sequential Query Logic", "System Query Language"],
            0
        ),
        (
            "What is NoSQL",
            ["Non-relational database", "SQL error", "Programming language", "Network protocol"],
            0
        ),
        (
            "What is a primary key",
            ["Unique identifier in table", "Duplicate key", "Password", "Index file"],
            0
        ),
        (
            "What is a foreign key",
            ["Key linking two tables", "Encryption key", "Duplicate key", "File key"],
            0
        ),
        (
            "What is normalization",
            ["Organizing database to reduce redundancy", "Creating duplicates", "Sorting numbers", "Network setup"],
            0
        ),
        (
            "What is a table in database",
            ["Collection of rows and columns", "Hardware device", "Program", "File type"],
            0
        ),
        (
            "What is the difference between SQL and NoSQL",
            ["SQL is relational", "NoSQL is non-relational", "SQL uses tables", "All of the above"],
            3
        ),
        (
            "What is CRUD operation",
            ["Create, Read, Update, Delete", "Copy, Run, Undo, Download", "Create, Remove, Upload, Design", "None of the above"],
            0
        ),
        (
            "What are joins in SQL",
            ["Combining data from multiple tables", "Deleting tables", "Compressing database", "Creating users"],
            0
        ),
    ],
    "Operating System – Process, Memory, Scheduling": [
        (
            "What is an operating system",
            ["System software managing computer resources", "Hardware device", "Network protocol", "Database"],
            0
        ),
        (
            "What is a process",
            ["Program in execution", "Database table", "Memory chip", "File system"],
            0
        ),
        (
            "What is process scheduling",
            ["Managing process execution order", "Deleting processes", "Creating hardware", "Network setup"],
            0
        ),
        (
            "What is memory management",
            ["Managing computer memory", "Deleting files", "Network control", "Database design"],
            0
        ),
        (
            "What is multitasking",
            ["Running multiple tasks simultaneously", "Deleting tasks", "Single task execution", "Data encryption"],
            0
        ),
        (
            "What is virtual memory",
            ["Using disk space as memory", "Physical RAM", "Cache memory", "ROM memory"],
            0
        ),
        (
            "What is CPU scheduling",
            ["Allocating CPU to processes", "Installing CPU", "Repairing CPU", "Cooling CPU"],
            0
        ),
        (
            "What is deadlock",
            ["Situation where processes wait forever", "Virus attack", "Network failure", "File corruption"],
            0
        ),
        (
            "What is paging",
            ["Memory management technique", "Sorting algorithm", "Network protocol", "File format"],
            0
        ),
        (
            "What are the functions of an operating system",
            ["Process management", "Memory management", "File management", "All of the above"],
            3
        ),
    ],
    "Computer Network – IP, TCP, OSI": [
        (
            "What is a computer network",
            ["Group of connected computers", "Database", "Programming language", "Operating system"],
            0
        ),
        (
            "What is an IP address",
            ["Unique address of device in network", "Password", "File type", "CPU component"],
            0
        ),
        (
            "What is TCP",
            ["Transmission Control Protocol", "Transfer Computer Process", "Total Communication Program", "Technical Control Program"],
            0
        ),
        (
            "What is the OSI model",
            ["Network communication model", "Database model", "Sorting method", "Memory model"],
            0
        ),
        (
            "How many layers are in OSI model",
            ["5", "6", "7", "8"],
            2
        ),
        (
            "What is a router",
            ["Device connecting networks", "Input device", "Memory unit", "Software tool"],
            0
        ),
        (
            "What is a switch",
            ["Device connecting devices in LAN", "CPU part", "Database software", "Compiler"],
            0
        ),
        (
            "What is LAN",
            ["Local Area Network", "Long Area Network", "Logical Area Network", "Limited Area Network"],
            0
        ),
        (
            "What is WAN",
            ["Wide Area Network", "Wireless Area Network", "Web Area Network", "Wired Area Network"],
            0
        ),
        (
            "What is the difference between TCP and UDP",
            ["TCP is reliable", "UDP is faster", "TCP is connection-oriented", "All of the above"],
            3
        ),
    ],
    "Grammar – Tenses, Voice": [
        (
            "What is grammar",
            ["Rules of language", "Type of software", "Database language", "Network device"],
            0
        ),
        (
            "What is tense",
            ["Time of action in sentence", "Noun type", "Verb type", "Pronoun type"],
            0
        ),
        (
            "What are the types of tenses",
            ["Present", "Past", "Future", "All of the above"],
            3
        ),
        (
            "What is present tense",
            ["Action happening now", "Action happened before", "Action will happen later", "None of the above"],
            0
        ),
        (
            "What is past tense",
            ["Action happening now", "Action completed before", "Future action", "Continuous action"],
            1
        ),
        (
            "What is future tense",
            ["Action happened before", "Action happening now", "Action that will happen", "None of the above"],
            2
        ),
        (
            "What is active voice",
            ["Subject performs action", "Subject receives action", "Question sentence", "Exclamatory sentence"],
            0
        ),
        (
            "What is passive voice",
            ["Subject performs action", "Subject receives action", "Future sentence", "Negative sentence"],
            1
        ),
        (
            "Convert an active sentence into passive voice",
            ["Object becomes subject", "Subject becomes object", "Verb changes form", "All of the above"],
            3
        ),
        (
            "Why is grammar important",
            ["Improves communication", "Helps writing", "Reduces mistakes", "All of the above"],
            3
        ),
    ],
    "Parts of Speech – Sentence and Structure": [
        (
            "What are parts of speech",
            ["Categories of words", "Sentence types", "Paragraphs", "Tenses"],
            0
        ),
        (
            "What is a noun",
            ["Naming word", "Action word", "Describing word", "Joining word"],
            0
        ),
        (
            "What is a pronoun",
            ["Word replacing noun", "Action word", "Describing word", "Adverb"],
            0
        ),
        (
            "What is a verb",
            ["Naming word", "Action word", "Describing word", "Joining word"],
            1
        ),
        (
            "What is an adjective",
            ["Describes noun", "Describes verb", "Replaces noun", "Joins sentence"],
            0
        ),
        (
            "What is an adverb",
            ["Describes verb", "Naming word", "Pronoun", "Conjunction"],
            0
        ),
        (
            "What is a sentence",
            ["Group of words with complete meaning", "Single word", "Random letters", "Paragraph"],
            0
        ),
        (
            "What are the types of sentences",
            ["Declarative", "Interrogative", "Exclamatory", "All of the above"],
            3
        ),
        (
            "What is sentence structure",
            ["Arrangement of words in sentence", "Type of noun", "Type of tense", "Verb form"],
            0
        ),
        (
            "Why are parts of speech important",
            ["Improve sentence formation", "Improve grammar", "Improve communication", "All of the above"],
            3
        ),
    ],
    "Vocabulary – Synonyms, Antonyms": [
        (
            "What is vocabulary",
            ["Collection of words known by person", "Grammar rule", "Network term", "Database system"],
            0
        ),
        (
            "What is a synonym",
            ["Word with same meaning", "Word with opposite meaning", "Naming word", "Action word"],
            0
        ),
        (
            "What is an antonym",
            ["Word with same meaning", "Word with opposite meaning", "Action word", "Pronoun"],
            1
        ),
        (
            "Give a synonym for",
            ["Sad", "Joyful", "Angry", "Weak"],
            1
        ),
        (
            "Give an antonym for",
            ["Powerful", "Brave", "Weak", "Active"],
            2
        ),
        (
            "What is the importance of vocabulary",
            ["Better communication", "Better writing", "Better understanding", "All of the above"],
            3
        ),
        (
            "How can vocabulary be improved",
            ["Reading books", "Learning new words", "Practicing daily", "All of the above"],
            3
        ),
        (
            "What are homophones",
            ["Words sounding same but different meanings", "Same spelling words", "Opposite words", "Compound words"],
            0
        ),
        (
            "What are compound words",
            ["Two words combined into one", "Opposite words", "Naming words", "Verbs"],
            0
        ),
        (
            "What is contextual meaning",
            ["Meaning based on sentence context", "Dictionary meaning only", "Opposite meaning", "Hidden meaning"],
            0
        ),
    ],
    "Idioms – Idioms": [
        (
            "What is an idiom",
            ["Phrase with special meaning", "Verb form", "Type of noun", "Tense"],
            0
        ),
        (
            "What does \"piece of cake\" mean",
            ["Difficult task", "Easy task", "Sweet food", "Expensive item"],
            1
        ),
        (
            "What does \"break the ice\" mean",
            ["Break something cold", "Start conversation comfortably", "Fight with someone", "End meeting"],
            1
        ),
        (
            "What does \"hit the nail on the head\" mean",
            ["Do carpentry work", "Say exactly correct thing", "Make mistake", "Lose opportunity"],
            1
        ),
        (
            "What does \"once in a blue moon\" mean",
            ["Every day", "Very rarely", "At night", "During rain"],
            1
        ),
        (
            "What does \"under the weather\" mean",
            ["Feeling sick", "Feeling happy", "Feeling excited", "Feeling hungry"],
            0
        ),
        (
            "Why are idioms used in English",
            ["Make language interesting", "Express ideas creatively", "Improve communication", "All of the above"],
            3
        ),
        (
            "What is the meaning of \"spill the beans\"",
            ["Drop food", "Reveal secret", "Cook dinner", "Waste money"],
            1
        ),
        (
            "What is the meaning of \"cost an arm and a leg\"",
            ["Very cheap", "Very expensive", "Very easy", "Very small"],
            1
        ),
        (
            "Write one idiom and its meaning",
            ["Time flies – Time passes quickly", "Cat sleeps – Cat is sleeping", "Run fast – Run quickly", "Open door – Open entrance"],
            0
        ),
    ],
}


def update_question_options():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    updated = 0
    not_found = 0

    try:
        for subject_name, questions in QUESTION_BANK.items():
            # Get subject id by name (partial match to handle variations)
            cursor.execute("SELECT id FROM subjects WHERE name LIKE %s", (f"%{subject_name[:15]}%",))
            subject_row = cursor.fetchone()
            if not subject_row:
                print(f"  [!] Subject not found: {subject_name}")
                not_found += 1
                continue
            subject_id = subject_row['id']
            print(f"\n[Subject] {subject_name} (id={subject_id})")

            for (q_snippet, options, correct_idx) in questions:
                # Find question by partial text match
                cursor.execute(
                    "SELECT id FROM questions WHERE subject_id=%s AND question_text LIKE %s LIMIT 1",
                    (subject_id, f"%{q_snippet[:30]}%")
                )
                q_row = cursor.fetchone()
                if not q_row:
                    print(f"    [!] Question not found: {q_snippet[:40]}...")
                    not_found += 1
                    continue

                q_id = q_row['id']

                # Set type to MCQ
                cursor.execute("UPDATE questions SET type='MCQ' WHERE id=%s", (q_id,))

                # Delete existing options
                cursor.execute("DELETE FROM question_options WHERE question_id=%s", (q_id,))

                # Insert new real options
                for idx, opt_text in enumerate(options):
                    is_correct = (idx == correct_idx)
                    cursor.execute(
                        "INSERT INTO question_options (question_id, option_text, is_correct) VALUES (%s, %s, %s)",
                        (q_id, opt_text, is_correct)
                    )
                
                print(f"    [✓] Updated: {q_snippet[:45]}...")
                updated += 1

        conn.commit()
        print(f"\n{'='*60}")
        print(f"Done! Updated: {updated} questions. Not found: {not_found}")

    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        cursor.close()
        conn.close()


if __name__ == '__main__':
    update_question_options()
