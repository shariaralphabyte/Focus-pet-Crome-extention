# 🚀 School Management System - Complete Setup Guide

A comprehensive MERN stack school/college website with bilingual support (English/Bengali), featuring modern UI, role-based authentication, and complete administrative functionality.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v16.0.0 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v5.0 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/downloads)
- **Code Editor** (VS Code recommended) - [Download here](https://code.visualstudio.com/)

## 🛠️ Installation Steps

### Step 1: Clone and Setup Project

```bash
# Navigate to your desired directory
cd /Users/360infotech/Desktop/Practice/Institute

# The project is already in the school-website folder
cd school-website

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root directory
cd ..
```

### Step 2: Environment Configuration

#### Backend Environment Setup

```bash
# Navigate to backend directory
cd backend

# The .env file is already created, but you need to update it with your actual values
# Open .env file and update the following:
```

**Update `backend/.env` with your actual values:**

```env
NODE_ENV=development
PORT=5000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/school_website
# For MongoDB Atlas (cloud), use: mongodb+srv://username:password@cluster.mongodb.net/school_website

# JWT Configuration
JWT_SECRET=your_very_long_and_secure_jwt_secret_key_here_make_it_at_least_32_characters_long
JWT_EXPIRE=30d

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Admin Default Credentials
ADMIN_EMAIL=admin@school.edu
ADMIN_PASSWORD=admin123456
ADMIN_NAME=System Administrator

# School Information
SCHOOL_NAME=ABC School & College
SCHOOL_ADDRESS=123 Education Street, Dhaka, Bangladesh
SCHOOL_PHONE=+880-1234-567890
SCHOOL_EMAIL=info@abcschool.edu.bd
SCHOOL_WEBSITE=https://abcschool.edu.bd
```

#### Frontend Environment Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Create .env file
touch .env

# Add the following content to frontend/.env
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
echo "REACT_APP_APP_NAME=School Management System" >> .env
echo "GENERATE_SOURCEMAP=false" >> .env
```

### Step 3: Database Setup

#### Option A: Local MongoDB

```bash
# Start MongoDB service (macOS with Homebrew)
brew services start mongodb-community

# Or start manually
mongod --config /usr/local/etc/mongod.conf

# Verify MongoDB is running
mongo --eval "db.adminCommand('ismaster')"
```

#### Option B: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Get your connection string
4. Update `MONGODB_URI` in `backend/.env`

### Step 4: Cloudinary Setup (Optional - for image uploads)

1. Go to [Cloudinary](https://cloudinary.com/)
2. Create a free account
3. Get your Cloud Name, API Key, and API Secret
4. Update the Cloudinary variables in `backend/.env`

### Step 5: Email Configuration (Optional - for notifications)

#### For Gmail:

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Update email variables in `backend/.env`

## 🚀 Running the Application

### Method 1: Run Both Services Simultaneously

```bash
# From the root directory
npm run dev
```

This will start both backend (port 5000) and frontend (port 3000) simultaneously.

### Method 2: Run Services Separately

#### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 👤 Default Login Credentials

The system automatically creates a default admin user:

- **Email**: admin@school.edu
- **Password**: admin123456

**⚠️ IMPORTANT**: Change the default password immediately after first login!

## 🔧 Available Scripts

### Root Directory Scripts:
```bash
npm run dev          # Start both frontend and backend
npm run server       # Start backend only
npm run client       # Start frontend only
npm run install-deps # Install all dependencies
npm test            # Run all tests
```

### Backend Scripts:
```bash
npm start           # Start production server
npm run dev         # Start development server with nodemon
npm run seed        # Seed database with sample data
npm test           # Run backend tests
```

### Frontend Scripts:
```bash
npm start          # Start development server
npm run build      # Build for production
npm test          # Run frontend tests
npm run eject     # Eject from Create React App (not recommended)
```

## 📱 Features Overview

### 🎯 Core Features
- **Bilingual Support**: Full English and Bengali language support
- **Role-Based Authentication**: Admin, Teacher, and Student roles
- **Responsive Design**: Mobile-first design with dark/light mode
- **Real-time Updates**: Live notifications and updates
- **Modern UI/UX**: Clean interface with smooth animations

### 👨‍💼 Admin Features
- Complete user management (Students, Teachers, Staff)
- Notice board management with rich text editor
- Gallery management (Photos/Videos)
- Class routines and exam schedules
- Result management and publishing
- Institution profile management
- Comprehensive dashboard with analytics

### 👨‍🏫 Teacher Features
- Student management for assigned classes
- Attendance tracking
- Grade and result entry
- Notice creation and management
- Class routine viewing
- Assignment management

### 👨‍🎓 Student Features
- Personal dashboard with academic overview
- Notice board access
- Class routines and schedules
- Result viewing and download
- Assignment submissions
- Gallery access

## 🗂️ Project Structure

```
school-website/
├── backend/
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── utils/           # Utility functions
│   ├── uploads/         # File uploads
│   ├── .env             # Environment variables
│   └── server.js        # Entry point
├── frontend/
│   ├── public/          # Static files
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── store/       # Redux store
│   │   ├── hooks/       # Custom hooks
│   │   ├── i18n/        # Language files
│   │   └── App.js       # Main app component
│   ├── .env             # Environment variables
│   └── package.json
├── package.json         # Root package.json
└── README.md
```

## 🔍 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Notices
- `GET /api/notices` - Get all notices
- `GET /api/notices/:id` - Get single notice
- `POST /api/notices` - Create notice (Admin/Teacher)
- `PUT /api/notices/:id` - Update notice
- `DELETE /api/notices/:id` - Delete notice

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/teachers` - Get teachers
- `GET /api/students` - Get students

## 🎨 Customization

### Changing Colors
Update colors in `frontend/tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          // ... other shades
        }
      }
    }
  }
}
```

### Adding New Languages
1. Create language file in `frontend/src/i18n/locales/`
2. Add language option in `frontend/src/i18n/i18n.js`
3. Update language selector in Navbar component

### School Information
Update school details in `backend/.env` file.

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/DigitalOcean)

