import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from app.db.session import Base

def gen_id(prefix: str = "id") -> str:
    return f"{prefix}-{uuid.uuid4().hex[:12]}"

class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, default=lambda: gen_id("usr"))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(255), default="Demo Student")
    current_course = Column(String(255), default="Data Structures & Algorithms")
    exam_date = Column(String(64), default="2026-10-28")
    study_goal_hours_weekly = Column(Integer, default=10)
    preferred_language = Column(String(10), default="en")
    theme = Column(String(20), default="system")
    streak_days = Column(Integer, default=4)
    onboarding_completed = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    notebooks = relationship("Notebook", back_populates="user", cascade="all, delete-orphan")
    quizzes = relationship("Quiz", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    masteries = relationship("TopicMastery", back_populates="user", cascade="all, delete-orphan")
    flashcards = relationship("Flashcard", back_populates="user", cascade="all, delete-orphan")
    focus_sessions = relationship("FocusSession", back_populates="user", cascade="all, delete-orphan")
    schedule_sessions = relationship("ScheduleSession", back_populates="user", cascade="all, delete-orphan")

class Notebook(Base):
    __tablename__ = "notebooks"

    id = Column(String(64), primary_key=True, default=lambda: gen_id("nb"))
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    course_id = Column(String(64), default="cs-201-dsa")
    title = Column(String(255), default="Data Structures & Algorithms")
    description = Column(Text, default="Multimodal course notes and study materials.")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notebooks")
    sources = relationship("Source", back_populates="notebook", cascade="all, delete-orphan")

class Source(Base):
    __tablename__ = "sources"

    id = Column(String(64), primary_key=True, default=lambda: gen_id("src"))
    notebook_id = Column(String(64), ForeignKey("notebooks.id"), nullable=True)
    user_id = Column(String(64), ForeignKey("users.id"), nullable=True)
    title = Column(String(255), nullable=False)
    source_type = Column(String(32), nullable=False) # pdf, pptx, video, docx, txt
    file_path = Column(String(512), nullable=True)
    file_size = Column(String(64), default="1.0 MB")
    unit_count = Column(Integer, default=1)
    unit_type = Column(String(32), default="pages") # pages, slides, minutes
    topics_json = Column(Text, default="[]") # JSON list of topic strings
    status = Column(String(32), default="ready") # queued, extracting, transcribing, chunking, embedding, ready, failed
    progress_pct = Column(Integer, default=100)
    error_message = Column(Text, nullable=True)
    description = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    notebook = relationship("Notebook", back_populates="sources")
    chunks = relationship("Chunk", back_populates="source", cascade="all, delete-orphan")

class Chunk(Base):
    __tablename__ = "chunks"

    id = Column(String(64), primary_key=True, default=lambda: gen_id("chk"))
    source_id = Column(String(64), ForeignKey("sources.id"), nullable=False)
    notebook_id = Column(String(64), nullable=True)
    modality = Column(String(32), default="text") # pdf, slide, video, audio, image, figure, text
    unit_number = Column(Integer, default=1)
    unit_label = Column(String(64), default="Page 1")
    unit_title = Column(String(255), default="")
    location_json = Column(Text, default="{}") # {page, slide, start_s, end_s, section_heading}
    text = Column(Text, nullable=False)
    topic_id = Column(String(128), default="General")
    embedding_id = Column(String(128), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    source = relationship("Source", back_populates="chunks")

class Topic(Base):
    __tablename__ = "topics"

    id = Column(String(64), primary_key=True, default=lambda: gen_id("top"))
    course_id = Column(String(64), default="cs-201-dsa")
    name = Column(String(128), nullable=False, unique=True)
    description = Column(Text, default="")
    order_index = Column(Integer, default=0)

class TopicPrerequisite(Base):
    __tablename__ = "topic_prerequisites"

    id = Column(String(64), primary_key=True, default=lambda: gen_id("prereq"))
    course_id = Column(String(64), default="cs-201-dsa")
    from_topic = Column(String(128), nullable=False)
    to_topic = Column(String(128), nullable=False)
    reason = Column(Text, nullable=False)

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(64), primary_key=True, default=lambda: gen_id("conv"))
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    notebook_id = Column(String(64), nullable=True)
    channel = Column(String(32), default="text") # text, voice
    title = Column(String(255), default="Study Session")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"

    id = Column(String(64), primary_key=True, default=lambda: gen_id("msg"))
    conversation_id = Column(String(64), ForeignKey("conversations.id"), nullable=False)
    role = Column(String(32), nullable=False) # user, assistant
    content = Column(Text, nullable=False)
    grounding_status = Column(String(32), nullable=True) # backed, partial, outside
    outside_knowledge = Column(Text, nullable=True)
    topic = Column(String(128), nullable=True)
    timestamp = Column(String(64), default=lambda: datetime.utcnow().strftime("%I:%M %p"))
    feedback = Column(String(32), nullable=True)

    conversation = relationship("Conversation", back_populates="messages")
    citations = relationship("Citation", back_populates="message", cascade="all, delete-orphan")

class Citation(Base):
    __tablename__ = "citations"

    id = Column(String(64), primary_key=True, default=lambda: gen_id("cit"))
    message_id = Column(String(64), ForeignKey("messages.id"), nullable=True)
    source_id = Column(String(64), nullable=False)
    source_title = Column(String(255), nullable=False)
    source_type = Column(String(32), default="pdf")
    page_number = Column(Integer, nullable=True)
    slide_number = Column(Integer, nullable=True)
    start_seconds = Column(Integer, nullable=True)
    end_seconds = Column(Integer, nullable=True)
    timestamp_label = Column(String(32), nullable=True)
    excerpt = Column(Text, nullable=False)
    section_heading = Column(String(255), nullable=True)

    message = relationship("Message", back_populates="citations")

class Question(Base):
    __tablename__ = "questions"

    id = Column(String(64), primary_key=True, default=lambda: gen_id("q"))
    notebook_id = Column(String(64), nullable=True)
    topic = Column(String(128), nullable=False)
    difficulty = Column(String(32), default="medium") # easy, medium, hard
    question_type = Column(String(32), default="mcq") # mcq, short_answer, numerical
    question_text = Column(Text, nullable=False)
    options_json = Column(Text, default="[]") # JSON list of option strings
    correct_answer = Column(Text, nullable=False)
    acceptable_tolerance = Column(Float, nullable=True)
    unit = Column(String(64), nullable=True)
    explanation = Column(Text, nullable=False)
    misconceptions_json = Column(Text, default="[]") # JSON list of {option, misconception}
    citation_json = Column(Text, default="{}") # JSON of Citation
    created_at = Column(DateTime, default=datetime.utcnow)

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(String(64), primary_key=True, default=lambda: gen_id("quiz"))
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    notebook_id = Column(String(64), nullable=True)
    title = Column(String(255), nullable=False)
    course_id = Column(String(64), default="cs-201-dsa")
    topics_json = Column(Text, default="[]")
    difficulty = Column(String(32), default="adaptive")
    mode = Column(String(32), default="practice") # practice, exam, diagnostic
    time_limit_minutes = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="quizzes")
    attempts = relationship("QuizAttempt", back_populates="quiz", cascade="all, delete-orphan")

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(String(64), primary_key=True, default=lambda: gen_id("att"))
    quiz_id = Column(String(64), ForeignKey("quizzes.id"), nullable=False)
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    score = Column(Integer, default=0)
    total_questions = Column(Integer, default=0)
    percentage = Column(Integer, default=0)
    time_taken_seconds = Column(Integer, default=0)
    completed_at = Column(String(64), default=lambda: datetime.utcnow().strftime("%I:%M %p"))
    topic_breakdown_json = Column(Text, default="{}")
    root_cause_insights_json = Column(Text, default="[]")
    likely_misconceptions_json = Column(Text, default="[]")
    recommended_topics_json = Column(Text, default="[]")

    quiz = relationship("Quiz", back_populates="attempts")
    answers = relationship("AttemptAnswer", back_populates="attempt", cascade="all, delete-orphan")

