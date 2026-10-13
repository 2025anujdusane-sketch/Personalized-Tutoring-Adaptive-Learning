import pytest
from app.services.quiz import submit_quiz_attempt
from app.schemas import QuizAttemptAnswer

def test_quiz_grading_correct_and_incorrect():
    # q-tree-01: Correct is option with 'fails to detect nodes in the right subtree'
    correct_ans = "It fails to detect nodes in the right subtree whose values are smaller than an ancestor node higher in the tree"
    answers = [
        QuizAttemptAnswer(
            questionId="q-tree-01",
            userAnswer=correct_ans,
            isCorrect=True,
            timeSpentSeconds=15
        ),
        QuizAttemptAnswer(
            questionId="q-rec-01",
            userAnswer="Allocating too much memory on the heap using dynamic arrays",
            isCorrect=False,
            timeSpentSeconds=20,
            identifiedMisconception="Confuses stack memory bounds with heap memory limits (OutOfMemoryError)."
        )
    ]

    result = submit_quiz_attempt(
        quiz_id="test-quiz-01",
        user_id="usr-demo-01",
        answers=answers,
        time_taken_seconds=35
    )

    assert result.totalQuestions == 2
    assert result.score == 1
    assert result.percentage == 50
    assert "Trees" in result.topicBreakdown
    assert "Recursion" in result.topicBreakdown
    assert len(result.likelyMisconceptions) >= 1
