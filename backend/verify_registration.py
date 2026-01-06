"""
Script to verify registration is working and show all users
Run this after registering a new user to verify it was saved
"""
from database import get_db
from datetime import datetime

print("=" * 60)
print("USER REGISTRATION VERIFICATION")
print("=" * 60)

db = get_db()
print(f"\nDatabase: {db.name}")
print(f"Database client: {db.client.address}")

# Get all users
users = list(db.users.find({}).sort("created_at", -1))
print(f"\nTotal users in database: {len(users)}\n")

if users:
    print("All registered users:")
    print("-" * 60)
    for i, user in enumerate(users, 1):
        print(f"\n{i}. Email: {user.get('email')}")
        print(f"   Name: {user.get('name')}")
        print(f"   Role: {user.get('role')}")
        print(f"   Created: {user.get('created_at')}")
        print(f"   ID: {user.get('_id')}")
else:
    print("No users found in database.")

print("\n" + "=" * 60)
print("To verify in MongoDB Atlas:")
print("1. Go to MongoDB Atlas → Collections")
print("2. Select database: event_management")
print("3. Select collection: users")
print("4. You should see all the users listed above")
print("=" * 60)