class AttemptAnswer(Base):
    __tablename__ = "attempt_answers"

    id = Column(String(64), primary_key=True, default=lambda: gen_id("ans"))
    attempt_id = Column(String(64), ForeignKey("quiz_attempts.id"), nullable=False)
    question_id = Column(String(64), nullable=False)
    user_answer = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=False)
    time_spent_seconds = Column(Integer, default=0)
    identified_misconception = Column(Text, nullable=True)

    attempt = relationship("QuizAttempt", back_populates="answers")

class TopicMastery(Base):
    __tablename__ = "topic_masteries"

    id = Column(String(64), primary_key=True, default=lambda: gen_id("mst"))
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    topic = Column(String(128), nullable=False)
    mastery = Column(Float, default=0.5) # 0.0 - 1.0
    last_practiced = Column(String(64), default="Just now")
    attempts_count = Column(Integer, default=0)
    correct_rate = Column(Float, default=0.5)
    decay_status = Column(String(32), default="fresh") # fresh, due, critical
    confidence_lower = Column(Float, default=0.4)
    confidence_upper = Column(Float, default=0.6)
    prerequisites_json = Column(Text, default="[]")
    updated_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="masteries")

class MasteryHistory(Base):
    __tablename__ = "mastery_histories"

    id = Column(String(64), primary_key=True, default=lambda: gen_id("mh"))
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    topic = Column(String(128), nullable=False)
    mastery = Column(Float, nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow)