1. **Prepare for deployment:**
```bash
cd backend
npm run build  # If you have a build script
```

2. **Set environment variables** on your hosting platform
3. **Deploy using platform-specific instructions**

### Frontend Deployment (Netlify/Vercel)

1. **Build the frontend:**
```bash
cd frontend
npm run build
```

2. **Deploy the `build` folder**
3. **Set up redirects** for React Router:

Create `frontend/public/_redirects`:
```
/*    /index.html   200
```

### Full Stack Deployment (Docker)

Create `Dockerfile` in root directory:
```dockerfile
FROM node:16-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm install
RUN cd backend && npm install
RUN cd ../frontend && npm install

# Copy source code
COPY . .

# Build frontend
RUN cd frontend && npm run build

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run backend tests only
cd backend && npm test

# Run frontend tests only
cd frontend && npm test
```

### Test Coverage
```bash
# Generate coverage report
npm run test:coverage
```

## 🔧 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start MongoDB if not running
brew services start mongodb-community
```

#### 2. Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

#### 3. Module Not Found Errors
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. CORS Issues
Make sure your frontend URL is added to CORS origins in `backend/server.js`.

#### 5. Environment Variables Not Loading
- Check file names (`.env` not `.env.example`)
- Restart the server after changing environment variables
- Ensure no spaces around `=` in environment variables

### Performance Optimization

#### Backend Optimization
- Enable gzip compression
- Use Redis for caching (optional)
- Optimize database queries with indexes
- Use CDN for static assets

#### Frontend Optimization
- Lazy load components
- Optimize images
- Use React.memo for expensive components
- Enable service worker for caching

## 📊 Monitoring and Analytics

### Health Checks
- Backend health: `GET /api/health`
- Database connection: Check MongoDB logs
- Frontend: Check browser console for errors

### Logging
- Backend logs: Check console output
- Frontend logs: Check browser developer tools
- Production logs: Use services like LogRocket or Sentry

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **JWT Secrets**: Use strong, unique secrets
3. **Password Hashing**: Already implemented with bcrypt
4. **Input Validation**: Validate all user inputs
5. **HTTPS**: Use HTTPS in production
6. **Rate Limiting**: Implement API rate limiting
7. **CORS**: Configure CORS properly

## 📚 Additional Resources

- [React Documentation](https://reactjs.org/docs)
- [Node.js Documentation](https://nodejs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)

## 🆘 Support

For support and questions:
- Check the troubleshooting section above
- Review the code comments and documentation
- Create an issue if you find bugs
- Contact: support@schoolsystem.com

## 📝 License

This project is licensed under the MIT License.

---

**🎉 Congratulations! Your School Management System is now ready to use!**

Visit http://localhost:3000 to start exploring the application.

**Default Admin Login:**
- Email: admin@school.edu
- Password: admin123456

**Remember to change the default password after first login!**
