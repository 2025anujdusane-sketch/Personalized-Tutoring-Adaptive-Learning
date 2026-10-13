import json
import random
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.db.session import SessionLocal
from app.db.models import Question as DBQuestion, Quiz as DBQuiz, QuizAttempt, AttemptAnswer, TopicMastery, MasteryHistory
from app.schemas import (
    QuestionSchema, QuizSchema, QuizAttemptAnswer, QuizResult,
    CitationSchema, DistractorMisconception, TopicStat, MasteryDelta, MisconceptionItem
)
from app.services.mastery import update_bkt_mastery, diagnose_root_causes

def build_question_schema(q: DBQuestion) -> QuestionSchema:
    options = json.loads(q.options_json) if q.options_json else []
    misconceptions = []
    if q.misconceptions_json:
        try:
            raw_m = json.loads(q.misconceptions_json)
            misconceptions = [DistractorMisconception(**m) for m in raw_m]
        except Exception:
            pass

    citation_dict = {}
    if q.citation_json:
        try:
            citation_dict = json.loads(q.citation_json)
        except Exception:
            pass

    return QuestionSchema(
        id=q.id,
        topic=q.topic,
        difficulty=q.difficulty,
        type=q.question_type,
        question=q.question_text,
        options=options if options else None,
        correctAnswer=q.correct_answer,
        acceptableTolerance=q.acceptable_tolerance,
        unit=q.unit,
        explanation=q.explanation,
        misconceptions=misconceptions if misconceptions else None,
        citation=CitationSchema(
            source_id=citation_dict.get("source_id", "src-dsa-textbook"),
            source_title=citation_dict.get("source_title", "Data Structures & Algorithms"),
            source_type=citation_dict.get("source_type", "pdf"),
            page_number=citation_dict.get("page_number"),
            slide_number=citation_dict.get("slide_number"),
            start_seconds=citation_dict.get("start_seconds"),
            end_seconds=citation_dict.get("end_seconds"),
            timestamp_label=citation_dict.get("timestamp_label"),
            excerpt=citation_dict.get("excerpt", "Core syllabus concept excerpt."),
            section_heading=citation_dict.get("section_heading")
        )
    )

def generate_diagnostic_quiz(user_id: str) -> QuizSchema:
    db = SessionLocal()
    try:
        # Diagnostic tests 5 foundational and advanced topics
        target_ids = ["q-arr-01", "q-rec-01", "q-bs-01", "q-tree-01", "q-dp-01"]
        db_questions = db.query(DBQuestion).filter(DBQuestion.id.in_(target_ids)).all()
        if not db_questions:
            db_questions = db.query(DBQuestion).limit(5).all()

        questions = [build_question_schema(q) for q in db_questions]

        quiz = DBQuiz(
            user_id=user_id,
            title="Course Diagnostic Assessment (5 Questions)",
            course_id="cs-201-dsa",
            topics_json=json.dumps(["Arrays", "Recursion", "Binary Search", "Trees", "Dynamic Programming"]),
            difficulty="adaptive",
            mode="diagnostic",
            time_limit_minutes=10
        )
        db.add(quiz)
        db.commit()
        db.refresh(quiz)

        return QuizSchema(
            id=quiz.id,
            title=quiz.title,
            courseId=quiz.course_id,
            topics=["Arrays", "Recursion", "Binary Search", "Trees", "Dynamic Programming"],
            difficulty=quiz.difficulty,
            mode=quiz.mode,
            timeLimitMinutes=quiz.time_limit_minutes,
            questions=questions,
            createdAt=quiz.created_at.isoformat()
        )
    finally:
        db.close()

