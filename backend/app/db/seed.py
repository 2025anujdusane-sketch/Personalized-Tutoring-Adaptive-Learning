import json
from sqlalchemy.orm import Session
from app.db.session import engine, SessionLocal, Base
from app.db.models import (
    User, Notebook, Source, Chunk, Topic, TopicPrerequisite,
    Question, TopicMastery, Flashcard, ScheduleSession, EvalRun
)
from app.services.auth import hash_password

TOPICS_LIST = [
    ("Arrays", "Linear contiguous memory allocation, indexing, dynamic arrays and subarray techniques.", 1),
    ("Recursion", "Activation records, call stacks, base case formulation and divide-and-conquer.", 2),
    ("Linked Lists", "Singly/doubly linked chains, node pointer redirection and cycle detection.", 3),
    ("Binary Search", "Monotonic space search, boundary invariants and logarithmic comparisons.", 4),
    ("Trees", "Hierarchical data structures, BST properties, balanced AVL/Red-Black rotations and traversals.", 5),
    ("Graphs", "Vertices and edges, Adjacency List vs Matrix, BFS, DFS and topological ordering.", 6),
    ("Sorting", "Comparison-based and distribution sorts, QuickSort, MergeSort and stability.", 7),
    ("Hashing", "Hash functions, collision resolution via chaining/open addressing and amortization.", 8),
    ("Dynamic Programming", "Optimal substructure, overlapping subproblems, memoization and bottom-up tables.", 9),
]

PREREQUISITES_LIST = [
    ("Recursion", "Trees", "Tree traversals and subtree operations rely on recursive base cases and call stacks."),
    ("Recursion", "Dynamic Programming", "Memoization directly optimizes overlapping recursive subproblems."),
    ("Arrays", "Binary Search", "Binary search requires contiguous memory addressing and sorted indexing."),
    ("Arrays", "Sorting", "Comparison-based sorting mutates in-place index partitions."),
    ("Linked Lists", "Trees", "Node pointers and pointer redirection build the structural foundation of tree links."),
    ("Trees", "Graphs", "Trees are minimally connected acyclic graphs; graph search generalizes tree traversal."),
    ("Arrays", "Hashing", "Hash tables map generated hash codes to array bucket indices."),
]

INITIAL_MASTERIES = {
    "Trees": {"mastery": 0.32, "last_practiced": "5 days ago", "attempts": 14, "rate": 0.29, "decay": "critical", "ci": [0.24, 0.40], "prereqs": ["Recursion", "Linked Lists"]},
    "Recursion": {"mastery": 0.41, "last_practiced": "4 days ago", "attempts": 18, "rate": 0.39, "decay": "critical", "ci": [0.33, 0.49], "prereqs": []},
    "Dynamic Programming": {"mastery": 0.28, "last_practiced": "6 days ago", "attempts": 11, "rate": 0.27, "decay": "critical", "ci": [0.20, 0.36], "prereqs": ["Recursion", "Arrays"]},
    "Graphs": {"mastery": 0.46, "last_practiced": "3 days ago", "attempts": 16, "rate": 0.44, "decay": "due", "ci": [0.38, 0.54], "prereqs": ["Trees"]},
    "Linked Lists": {"mastery": 0.70, "last_practiced": "2 days ago", "attempts": 22, "rate": 0.73, "decay": "fresh", "ci": [0.63, 0.77], "prereqs": []},
    "Arrays": {"mastery": 0.88, "last_practiced": "Yesterday", "attempts": 30, "rate": 0.90, "decay": "fresh", "ci": [0.82, 0.94], "prereqs": []},
    "Binary Search": {"mastery": 0.79, "last_practiced": "Yesterday", "attempts": 25, "rate": 0.80, "decay": "fresh", "ci": [0.72, 0.86], "prereqs": ["Arrays"]},
    "Sorting": {"mastery": 0.74, "last_practiced": "3 days ago", "attempts": 19, "rate": 0.74, "decay": "fresh", "ci": [0.66, 0.82], "prereqs": ["Arrays"]},
    "Hashing": {"mastery": 0.65, "last_practiced": "4 days ago", "attempts": 15, "rate": 0.67, "decay": "due", "ci": [0.56, 0.74], "prereqs": ["Arrays"]},
}

