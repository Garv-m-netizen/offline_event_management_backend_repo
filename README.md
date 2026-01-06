# Offline Event Management Platform

A production-ready full-stack web application for managing offline startup pitching events, connecting Organisers, Startups, and Investors through clearly defined roles and workflows.

## 🎯 Features

- **Three User Roles**: Organiser, Startup, and Investor with distinct permissions
- **Event Management**: Create, view, and manage offline events
- **Enrollment System**: Startups can enroll in upcoming events
- **Investor Access Control**: Request-based access approval system
- **Shortlisting**: Investors can shortlist startups after events close
- **JWT Authentication**: Secure token-based authentication
- **MongoDB Atlas**: Cloud database integration
- **Dark Theme UI**: Modern, responsive dark-themed interface

## 🛠️ Tech Stack

### Backend
- **Python FastAPI**: High-performance async web framework
- **MongoDB Atlas**: Cloud database (PyMongo)
- **JWT**: Token-based authentication
- **Argon2**: Secure password hashing
- **Pydantic**: Data validation

### Frontend
- **React 18**: Modern UI library
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework (dark theme)
- **React Router v6**: Client-side routing
- **Axios**: HTTP client with JWT interceptor
- **Context API**: Global state management

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- MongoDB Atlas account (free tier works)
- Git

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd off_event_manage
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

#### Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/event_management?retryWrites=true&w=majority
SECRET_KEY=your-secret-key-change-this-in-production-minimum-32-characters
```

**Important**: 
- Replace `username` and `password` with your MongoDB Atlas credentials
- Replace `cluster` with your cluster name
- Generate a strong `SECRET_KEY` for production (minimum 32 characters)

#### Run the Backend Server

**Option 1: Using the run script (Recommended)**
```bash
# Windows
run_backend.bat

# Linux/Mac
chmod +x run_backend.sh
./run_backend.sh
```

**Option 2: Manual command**
```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Important**: Always run from the `backend` directory, or use the provided scripts.

The API will be available at `http://localhost:8000`

### 3. Frontend Setup

#### Install Dependencies

```bash
cd frontend
npm install
```

#### Run the Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📚 API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get JWT token

### Events
- `POST /events` - Create event (Organiser only)
- `GET /events` - Get all events (Startup & Investor)
- `GET /events/my` - Get my events (Organiser only)
- `POST /events/update-status` - Update event status (Organiser only)
- `GET /events/{event_name}/enrollments` - Get enrollments for event (Organiser only)

### Enrollments
- `POST /enrollments` - Create enrollment (Startup only)
- `GET /enrollments/my` - Get my enrollments (Startup only)

### Investors
- `POST /investors/request-access` - Request access to event (Investor only)
- `GET /investors/requests/{event_name}` - Get access requests (Organiser only)
- `POST /investors/approve` - Approve/reject access (Organiser only)
- `GET /investors/event/{event_name}` - Get enrolled startups (Investor only, after approval)
- `POST /investors/shortlist` - Shortlist a startup (Investor only, after event closed)

## 👥 User Roles & Permissions

### Organiser
- Create offline events
- View only events created by them
- Approve/reject investor access requests
- View enrolled startups for their events
- Close events after offline completion

### Startup
- See ALL events (upcoming + closed)
- Enroll only once per event
- Enroll only if event is upcoming
- Submit idea name, description, and team details
- See enrollment status (submitted/shortlisted)
- Cannot edit enrollment after submission

### Investor
- See ALL events (upcoming + closed)
- Request access to any event
- View enrolled startups only after organiser approval
- Shortlist startups only after event is closed

## 🔐 Security Features

- JWT-based authentication with HTTP Bearer tokens
- Argon2 password hashing
- Role-based access control (RBAC)
- Protected routes (both frontend and backend)
- Token stored in localStorage
- Automatic token attachment via Axios interceptor
- CORS configured for localhost development

## 🎨 UI Features

- Dark theme only (Tailwind CSS)
- Responsive design
- Role-aware navigation
- Event cards with clickable navigation
- Empty states for better UX
- Loading states
- Error handling with user-friendly messages

## 📁 Project Structure

```
off_event_manage/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── database.py          # MongoDB connection
│   ├── auth.py              # JWT & password hashing
│   ├── models.py            # Pydantic models
│   ├── routers/
│   │   ├── auth.py          # Authentication routes
│   │   ├── events.py       # Event routes
│   │   ├── enrollments.py  # Enrollment routes
│   │   └── investors.py    # Investor routes
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts (Auth)
│   │   ├── pages/          # Page components
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🧪 Development

### Backend Development

```bash
cd backend
uvicorn main:app --reload
```

### Frontend Development

```bash
cd frontend
npm run dev
```

### Building for Production

#### Frontend
```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/`

## 🔧 Configuration

### MongoDB Atlas Setup

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (or use `0.0.0.0/0` for development)
5. Get your connection string
6. Update `.env` file with your connection string

### CORS Configuration

CORS is configured for `http://localhost:5173` in `backend/main.py`. Update if needed for production.

## 🐛 Troubleshooting

### Backend Issues

- **Connection Error**: Check your MongoDB Atlas connection string and IP whitelist
- **Import Errors**: Ensure all dependencies are installed: `pip install -r requirements.txt`
- **Port Already in Use**: Change port in uvicorn command or kill the process using port 8000

### Frontend Issues

- **API Connection Error**: Ensure backend is running on `http://localhost:8000`
- **Build Errors**: Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- **CORS Errors**: Check backend CORS configuration

## 📝 Notes

- All passwords are hashed using Argon2
- JWT tokens expire after 30 days
- Event names must be globally unique
- One enrollment per startup per event
- Enrollments only allowed for upcoming events
- Shortlisting only allowed after event is closed

## 🚀 Production Deployment

Before deploying to production:

1. Change `SECRET_KEY` to a strong random string
2. Update CORS origins to your production domain
3. Use environment variables for all sensitive data
4. Enable HTTPS
5. Set up proper error logging
6. Configure MongoDB Atlas for production (backups, monitoring)
7. Use a production WSGI server (e.g., Gunicorn with Uvicorn workers)

## 📄 License

This project is built for educational and production use.

## 🤝 Support

For issues or questions, please check the codebase or create an issue in the repository.

