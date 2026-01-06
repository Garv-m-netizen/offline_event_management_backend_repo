from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    ORGANISER = "organiser"
    STARTUP = "startup"
    INVESTOR = "investor"

class EventStatus(str, Enum):
    UPCOMING = "upcoming"
    CLOSED = "closed"

class EnrollmentStatus(str, Enum):
    SUBMITTED = "submitted"
    SHORTLISTED = "shortlisted"

# User Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: UserRole
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    email: str
    role: str
    name: str

# Event Models
class EventCreate(BaseModel):
    name: str = Field(..., min_length=1)
    description: str
    image_url: str
    event_datetime: datetime
    terms_and_conditions: str

class EventResponse(BaseModel):
    name: str
    description: str
    image_url: str
    event_datetime: datetime
    terms_and_conditions: str
    status: EventStatus
    organiser_email: str

# Enrollment Models
class EnrollmentCreate(BaseModel):
    event_name: str
    idea_name: str
    idea_description: str
    team_details: str

class EnrollmentResponse(BaseModel):
    event_name: str
    startup_email: str
    idea_name: str
    idea_description: str
    team_details: str
    status: EnrollmentStatus

# Investor Access Models
class InvestorAccessRequest(BaseModel):
    event_name: str

class InvestorAccessResponse(BaseModel):
    event_name: str
    investor_email: str
    approved: bool

class InvestorApprovalRequest(BaseModel):
    investor_email: str
    event_name: str
    approve: bool

class ShortlistRequest(BaseModel):
    event_name: str
    startup_email: str

class EventStatusUpdate(BaseModel):
    event_name: str
    status: EventStatus