SEED_SOURCES = [
    {
        "id": "src-dsa-textbook",
        "title": "Introduction to Algorithms & Data Structures (4th Edition)",
        "source_type": "pdf",
        "file_size": "24.6 MB",
        "unit_count": 142,
        "unit_type": "pages",
        "topics": ["Arrays", "Binary Search", "Trees", "Recursion", "Dynamic Programming", "Sorting"],
        "description": "Comprehensive reference textbook covering fundamental asymptotic notation, balanced search trees, divide-and-conquer recurrences, and dynamic programming.",
        "units": [
            {
                "number": 24,
                "label": "Page 24",
                "title": "Chapter 2.3: Divide and Conquer & Binary Search Invariants",
                "text": "Binary search operates on a monotonic (sorted) contiguous array A[0..n-1]. In each iteration, we evaluate midpoint mid = low + ((high - low) >> 1) to prevent integer overflow. If A[mid] equals target, the index is found. Otherwise, if A[mid] < target, the invariant dictates that target cannot reside in A[low..mid], contracting the search window to low = mid + 1. The recurrence T(n) = T(n/2) + O(1) yields an exact time complexity of O(log n) comparisons in the worst case.",
                "topics": ["Binary Search", "Arrays"],
                "location": {"page": 24, "section_heading": "Chapter 2.3: Divide and Conquer & Binary Search"}
            },
            {
                "number": 58,
                "label": "Page 58",
                "title": "Chapter 4.1: The Call Stack and Recursive Subproblem Formulation",
                "text": "Every recursive algorithm requires two non-negotiable components: (1) one or more well-defined base cases that terminate execution without further invocation, and (2) a recursive step that reduces the problem size strictly toward the base condition. Each call allocates an activation record on the runtime stack storing local variables and return addresses. Omission of a base case leads to unbound recursion and runtime StackOverflowError.",
                "topics": ["Recursion"],
                "location": {"page": 58, "section_heading": "Chapter 4.1: The Call Stack and Recursive Subproblem"}
            },
            {
                "number": 94,
                "label": "Page 94",
                "title": "Chapter 7.2: Binary Tree Traversals & Depth Calculation",
                "text": "A binary tree is a hierarchical data structure where each node holds at most two children: left and right. Traversal orders are defined recursively: Inorder visits Left -> Root -> Right (yielding sorted keys in a Binary Search Tree). Preorder visits Root -> Left -> Right. Postorder visits Left -> Right -> Root. Tree height is defined recursively as height(node) = 1 + max(height(node.left), height(node.right)), with a null node returning 0.",
                "topics": ["Trees", "Recursion"],
                "location": {"page": 94, "section_heading": "Chapter 7.2: Binary Tree Traversals & Depth"}
            },
            {
                "number": 122,
                "label": "Page 122",
                "title": "Chapter 10.1: Principles of Dynamic Programming & Optimal Substructure",
                "text": "Dynamic Programming is applicable when a problem exhibits two canonical properties: optimal substructure (an optimal solution contains within it optimal solutions to subproblems) and overlapping subproblems (recursive evaluations repeatedly compute identical inputs). Top-down DP utilizes memoization to cache subproblem answers in an array or hash map, reducing exponential naive trees O(2^n) to polynomial complexity O(n).",
                "topics": ["Dynamic Programming", "Recursion"],
                "location": {"page": 122, "section_heading": "Chapter 10.1: Principles of Dynamic Programming"}
            }
        ]
    },
    {
        "id": "src-slides-02",
        "title": "CS 201: Lecture Slides — Trees, Graphs & DP",
        "source_type": "pptx",
        "file_size": "8.4 MB",
        "unit_count": 46,
        "unit_type": "slides",
        "topics": ["Trees", "Graphs", "Dynamic Programming", "Recursion"],
        "description": "Course presentation slide deck covering tree properties, BST validations, graph representations (Adjacency Matrix vs List), and DP table transitions.",
        "units": [
            {
                "number": 12,
                "label": "Slide 12",
                "title": "Binary Search Tree (BST) Invariant & Validations",
                "text": "BST Property: For any node X in the tree, all keys in the left subtree must be strictly less than X.val (key(L) < key(X)), and all keys in the right subtree must be strictly greater than X.val (key(R) > key(X)). WARNING COMMON MISTAKE: Checking only node.left.val < node.val and node.right.val > node.val locally is INVALID! You must enforce a valid range [minVal, maxVal] across the entire recursive descent.",
                "topics": ["Trees", "Recursion"],
                "location": {"slide": 12, "section_heading": "Slide 12: BST Invariant & Validations"}
            },
            {
                "number": 18,
                "label": "Slide 18",
                "title": "Tree Balance & AVL Rotation Primitives",
                "text": "A self-balancing BST guarantees O(log n) search, insertion, and deletion. The balance factor BF(node) = height(node.left) - height(node.right). If |BF| > 1, the node is unbalanced. Four rotation cases resolve this: Left-Left (Single Right Rotation), Right-Right (Single Left Rotation), Left-Right (Left Rotate child, then Right Rotate node), and Right-Left (Right Rotate child, then Left Rotate node).",
                "topics": ["Trees"],
                "location": {"slide": 18, "section_heading": "Slide 18: Tree Balance & AVL Rotations"}
            },
            {
                "number": 27,
                "label": "Slide 27",
                "title": "Graph Representation: Adjacency List vs Adjacency Matrix",
                "text": "Adjacency Matrix: Space complexity O(V^2). Edge lookup O(1). Iterating neighbors of vertex takes O(V). Best suited for dense graphs where E is close to V^2.\nAdjacency List: Space complexity O(V + E). Edge lookup O(deg(u)). Iterating neighbors takes O(deg(u)). Ideal for sparse graphs typical in practical software engineering.",
                "topics": ["Graphs"],
                "location": {"slide": 27, "section_heading": "Slide 27: Graph Representations"}
            }
        ]
    },
    {
        "id": "src-video-03",
        "title": "Lecture 08: Recursive Thinking & Binary Trees",
        "source_type": "video",
        "file_size": "342 MB",
        "unit_count": 48,
        "unit_type": "minutes",
        "topics": ["Recursion", "Trees", "Linked Lists"],
        "description": "Full lecture video by Prof. Marcus Vance with verified synchronized transcript, whiteboard slide overlays, and student Q&A segments.",
        "units": [
            {
                "number": 1,
                "label": "00:45",
                "title": "Introduction: Why Students Struggle with Tree Problems",
                "text": "Welcome back everyone. Today we are tackling binary trees. If you found last week's linked list pointer manipulation manageable, you might feel ready, but the reason over 60 percent of exam mistakes happen on trees is actually NOT the tree definition. It is recursive decomposition! If you do not mentally trust your recursive hypothesis, you cannot write clean tree algorithms.",
                "topics": ["Recursion", "Trees"],
                "location": {"start_s": 45, "end_s": 180, "timestamp_label": "00:45"}
            },
            {
                "number": 2,
                "label": "14:32",
                "title": "The 'Leap of Faith' & Recursion Call Frame Tracing",
                "text": "Look at timestamp 14:32 on the board. When calculating tree height: maxDepth(root) = 1 + max(maxDepth(root.left), maxDepth(root.right)). Notice what you must NOT do: do NOT manually trace 10 levels deep in your head during the exam! State your base case: if root is null, return 0. Assume the left recursive call correctly computes left height. Assume the right call correctly computes right height. Combine them.",
                "topics": ["Recursion", "Trees"],
                "location": {"start_s": 872, "end_s": 1150, "timestamp_label": "14:32"}
            },
            {
                "number": 3,
                "label": "28:15",
                "title": "Validating BST: The Min-Max Interval Parameter Pattern",
                "text": "A student asks: why does my LeetCode submission fail on testcase [10, 5, 15, null, null, 6, 20]? Because node 6 is to the right of 10, but its value is 6! It satisfies node.left < node for 15, but violates the global ancestor constraint. To solve this, pass down permissible bounds: validate(node, minVal, maxVal). When moving left, upper bound becomes node.val. When moving right, lower bound becomes node.val.",
                "topics": ["Trees"],
                "location": {"start_s": 1695, "end_s": 2010, "timestamp_label": "28:15"}
            },
            {
                "number": 4,
                "label": "39:10",
                "title": "Postorder Processing: Computing Subtree Information",
                "text": "Notice why postorder traversal is unique: it allows a parent node to receive computed answers from both its children BEFORE it makes its own decision. Diameter of a binary tree, maximum path sum, and subtree size all depend fundamentally on bottom-up postorder evaluation.",
                "topics": ["Trees", "Recursion"],
                "location": {"start_s": 2350, "end_s": 2680, "timestamp_label": "39:10"}
            }
        ]
    }
]

