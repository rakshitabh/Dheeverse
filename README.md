# Wellness Journal App - React.js + Node.js

A complete wellness journaling application built with React.js (Vite) frontend and Node.js (Express) backend.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB connection string (or local MongoDB)
- npm or yarn

### Backend Setup

1. Navigate to backend:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

4. Start backend:
```bash
npm run dev
```

Backend runs on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend (in a new terminal):
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start frontend:
```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

## 📁 Project Structure

```
wellness-journal-app/
├── backend/              # Node.js/Express backend
│   ├── server.js        # Express server
│   ├── routes/         # API routes
│   │   ├── auth.js     # Authentication routes
│   │   └── user.js     # User routes
│   ├── lib/            # Utilities and models
│   │   ├── mongodb.js  # MongoDB connection
│   │   ├── email.js    # Email service
│   │   └── models/     # Mongoose models
│   └── package.json
│
├── frontend/            # React.js/Vite frontend
│   ├── src/
│   │   ├── App.jsx     # Main app component
│   │   ├── main.jsx    # Entry point
│   │   ├── pages/      # Page components
│   │   ├── components/ # Reusable components
│   │   ├── layouts/    # Layout components
│   │   └── lib/        # Contexts and utilities
│   ├── public/         # Static assets
│   ├── vite.config.js  # Vite configuration
│   └── package.json
│
└── components/          # Original components (reference)
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/resend-otp` - Resend OTP

### User
- `GET /api/user/archive-pin` - Get archive PIN
- `POST /api/user/archive-pin` - Set archive PIN
- `DELETE /api/user/archive-pin` - Delete archive PIN

### Health
- `GET /api/health` - Server health check

## 🎯 Features

- ✅ User authentication with OTP verification
- ✅ Journal entries with mood tracking
- ✅ Emotional tracking and insights
- ✅ Wellness activities
- ✅ Archive functionality
- ✅ Beautiful, responsive UI
- ✅ Dark/light theme support

## 📦 Tech Stack

**Backend:**
- Node.js
- Express
- MongoDB (Mongoose)
- SMTP (for OTP emails)
- bcryptjs (password hashing)

**Frontend:**
- React.js 18
- Vite
- React Router 6
- Tailwind CSS
- Radix UI components
- Lucide React icons

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm run dev  # Vite dev server with HMR
```

### Build for Production

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 📄 License

Private project