class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(String(64), primary_key=True, default=lambda: gen_id("fc"))
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    topic = Column(String(128), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    citation_json = Column(Text, default="{}")
    difficulty = Column(String(32), default="medium")
    last_reviewed = Column(String(64), nullable=True)
    state = Column(String(32), default="new") # new, reviewing, mastered
    next_review_at = Column(DateTime, default=datetime.utcnow)
    interval_days = Column(Integer, default=1)
    ease_factor = Column(Float, default=2.5)

    user = relationship("User", back_populates="flashcards")

class PersonalNote(Base):
    __tablename__ = "personal_notes"

    id = Column(String(64), primary_key=True, default=lambda: gen_id("note"))
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    notebook_id = Column(String(64), nullable=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, default="")
    updated_at = Column(DateTime, default=datetime.utcnow)

class Highlight(Base):
    __tablename__ = "highlights"

    id = Column(String(64), primary_key=True, default=lambda: gen_id("hl"))
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    source_id = Column(String(64), nullable=False)
    chunk_id = Column(String(64), nullable=True)
    text = Column(Text, nullable=False)
    note = Column(Text, default="")
    color = Column(String(32), default="yellow")
    created_at = Column(DateTime, default=datetime.utcnow)

class FocusSession(Base):
    __tablename__ = "focus_sessions"

    id = Column(String(64), primary_key=True, default=lambda: gen_id("fcs"))
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    planned_minutes = Column(Integer, default=25)
    focused_minutes = Column(Integer, default=0)
    subject = Column(String(128), default="General Study")
    tab_blur_count = Column(Integer, default=0)
    completed = Column(Boolean, default=True)

    user = relationship("User", back_populates="focus_sessions")

class ScheduleSession(Base):
    __tablename__ = "schedule_sessions"

    id = Column(String(64), primary_key=True, default=lambda: gen_id("sch"))
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    day = Column(String(32), default="Today")
    date = Column(String(64), default="")
    title = Column(String(255), nullable=False)
    topic = Column(String(128), nullable=False)
    duration_minutes = Column(Integer, default=30)
    session_type = Column(String(32), default="revision") # new_practice, revision
    completed = Column(Boolean, default=False)
    priority_reason = Column(Text, default="")

    user = relationship("User", back_populates="schedule_sessions")

class EvalRun(Base):
    __tablename__ = "eval_runs"

    id = Column(String(64), primary_key=True, default=lambda: gen_id("eval"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    hit_rate = Column(Float, default=0.0)
    faithfulness = Column(Float, default=0.0)
    citation_accuracy = Column(Float, default=0.0)
    refusal_accuracy = Column(Float, default=0.0)
    quiz_validity = Column(Float, default=0.0)
    details_json = Column(Text, default="{}")
