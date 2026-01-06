"""Quick script to check users in database"""
from database import get_db

db = get_db()
users = list(db.users.find({}))
print(f"\nTotal users in database: {len(users)}\n")
for i, user in enumerate(users, 1):
    print(f"{i}. Email: {user.get('email')}")
    print(f"   Name: {user.get('name')}")
    print(f"   Role: {user.get('role')}")
    print(f"   Created: {user.get('created_at')}")
    print()