def generate_quiz(
    user_id: str,
    topics: List[str] = None,
    difficulty: str = "adaptive",
    types: List[str] = None,
    count: int = 5,
    mode: str = "practice",
    time_limit_minutes: Optional[int] = None
) -> QuizSchema:
    db = SessionLocal()
    try:
        chosen_topics = topics if topics and len(topics) > 0 else ["Trees", "Recursion", "Dynamic Programming"]
        query = db.query(DBQuestion).filter(DBQuestion.topic.in_(chosen_topics))

        if difficulty and difficulty != "adaptive":
            query = query.filter(DBQuestion.difficulty == difficulty)
        if types and len(types) > 0:
            query = query.filter(DBQuestion.question_type.in_(types))

        pool = query.all()
        if not pool:
            pool = db.query(DBQuestion).all()

        shuffled = list(pool)
        random.shuffle(shuffled)
        selected = shuffled[: min(count, len(shuffled))]
        questions = [build_question_schema(q) for q in selected]

        quiz = DBQuiz(
            user_id=user_id,
            title=f"{', '.join(chosen_topics[:3])} Assessment",
            course_id="cs-201-dsa",
            topics_json=json.dumps(chosen_topics),
            difficulty=difficulty,
            mode=mode,
            time_limit_minutes=time_limit_minutes
        )
        db.add(quiz)
        db.commit()
        db.refresh(quiz)

        return QuizSchema(
            id=quiz.id,
            title=quiz.title,
            courseId=quiz.course_id,
            topics=chosen_topics,
            difficulty=quiz.difficulty,
            mode=quiz.mode,
            timeLimitMinutes=quiz.time_limit_minutes,
            questions=questions,
            createdAt=quiz.created_at.isoformat()
        )
    finally:
        db.close()

