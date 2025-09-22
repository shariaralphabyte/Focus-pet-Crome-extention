# 🏫 School Management System

<div align="center">
  <img src="https://img.shields.io/badge/MERN-Stack-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="MERN Stack" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
</div>

<div align="center">
  <h3>🌟 Dynamic School Website - Complete CMS Solution</h3>
  <p>A modern, fully dynamic, bilingual school website with comprehensive content management system built with React and Node.js.</p>
</div>

---

## ✨ Key Features

### 🌟 **Dynamic Content Management**
- **Complete CMS**: All content managed through admin dashboard
- **Bilingual Support**: Full Bengali/English content management
- **Real-time Statistics**: Auto-calculated from database
- **File Uploads**: PDF notices, image galleries with Cloudinary integration
- Assignment management
- Performance analytics

### 👨‍🎓 Student Features
- Personal dashboard with academic overview
- Notice board access
- Class routines and schedules
- Result viewing and download
- Assignment submissions
- Gallery access
- Profile management

### 🌐 Public Website Features
- Institution information and history
- Teacher profiles and qualifications
- Student achievements
- Photo and video gallery
- Latest notices and announcements
- Contact information
- Admission information

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **Cloudinary** - Image storage
- **Nodemailer** - Email service

### Frontend
- **React 18** - UI library
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React i18next** - Internationalization
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

## 📁 Project Structure

```
school-website/
├── backend/
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── utils/           # Utility functions
│   ├── uploads/         # File uploads
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
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd school-website
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install all dependencies (backend + frontend)
   npm run install-deps
   ```

3. **Environment Setup**
   
   Create `.env` file in the backend directory:
   ```bash
   cp backend/.env.example backend/.env
   ```
   
   Update the environment variables:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/school_website
   JWT_SECRET=your_very_long_and_secure_jwt_secret_key_here
   JWT_EXPIRE=30d
   
   # Optional: Cloudinary for image uploads
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   
   # Optional: Email configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   
   # Admin default credentials
   ADMIN_EMAIL=admin@school.edu
   ADMIN_PASSWORD=admin123456
   ADMIN_NAME=System Administrator
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud) by updating MONGODB_URI
   ```

5. **Run the application**
   ```bash
   # Development mode (runs both backend and frontend)
   npm run dev
   
   # Or run separately
   npm run server  # Backend only
   npm run client  # Frontend only
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/api/health

## 👤 Default Login Credentials

The system creates a default admin user on first startup:

- **Email**: admin@school.edu
- **Password**: admin123456

**⚠️ Important**: Change the default password after first login!

## 🔧 Configuration

### Database Setup
The application will automatically:
- Connect to MongoDB
- Create necessary collections
- Set up indexes for performance
- Create the default admin user

### Language Configuration
- Default language: English
- Supported languages: English (en), Bengali (bn)
- Language files: `frontend/src/i18n/locales/`

### Theme Configuration
- Default theme: Light mode
- Supports: Light/Dark mode toggle
- Customizable primary colors
- Responsive design breakpoints

## 📱 API Documentation

### Authentication Endpoints
```
POST /api/auth/login          # User login
POST /api/auth/register       # User registration (students only)
POST /api/auth/logout         # User logout
GET  /api/auth/me            # Get current user
PUT  /api/auth/profile       # Update profile
PUT  /api/auth/change-password # Change password
```

### Notice Endpoints
```
GET    /api/notices          # Get all notices
GET    /api/notices/:id      # Get single notice
POST   /api/notices          # Create notice (Admin/Teacher)
PUT    /api/notices/:id      # Update notice
DELETE /api/notices/:id      # Delete notice
POST   /api/notices/:id/like # Like/Unlike notice
POST   /api/notices/:id/comments # Add comment
```

### User Management Endpoints
```
GET    /api/users            # Get all users (Admin only)
GET    /api/teachers         # Get teachers
GET    /api/students         # Get students
POST   /api/auth/create-account # Create user (Admin only)
```

## 🎨 Customization

### Styling
- Primary colors can be changed in `tailwind.config.js`
- Custom CSS classes in `frontend/src/index.css`
- Component-specific styles using Tailwind classes

### Adding New Languages
1. Create language file in `frontend/src/i18n/locales/`
2. Add language option in `frontend/src/i18n/i18n.js`
3. Update language selector in Navbar component

### Adding New Features
1. Create database model in `backend/models/`
2. Add API routes in `backend/routes/`
3. Create Redux slice in `frontend/src/store/slices/`
4. Build React components in `frontend/src/components/`

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/DigitalOcean)
1. Set environment variables
2. Update MONGODB_URI for production database
3. Set NODE_ENV=production
4. Deploy using platform-specific instructions

### Frontend Deployment (Netlify/Vercel)
1. Build the frontend: `cd frontend && npm run build`
2. Deploy the `build` folder
3. Set up redirects for React Router
4. Update API_URL to production backend URL

### Full Stack Deployment (Docker)
```dockerfile
# Example Dockerfile structure
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test

# Run all tests
npm test
```

## 📊 Performance Optimization

- **Database**: Indexed fields for faster queries
- **Images**: Cloudinary integration for optimized delivery
- **Caching**: Redis integration ready (optional)
- **Compression**: Gzip compression enabled
- **Lazy Loading**: Components and images lazy loaded
- **Code Splitting**: React.lazy for route-based splitting

## 🔒 Security Features

- **Authentication**: JWT-based with secure httpOnly cookies
- **Authorization**: Role-based access control
- **Password**: Bcrypt hashing with salt rounds
- **Rate Limiting**: API rate limiting implemented
- **CORS**: Configured for specific origins
- **Helmet**: Security headers protection
- **Input Validation**: Server-side validation for all inputs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@schoolsystem.com
- Documentation: [Wiki](link-to-wiki)

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Online examination system
- [ ] Fee management system
- [ ] Library management
- [ ] Transport management
- [ ] Hostel management
- [ ] Alumni portal
- [ ] Parent portal
- [ ] SMS/WhatsApp integration

## 📸 Screenshots

### Homepage
![Homepage](screenshots/homepage.png)

### Admin Dashboard
![Admin Dashboard](screenshots/admin-dashboard.png)

### Notice Board
![Notice Board](screenshots/notice-board.png)

### Mobile Responsive
![Mobile View](screenshots/mobile-view.png)

---

**Made with ❤️ for educational institutions worldwide**

## 🏗️ Development Setup

### VS Code Extensions (Recommended)
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens
- Thunder Client (for API testing)

### Debugging
- Backend: Use VS Code debugger or `console.log`
- Frontend: React Developer Tools browser extension
- Redux: Redux DevTools browser extension
- Network: Browser DevTools Network tab

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format

# Type checking (if using TypeScript)
npm run type-check
```

This comprehensive school management system provides a solid foundation for educational institutions looking to digitize their operations and improve communication between students, teachers, and administrators.
