from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB Atlas connection
MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise ValueError("MONGO_URI environment variable is not set")

client = None
db = None

def init_db():
    global client, db
    try:
        client = MongoClient(MONGO_URI)
        # Test connection
        client.admin.command('ping')
        db = client["event_management"]
        print("✅ Connected to MongoDB Atlas successfully")
        
        # Create indexes for better performance
        db.events.create_index("name", unique=True)
        db.events.create_index("organiser_email")
        db.enrollments.create_index([("event_name", 1), ("startup_email", 1)], unique=True)
        db.investor_access.create_index([("event_name", 1), ("investor_email", 1)], unique=True)
        db.users.create_index("email", unique=True)
        
        print("✅ Database indexes created")
    except ConnectionFailure as e:
        print(f"❌ Failed to connect to MongoDB Atlas: {e}")
        raise

def get_db():
    if db is None:
        init_db()
    return db