def submit_quiz_attempt(
    quiz_id: str,
    user_id: str,
    answers: List[QuizAttemptAnswer],
    time_taken_seconds: int = 0
) -> QuizResult:
    db = SessionLocal()
    try:
        quiz = db.query(DBQuiz).filter(DBQuiz.id == quiz_id).first()
        quiz_title = quiz.title if quiz else "Course Assessment"
        mode = quiz.mode if quiz else "practice"

        # Load questions for this attempt
        q_ids = [a.questionId for a in answers]
        questions_map = {q.id: q for q in db.query(DBQuestion).filter(DBQuestion.id.in_(q_ids)).all()}

        total_questions = len(answers)
        correct_count = 0
        topic_stats: Dict[str, Dict[str, int]] = {}
        misconception_counts: Dict[Tuple[str, str], int] = {}
        processed_answers = []

        for ans in answers:
            q = questions_map.get(ans.questionId)
            topic = q.topic if q else "General"
            if topic not in topic_stats:
                topic_stats[topic] = {"correct": 0, "total": 0}
            topic_stats[topic]["total"] += 1

            is_correct = False
            detected_misconception = ans.identifiedMisconception

            if q:
                if q.question_type == "numerical":
                    try:
                        user_val = float(ans.userAnswer.strip())
                        correct_val = float(q.correct_answer.strip())
                        tol = q.acceptable_tolerance if q.acceptable_tolerance is not None else 0.05
                        is_correct = abs(user_val - correct_val) <= tol
                    except Exception:
                        is_correct = ans.userAnswer.strip() == q.correct_answer.strip()
                else:
                    is_correct = ans.userAnswer.strip().lower() == q.correct_answer.strip().lower()

                # If incorrect, check distractor misconceptions
                if not is_correct and not detected_misconception and q.misconceptions_json:
                    try:
                        misc_list = json.loads(q.misconceptions_json)
                        for m in misc_list:
                            if m.get("option", "").strip().lower() == ans.userAnswer.strip().lower():
                                detected_misconception = m.get("misconception")
                                break
                    except Exception:
                        pass

            if is_correct:
                correct_count += 1
                topic_stats[topic]["correct"] += 1
            elif detected_misconception:
                key = (topic, detected_misconception)
                misconception_counts[key] = misconception_counts.get(key, 0) + 1

            processed_answers.append(QuizAttemptAnswer(
                questionId=ans.questionId,
                userAnswer=ans.userAnswer,
                isCorrect=is_correct,
                timeSpentSeconds=ans.timeSpentSeconds,
                flagged=ans.flagged,
                identifiedMisconception=detected_misconception
            ))

        # Format topic breakdown
        topic_breakdown: Dict[str, TopicStat] = {}
        for top, counts in topic_stats.items():
            score_pct = int(round((counts["correct"] / counts["total"]) * 100)) if counts["total"] > 0 else 0
            topic_breakdown[top] = TopicStat(correct=counts["correct"], total=counts["total"], score=score_pct)

        # Update BKT Topic Masteries in DB
        mastery_changes: Dict[str, MasteryDelta] = {}
        for top, stat in topic_breakdown.items():
            user_tm = db.query(TopicMastery).filter(
                TopicMastery.user_id == user_id,
                TopicMastery.topic == top
            ).first()
            if not user_tm:
                user_tm = TopicMastery(
                    user_id=user_id,
                    topic=top,
                    mastery=0.5,
                    attempts_count=0,
                    correct_rate=0.5
                )
                db.add(user_tm)
                db.commit()
                db.refresh(user_tm)

            before_m = user_tm.mastery
            # Run BKT for each question in this session
            new_m = before_m
            session_correct = stat.correct
            session_total = stat.total
            for i in range(session_total):
                ans_correct = i < session_correct
                new_m = update_bkt_mastery(new_m, ans_correct)

            user_tm.mastery = new_m
            user_tm.attempts_count += session_total
            user_tm.last_practiced = "Just now"
            user_tm.decay_status = "critical" if new_m < 0.40 else "due" if new_m < 0.65 else "fresh"
            user_tm.confidence_lower = max(0.05, round(new_m - 0.08, 2))
            user_tm.confidence_upper = min(0.99, round(new_m + 0.08, 2))
            db.commit()

            # Record history
            db.add(MasteryHistory(user_id=user_id, topic=top, mastery=new_m))
            db.commit()

            mastery_changes[top] = MasteryDelta(before=before_m, after=new_m)

        # Root-cause diagnostic
        insights = diagnose_root_causes(user_id, {t: s.model_dump() for t, s in topic_breakdown.items()})

        # Recommended topics
        rec_topics = [t for t, s in topic_breakdown.items() if s.score < 70]
        if not rec_topics:
            rec_topics = ["Trees", "Recursion"]

        likely_misconceptions = [
            MisconceptionItem(topic=t, misconception=m, count=c)
            for (t, m), c in misconception_counts.items()
        ]

        percentage = int(round((correct_count / total_questions) * 100)) if total_questions > 0 else 0

        # Persist attempt
        attempt = QuizAttempt(
            quiz_id=quiz_id,
            user_id=user_id,
            score=correct_count,
            total_questions=total_questions,
            percentage=percentage,
            time_taken_seconds=time_taken_seconds,
            topic_breakdown_json=json.dumps({t: s.model_dump() for t, s in topic_breakdown.items()}),
            root_cause_insights_json=json.dumps(insights),
            likely_misconceptions_json=json.dumps([m.model_dump() for m in likely_misconceptions]),
            recommended_topics_json=json.dumps(rec_topics)
        )
        db.add(attempt)
        db.commit()
        db.refresh(attempt)

        for pa in processed_answers:
            db.add(AttemptAnswer(
                attempt_id=attempt.id,
                question_id=pa.questionId,
                user_answer=pa.userAnswer,
                is_correct=pa.isCorrect,
                time_spent_seconds=pa.timeSpentSeconds,
                identified_misconception=pa.identifiedMisconception
            ))
        db.commit()

        return QuizResult(
            quizId=quiz_id,
            quizTitle=quiz_title,
            score=correct_count,
            totalQuestions=total_questions,
            percentage=percentage,
            completedAt=datetime.utcnow().strftime("%I:%M %p"),
            timeTakenSeconds=time_taken_seconds,
            mode=mode,
            topicBreakdown=topic_breakdown,
            userAnswers=processed_answers,
            masteryChanges=mastery_changes,
            rootCauseInsights=insights,
            likelyMisconceptions=likely_misconceptions,
            recommendedTopics=rec_topics
        )
    finally:
        db.close()
