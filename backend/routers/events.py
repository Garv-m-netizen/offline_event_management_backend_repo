from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime
from typing import List
from models import EventCreate, EventResponse, EventStatus, EventStatusUpdate
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
async def create_event(
    event_data: EventCreate,
    current_user: dict = Depends(require_role(["organiser"]))
):
    """Create a new event (Organiser only)."""
    db = get_db()
    
    # Check if event name already exists
    existing_event = db.events.find_one({"name": event_data.name})
    if existing_event:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event name already exists"
        )
    
    # Create event document
    event_doc = {
        "name": event_data.name,
        "description": event_data.description,
        "image_url": event_data.image_url,
        "event_datetime": event_data.event_datetime,
        "terms_and_conditions": event_data.terms_and_conditions,
        "status": EventStatus.UPCOMING.value,
        "organiser_email": current_user["email"],
        "created_at": datetime.utcnow()
    }
    
    # Insert event
    db.events.insert_one(event_doc)
    
    return EventResponse(**event_doc)

@router.get("/my")
async def get_my_events(
    current_user: dict = Depends(require_role(["organiser"]))
):
    """Get events created by the current organiser (Organiser only)."""
    db = get_db()
    
    events = list(db.events.find({"organiser_email": current_user["email"]}).sort("event_datetime", 1))
    
    # Convert ObjectId to string and format response
    result = []
    for event in events:
        event["_id"] = str(event["_id"])
        result.append(EventResponse(**event))
    
    return result

@router.post("/update-status")
async def update_event_status(
    status_update: EventStatusUpdate,
    current_user: dict = Depends(require_role(["organiser"]))
):
    """Update event status (Organiser only)."""
    db = get_db()
    
    # Find event
    event = db.events.find_one({"name": status_update.event_name})
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Verify organiser owns this event
    if event["organiser_email"] != current_user["email"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own events"
        )
    
    # Update status
    db.events.update_one(
        {"name": status_update.event_name},
        {"$set": {"status": status_update.status.value}}
    )
    
    # Fetch updated event
    updated_event = db.events.find_one({"name": status_update.event_name})
    updated_event["_id"] = str(updated_event["_id"])
    
    return EventResponse(**updated_event)

@router.get("/{event_name}/enrollments")
async def get_event_enrollments(
    event_name: str,
    current_user: dict = Depends(require_role(["organiser"]))
):
    """Get enrollments for an event (Organiser only, for their own events)."""
    db = get_db()
    
    # Check if event exists and belongs to organiser
    event = db.events.find_one({"name": event_name})
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    if event["organiser_email"] != current_user["email"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view enrollments for your own events"
        )
    
    # Get all enrollments for this event
    enrollments = list(db.enrollments.find({"event_name": event_name}).sort("created_at", -1))
    
    # Convert ObjectId to string and format response
    result = []
    for enrollment in enrollments:
        enrollment["_id"] = str(enrollment["_id"])
        result.append({
            "event_name": enrollment["event_name"],
            "startup_email": enrollment["startup_email"],
            "idea_name": enrollment["idea_name"],
            "idea_description": enrollment["idea_description"],
            "team_details": enrollment["team_details"],
            "status": enrollment["status"]
        })
    
    return result

@router.get("")
async def get_events(
    current_user: dict = Depends(get_current_user)
):
    """Get all events (Startup & Investor can see all, Organiser sees all for reference)."""
    db = get_db()
    
    events = list(db.events.find({}).sort("event_datetime", 1))
    
    # Convert ObjectId to string and format response
    result = []
    for event in events:
        event["_id"] = str(event["_id"])
        result.append(EventResponse(**event))
    
    return result

