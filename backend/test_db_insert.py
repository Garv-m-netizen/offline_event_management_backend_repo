"""Test script to check database insert operations"""
from database import get_db
from datetime import datetime
from auth import get_password_hash

print("Testing database insert...")

try:
    db = get_db()
    print(f"✅ Database connection: {db.name}")
    
    # Check current users
    users_before = list(db.users.find({}))
    print(f"Users before insert: {len(users_before)}")
    
    # Try to insert a test user
    test_user = {
        "email": f"test_{datetime.now().timestamp()}@test.com",
        "password": get_password_hash("test123"),
        "role": "startup",
        "name": "Test User",
        "created_at": datetime.utcnow()
    }
    
    result = db.users.insert_one(test_user)
    print(f"✅ Insert result: {result.inserted_id}")
    
    # Verify the insert
    users_after = list(db.users.find({}))
    print(f"Users after insert: {len(users_after)}")
    
    # Find the inserted user
    inserted_user = db.users.find_one({"_id": result.inserted_id})
    if inserted_user:
        print(f"✅ User found in database: {inserted_user['email']}")
    else:
        print("❌ User NOT found in database after insert!")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

