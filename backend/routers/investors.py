from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime
from typing import List
from models import (
    InvestorAccessRequest, InvestorAccessResponse, InvestorApprovalRequest,
    ShortlistRequest, EventStatus, EnrollmentStatus
)
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

@router.post("/request-access", status_code=status.HTTP_201_CREATED)
async def request_access(
    request_data: InvestorAccessRequest,
    current_user: dict = Depends(require_role(["investor"]))
):
    """Request access to an event (Investor only)."""
    db = get_db()
    
    # Check if event exists
    event = db.events.find_one({"name": request_data.event_name})
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Check if already requested
    existing_request = db.investor_access.find_one({
        "event_name": request_data.event_name,
        "investor_email": current_user["email"]
    })
    if existing_request:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Access request already exists"
        )
    
    # Create access request document
    access_doc = {
        "event_name": request_data.event_name,
        "investor_email": current_user["email"],
        "approved": False,
        "created_at": datetime.utcnow()
    }
    
    # Insert access request
    db.investor_access.insert_one(access_doc)
    
    return InvestorAccessResponse(**access_doc)

@router.get("/requests/{event_name}")
async def get_access_requests(
    event_name: str,
    current_user: dict = Depends(require_role(["organiser"]))
):
    """Get access requests for an event (Organiser only)."""
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
            detail="You can only view requests for your own events"
        )
    
    # Get all access requests for this event
    requests = list(db.investor_access.find({"event_name": event_name}).sort("created_at", -1))
    
    # Convert ObjectId to string and format response
    result = []
    for req in requests:
        req["_id"] = str(req["_id"])
        result.append(InvestorAccessResponse(**req))
    
    return result

@router.post("/approve")
async def approve_access(
    approval_data: InvestorApprovalRequest,
    current_user: dict = Depends(require_role(["organiser"]))
):
    """Approve or reject investor access request (Organiser only)."""
    db = get_db()
    
    # Check if event exists and belongs to organiser
    event = db.events.find_one({"name": approval_data.event_name})
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    if event["organiser_email"] != current_user["email"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only approve requests for your own events"
        )
    
    # Find access request
    access_request = db.investor_access.find_one({
        "event_name": approval_data.event_name,
        "investor_email": approval_data.investor_email
    })
    if not access_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Access request not found"
        )
    
    # Update approval status
    db.investor_access.update_one(
        {
            "event_name": approval_data.event_name,
            "investor_email": approval_data.investor_email
        },
        {"$set": {"approved": approval_data.approve}}
    )
    
    # Fetch updated request
    updated_request = db.investor_access.find_one({
        "event_name": approval_data.event_name,
        "investor_email": approval_data.investor_email
    })
    updated_request["_id"] = str(updated_request["_id"])
    
    return InvestorAccessResponse(**updated_request)

@router.get("/event/{event_name}")
async def get_event_startups(
    event_name: str,
    current_user: dict = Depends(require_role(["investor"]))
):
    """Get enrolled startups for an event (Investor only, after approval)."""
    db = get_db()
    
    # Check if event exists
    event = db.events.find_one({"name": event_name})
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Check if investor has approved access
    access_request = db.investor_access.find_one({
        "event_name": event_name,
        "investor_email": current_user["email"]
    })
    if not access_request or not access_request["approved"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access not approved for this event"
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

@router.post("/shortlist")
async def shortlist_startup(
    shortlist_data: ShortlistRequest,
    current_user: dict = Depends(require_role(["investor"]))
):
    """Shortlist a startup (Investor only, after event is closed)."""
    db = get_db()
    
    # Check if event exists
    event = db.events.find_one({"name": shortlist_data.event_name})
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Check if event is closed
    if event["status"] != EventStatus.CLOSED.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only shortlist startups after event is closed"
        )
    
    # Check if investor has approved access
    access_request = db.investor_access.find_one({
        "event_name": shortlist_data.event_name,
        "investor_email": current_user["email"]
    })
    if not access_request or not access_request["approved"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access not approved for this event"
        )
    
    # Find enrollment
    enrollment = db.enrollments.find_one({
        "event_name": shortlist_data.event_name,
        "startup_email": shortlist_data.startup_email
    })
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found"
        )
    
    # Update enrollment status to shortlisted
    db.enrollments.update_one(
        {
            "event_name": shortlist_data.event_name,
            "startup_email": shortlist_data.startup_email
        },
        {"$set": {"status": EnrollmentStatus.SHORTLISTED.value}}
    )
    
    # Fetch updated enrollment
    updated_enrollment = db.enrollments.find_one({
        "event_name": shortlist_data.event_name,
        "startup_email": shortlist_data.startup_email
    })
    updated_enrollment["_id"] = str(updated_enrollment["_id"])
    
    return {
        "event_name": updated_enrollment["event_name"],
        "startup_email": updated_enrollment["startup_email"],
        "idea_name": updated_enrollment["idea_name"],
        "idea_description": updated_enrollment["idea_description"],
        "team_details": updated_enrollment["team_details"],
        "status": updated_enrollment["status"]
    }

