"""
Comprehensive backend diagnostic script
Run this to check if your backend is configured correctly
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

print("=" * 60)
print("BACKEND DIAGNOSTIC CHECK")
print("=" * 60)

# 1. Check .env file
print("\n1. Checking .env file...")
env_path = Path(__file__).parent / ".env"
if env_path.exists():
    print(f"   ✅ .env file found at: {env_path.absolute()}")
    load_dotenv(dotenv_path=env_path)
else:
    print(f"   ❌ .env file NOT found at: {env_path.absolute()}")
    print("   Please create a .env file in the backend directory")
    sys.exit(1)

# 2. Check environment variables
print("\n2. Checking environment variables...")
mongo_uri = os.getenv("MONGO_URI")
secret_key = os.getenv("SECRET_KEY")

if mongo_uri:
    # Mask password in connection string
    if "@" in mongo_uri:
        parts = mongo_uri.split("@")
        if len(parts) == 2:
            user_part = parts[0].split("://")[1] if "://" in parts[0] else parts[0]
            if ":" in user_part:
                username = user_part.split(":")[0]
                print(f"   ✅ MONGO_URI: mongodb+srv://{username}:***@{parts[1][:30]}...")
            else:
                print(f"   ✅ MONGO_URI: {parts[0]}@***")
        else:
            print(f"   ✅ MONGO_URI: {mongo_uri[:50]}...")
    else:
        print(f"   ✅ MONGO_URI: {mongo_uri[:50]}...")
else:
    print("   ❌ MONGO_URI: NOT SET")
    print("   Add MONGO_URI=your_connection_string to .env file")

if secret_key:
    print(f"   ✅ SECRET_KEY: SET (length: {len(secret_key)} characters)")
    if len(secret_key) < 32:
        print("   ⚠️  WARNING: SECRET_KEY should be at least 32 characters for production!")
else:
    print("   ❌ SECRET_KEY: NOT SET")
    print("   Add SECRET_KEY=your_secret_key to .env file")

if not mongo_uri or not secret_key:
    print("\n   ❌ Missing required environment variables!")
    sys.exit(1)

# 3. Check Python imports
print("\n3. Checking Python dependencies...")
try:
    import fastapi
    print(f"   ✅ FastAPI: {fastapi.__version__}")
except ImportError as e:
    print(f"   ❌ FastAPI: {e}")
    sys.exit(1)

try:
    import pymongo
    print(f"   ✅ PyMongo: {pymongo.__version__}")
except ImportError as e:
    print(f"   ❌ PyMongo: {e}")
    sys.exit(1)

try:
    from passlib.context import CryptContext
    print("   ✅ Passlib: OK")
except ImportError as e:
    print(f"   ❌ Passlib: {e}")
    sys.exit(1)

try:
    from jose import jwt
    print("   ✅ python-jose: OK")
except ImportError as e:
    print(f"   ❌ python-jose: {e}")
    sys.exit(1)

# 4. Test database connection
print("\n4. Testing MongoDB Atlas connection...")
try:
    from pymongo import MongoClient
    from pymongo.errors import ConnectionFailure
    
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    print("   ✅ Successfully connected to MongoDB Atlas!")
    
    # Test database access
    db = client["event_management"]
    print("   ✅ Database 'event_management' accessible")
    
    # Check collections
    collections = db.list_collection_names()
    print(f"   ✅ Collections found: {collections if collections else 'None (database is empty)'}")
    
    client.close()
except ConnectionFailure as e:
    print(f"   ❌ Failed to connect to MongoDB Atlas: {e}")
    print("   Check your MONGO_URI connection string")
    print("   Make sure your IP is whitelisted in MongoDB Atlas")
    sys.exit(1)
except Exception as e:
    print(f"   ❌ Error: {e}")
    sys.exit(1)

# 5. Test authentication functions
print("\n5. Testing authentication functions...")
try:
    from auth import get_password_hash, verify_password, create_access_token, decode_access_token
    
    # Test password hashing
    test_password = "test123"
    hashed = get_password_hash(test_password)
    print("   ✅ Password hashing: OK")
    
    # Test password verification
    if verify_password(test_password, hashed):
        print("   ✅ Password verification: OK")
    else:
        print("   ❌ Password verification: FAILED")
        sys.exit(1)
    
    # Test JWT token creation
    token = create_access_token(data={"sub": "test@example.com", "role": "startup"})
    print("   ✅ JWT token creation: OK")
    
    # Test JWT token decoding
    payload = decode_access_token(token)
    if payload and payload.get("sub") == "test@example.com":
        print("   ✅ JWT token decoding: OK")
    else:
        print("   ❌ JWT token decoding: FAILED")
        sys.exit(1)
        
except Exception as e:
    print(f"   ❌ Error testing authentication: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# 6. Test module imports
print("\n6. Testing module imports...")
try:
    from database import get_db, init_db
    print("   ✅ database module: OK")
except Exception as e:
    print(f"   ❌ database module: {e}")
    sys.exit(1)

try:
    from routers import auth, events, enrollments, investors
    print("   ✅ router modules: OK")
except Exception as e:
    print(f"   ❌ router modules: {e}")
    sys.exit(1)

try:
    from models import UserRegister, UserLogin, UserRole
    print("   ✅ models module: OK")
except Exception as e:
    print(f"   ❌ models module: {e}")
    sys.exit(1)

# 7. Test FastAPI app creation
print("\n7. Testing FastAPI app...")
try:
    from main import app
    print("   ✅ FastAPI app created successfully")
    print(f"   ✅ App title: {app.title}")
except Exception as e:
    print(f"   ❌ Failed to create FastAPI app: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n" + "=" * 60)
print("✅ ALL CHECKS PASSED! Your backend is configured correctly.")
print("=" * 60)
print("\nYou can now start the backend server with:")
print("  cd backend")
print("  python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000")
print("\nOr use the run script:")
print("  run_backend.bat (Windows)")
print("  ./run_backend.sh (Linux/Mac)")

