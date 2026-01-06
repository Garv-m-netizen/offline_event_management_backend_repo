from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime
from typing import List
from models import EnrollmentCreate, EnrollmentResponse, EnrollmentStatus, EventStatus
from database import get_db
from routers.auth import get_current_user

router = APIRouter()
security = HTTPBearer()

def require_role(allowed_roles: List[str]):
    """Dependency to check if user has required role."""
    def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_enrollment(
    enrollment_data: EnrollmentCreate,
    current_user: dict = Depends(require_role(["startup"]))
):
    """Create an enrollment (Startup only)."""
    db = get_db()
    
    # Check if event exists
    event = db.events.find_one({"name": enrollment_data.event_name})
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Check if event is upcoming
    if event["status"] != EventStatus.UPCOMING.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only enroll in upcoming events"
        )
    
    # Check if already enrolled
    existing_enrollment = db.enrollments.find_one({
        "event_name": enrollment_data.event_name,
        "startup_email": current_user["email"]
    })
    if existing_enrollment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already enrolled in this event"
        )
    
    # Create enrollment document
    enrollment_doc = {
        "event_name": enrollment_data.event_name,
        "startup_email": current_user["email"],
        "idea_name": enrollment_data.idea_name,
        "idea_description": enrollment_data.idea_description,
        "team_details": enrollment_data.team_details,
        "status": EnrollmentStatus.SUBMITTED.value,
        "created_at": datetime.utcnow()
    }
    
    # Insert enrollment
    db.enrollments.insert_one(enrollment_doc)
    
    return EnrollmentResponse(**enrollment_doc)

@router.get("/my")
async def get_my_enrollments(
    current_user: dict = Depends(require_role(["startup"]))
):
    """Get enrollments for the current startup (Startup only)."""
    db = get_db()
    
    enrollments = list(db.enrollments.find({"startup_email": current_user["email"]}).sort("created_at", -1))
    
    # Convert ObjectId to string and format response
    result = []
    for enrollment in enrollments:
        enrollment["_id"] = str(enrollment["_id"])
        result.append(EnrollmentResponse(**enrollment))
    
    return result