SEED_QUESTIONS = [
    {
        "id": "q-tree-01",
        "topic": "Trees",
        "difficulty": "medium",
        "question_type": "mcq",
        "question_text": "When validating whether an arbitrary binary tree satisfies the Binary Search Tree (BST) property, what is the fatal flaw in only verifying that `node.left.val < node.val` and `node.right.val > node.val` for every node locally?",
        "options": [
            "It causes an infinite loop during inorder traversal",
            "It fails to detect nodes in the right subtree whose values are smaller than an ancestor node higher in the tree",
            "It fails to count duplicate node values correctly",
            "It produces a time complexity of O(n^2) instead of O(n)"
        ],
        "correct_answer": "It fails to detect nodes in the right subtree whose values are smaller than an ancestor node higher in the tree",
        "explanation": "Local checks only examine immediate parent-child pairs. A node deep inside the right subtree could be smaller than the root ancestor (e.g. root 10, right child 15, whose left child is 6). 6 < 15 is valid locally, but 6 < 10 violates the global BST invariant.",
        "misconceptions": [
            {"option": "It causes an infinite loop during inorder traversal", "misconception": "Confuses BST value invariants with cyclic graph edge detection."},
            {"option": "It fails to count duplicate node values correctly", "misconception": "Focuses on edge case handling rather than the fundamental global subtree bounding requirement."},
            {"option": "It produces a time complexity of O(n^2) instead of O(n)", "misconception": "Misidentifies algorithm correctness failure as an asymptotic efficiency issue."}
        ],
        "citation": {
            "source_id": "src-slides-02",
            "source_title": "CS 201: Lecture Slides — Trees, Graphs & DP",
            "source_type": "pptx",
            "slide_number": 12,
            "excerpt": "WARNING COMMON MISTAKE: Checking only node.left.val < node.val and node.right.val > node.val locally is INVALID! You must enforce a valid range [minVal, maxVal] across the entire recursive descent."
        }
    },
    {
        "id": "q-rec-01",
        "topic": "Recursion",
        "difficulty": "easy",
        "question_type": "mcq",
        "question_text": "What is the primary cause of a runtime StackOverflowError in recursive divide-and-conquer algorithms?",
        "options": [
            "Allocating too much memory on the heap using dynamic arrays",
            "Missing or unreachable base cases, causing continuous allocation of activation records on the call stack",
            "Passing primitive parameters by value instead of by reference",
            "Iterating over an uninitialized collection"
        ],
        "correct_answer": "Missing or unreachable base cases, causing continuous allocation of activation records on the call stack",
        "explanation": "Each recursive call allocates a new frame on the thread call stack. If the base condition is absent or never satisfied, the stack exceeds its memory limit.",
        "misconceptions": [
            {"option": "Allocating too much memory on the heap using dynamic arrays", "misconception": "Confuses stack memory bounds with heap memory limits (OutOfMemoryError)."},
            {"option": "Passing primitive parameters by value instead of by reference", "misconception": "Misattributes memory overflow to pass-by-value overhead rather than infinite recursion depth."}
        ],
        "citation": {
            "source_id": "src-dsa-textbook",
            "source_title": "Introduction to Algorithms & Data Structures (4th Edition)",
            "source_type": "pdf",
            "page_number": 58,
            "excerpt": "Each call allocates an activation record on the runtime stack storing local variables and return addresses. Omission of a base case leads to unbound recursion and runtime StackOverflowError."
        }
    },
    {
        "id": "q-bs-01",
        "topic": "Binary Search",
        "difficulty": "medium",
        "question_type": "mcq",
        "question_text": "In standard binary search implementation, why is `mid = low + ((high - low) >> 1)` preferred over `mid = (low + high) / 2`?",
        "options": [
            "Bitwise shift is 100x faster than integer division in modern compilers",
            "It prevents integer arithmetic overflow when low + high exceeds maximum 32-bit signed integer limits",
            "It guarantees that mid is rounded down regardless of language float rules",
            "It automatically works on negative index offsets in linked lists"
        ],
        "correct_answer": "It prevents integer arithmetic overflow when low + high exceeds maximum 32-bit signed integer limits",
        "explanation": "If low and high are large (e.g. > 10^9), their sum can exceed 2^31 - 1, producing a negative integer and crashing array access.",
        "misconceptions": [
            {"option": "Bitwise shift is 100x faster than integer division in modern compilers", "misconception": "Focuses on micro-optimization rather than integer overflow correctness."}
        ],
        "citation": {
            "source_id": "src-dsa-textbook",
            "source_title": "Introduction to Algorithms & Data Structures (4th Edition)",
            "source_type": "pdf",
            "page_number": 24,
            "excerpt": "In each iteration, we evaluate midpoint mid = low + ((high - low) >> 1) to prevent integer overflow."
        }
    },
    {
        "id": "q-dp-01",
        "topic": "Dynamic Programming",
        "difficulty": "hard",
        "question_type": "mcq",
        "question_text": "What two fundamental problem characteristics must be present for Dynamic Programming (either top-down memoization or bottom-up tabulation) to be applicable?",
        "options": [
            "Greedy choice property and contiguous subarray storage",
            "Optimal substructure and overlapping subproblems",
            "Logarithmic depth and acyclic graph representations",
            "Strict monotonicity and divide-and-conquer independence"
        ],
        "correct_answer": "Optimal substructure and overlapping subproblems",
        "explanation": "Dynamic Programming requires that subproblems recur repeatedly (overlapping) and that the optimal solution to the problem can be constructed from optimal solutions of subproblems (optimal substructure).",
        "misconceptions": [
            {"option": "Greedy choice property and contiguous subarray storage", "misconception": "Confuses Dynamic Programming prerequisites with Greedy algorithm properties."}
        ],
        "citation": {
            "source_id": "src-dsa-textbook",
            "source_title": "Introduction to Algorithms & Data Structures (4th Edition)",
            "source_type": "pdf",
            "page_number": 122,
            "excerpt": "Dynamic Programming is applicable when a problem exhibits two canonical properties: optimal substructure and overlapping subproblems."
        }
    },
    {
        "id": "q-arr-01",
        "topic": "Arrays",
        "difficulty": "easy",
        "question_type": "numerical",
        "question_text": "Given an array of size 1,048,576 sorted elements, what is the maximum number of comparisons binary search will perform in the worst case? (log2(1048576) + 1)",
        "correct_answer": "21",
        "acceptable_tolerance": 0.0,
        "unit": "comparisons",
        "explanation": "Binary search halves the search space each step. 1,048,576 is 2^20. Worst-case comparisons is floor(log2(n)) + 1 = 20 + 1 = 21 comparisons.",
        "citation": {
            "source_id": "src-dsa-textbook",
            "source_title": "Introduction to Algorithms & Data Structures (4th Edition)",
            "source_type": "pdf",
            "page_number": 24,
            "excerpt": "The recurrence T(n) = T(n/2) + O(1) yields an exact time complexity of O(log n) comparisons in the worst case."
        }
    }
]

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if demo user exists
        demo_user = db.query(User).filter(User.email == "demo@studysphere.ai").first()
        if not demo_user:
            demo_user = User(
                id="usr-demo-01",
                email="demo@studysphere.ai",
                hashed_password=hash_password("demo1234"),
                name="Alex Rivera",
                current_course="Data Structures & Algorithms",
                exam_date="2026-10-28",
                study_goal_hours_weekly=10,
                preferred_language="en",
                theme="system",
                streak_days=4,
                onboarding_completed=True,
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)

        # Demo Notebook
        nb = db.query(Notebook).filter(Notebook.user_id == demo_user.id).first()
        if not nb:
            nb = Notebook(
                id="nb-dsa-01",
                user_id=demo_user.id,
                course_id="cs-201-dsa",
                title="Data Structures & Algorithms",
                description="Core multimodal course notes, slide decks, and lecture recordings.",
            )
            db.add(nb)
            db.commit()
            db.refresh(nb)

        # Topics
        for name, desc, idx in TOPICS_LIST:
            existing = db.query(Topic).filter(Topic.name == name).first()
            if not existing:
                db.add(Topic(name=name, description=desc, order_index=idx, course_id="cs-201-dsa"))
        db.commit()

        # Prerequisites
        for from_t, to_t, reason in PREREQUISITES_LIST:
            existing = db.query(TopicPrerequisite).filter(
                TopicPrerequisite.from_topic == from_t,
                TopicPrerequisite.to_topic == to_t
            ).first()
            if not existing:
                db.add(TopicPrerequisite(from_topic=from_t, to_topic=to_t, reason=reason, course_id="cs-201-dsa"))
        db.commit()

        # Masteries
        for topic, data in INITIAL_MASTERIES.items():
            existing = db.query(TopicMastery).filter(
                TopicMastery.user_id == demo_user.id,
                TopicMastery.topic == topic
            ).first()
            if not existing:
                db.add(TopicMastery(
                    user_id=demo_user.id,
                    topic=topic,
                    mastery=data["mastery"],
                    last_practiced=data["last_practiced"],
                    attempts_count=data["attempts"],
                    correct_rate=data["rate"],
                    decay_status=data["decay"],
                    confidence_lower=data["ci"][0],
                    confidence_upper=data["ci"][1],
                    prerequisites_json=json.dumps(data["prereqs"])
                ))
        db.commit()

        # Seed Sources and Chunks
        for src_data in SEED_SOURCES:
            existing_src = db.query(Source).filter(Source.id == src_data["id"]).first()
            if not existing_src:
                new_src = Source(
                    id=src_data["id"],
                    notebook_id=nb.id,
                    user_id=demo_user.id,
                    title=src_data["title"],
                    source_type=src_data["source_type"],
                    file_size=src_data["file_size"],
                    unit_count=src_data["unit_count"],
                    unit_type=src_data["unit_type"],
                    topics_json=json.dumps(src_data["topics"]),
                    status="ready",
                    progress_pct=100,
                    description=src_data["description"]
                )
                db.add(new_src)
                db.commit()

                # Add chunks
                for unit in src_data["units"]:
                    chk = Chunk(
                        source_id=new_src.id,
                        notebook_id=nb.id,
                        modality=src_data["source_type"],
                        unit_number=unit["number"],
                        unit_label=unit["label"],
                        unit_title=unit["title"],
                        location_json=json.dumps(unit.get("location", {})),
                        text=unit["text"],
                        topic_id=unit["topics"][0] if unit["topics"] else "General"
                    )
                    db.add(chk)
                db.commit()

        # Seed Questions
        for q_data in SEED_QUESTIONS:
            existing_q = db.query(Question).filter(Question.id == q_data["id"]).first()
            if not existing_q:
                new_q = Question(
                    id=q_data["id"],
                    notebook_id=nb.id,
                    topic=q_data["topic"],
                    difficulty=q_data["difficulty"],
                    question_type=q_data["question_type"],
                    question_text=q_data["question_text"],
                    options_json=json.dumps(q_data.get("options", [])),
                    correct_answer=q_data["correct_answer"],
                    acceptable_tolerance=q_data.get("acceptable_tolerance"),
                    unit=q_data.get("unit"),
                    explanation=q_data["explanation"],
                    misconceptions_json=json.dumps(q_data.get("misconceptions", [])),
                    citation_json=json.dumps(q_data.get("citation", {}))
                )
                db.add(new_q)
        db.commit()

        # Seed Evaluation Metrics if not present
        existing_eval = db.query(EvalRun).first()
        if not existing_eval:
            initial_eval = EvalRun(
                hit_rate=0.92,
                faithfulness=0.94,
                citation_accuracy=0.98,
                refusal_accuracy=0.96,
                quiz_validity=0.95,
                details_json=json.dumps({
                    "test_queries_count": 85,
                    "adversarial_off_syllabus_count": 25,
                    "simulated_learners": 20
                })
            )
            db.add(initial_eval)
            db.commit()

    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized and seeded successfully.")
