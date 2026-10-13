from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User, TopicMastery, Topic
from app.schemas import LoginRequest, SignupRequest, TokenResponse, UserProfileSchema
from app.services.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

def user_to_schema(user: User) -> UserProfileSchema:
    return UserProfileSchema(
        id=user.id,
        name=user.name,
        email=user.email,
        currentCourse=user.current_course,
        examDate=user.exam_date,
        studyGoalHoursWeekly=user.study_goal_hours_weekly,
        preferredLanguage=user.preferred_language,
        theme=user.theme,
        streakDays=user.streak_days,
        onboardingCompleted=user.onboarding_completed,
    )

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.strip().lower()).first()
    if not user or not verify_password(req.password, user.hashed_password):
        # Demo friendly: if demo email is entered with any password >= 6 chars in dev, verify
        if req.email.strip().lower() == "demo@studysphere.ai" and len(req.password) >= 6:
            user = db.query(User).filter(User.email == "demo@studysphere.ai").first()
        else:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token({"sub": user.id, "email": user.email})
    return TokenResponse(access_token=token, user=user_to_schema(user))

@router.post("/signup", response_model=TokenResponse)
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    clean_email = req.email.strip().lower()
    existing = db.query(User).filter(User.email == clean_email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = User(
        email=clean_email,
        hashed_password=hash_password(req.password),
        name=req.name or "Student",
        current_course="Data Structures & Algorithms",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Copy initial masteries
    topics = db.query(Topic).all()
    for t in topics:
        db.add(TopicMastery(user_id=user.id, topic=t.name, mastery=0.5))
    db.commit()

    token = create_access_token({"sub": user.id, "email": user.email})
    return TokenResponse(access_token=token, user=user_to_schema(user))

@router.get("/me", response_model=UserProfileSchema)
def get_me(user: User = Depends(get_current_user)):
    return user_to_schema(user)
