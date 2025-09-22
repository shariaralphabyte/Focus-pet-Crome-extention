# 🚀 School Website Deployment Guide

## 📋 Prerequisites

### System Requirements
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Git
- Cloudinary account (for file uploads)

### Development Environment
- Backend: Node.js + Express + MongoDB
- Frontend: React 18 + Redux Toolkit + Tailwind CSS
- File Storage: Cloudinary
- Authentication: JWT

## 🔧 Environment Setup

### Backend Configuration (.env)
```env
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb://localhost:27017/school_website
JWT_SECRET=your_very_long_and_secure_jwt_secret_key_here_make_it_at_least_32_characters_long
JWT_EXPIRE=30d

# Cloudinary Configuration (REQUIRED for file uploads)
CLOUDINARY_CLOUD_NAME=your_actual_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_actual_cloudinary_api_key
CLOUDINARY_API_SECRET=your_actual_cloudinary_api_secret

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Admin Default Credentials
ADMIN_EMAIL=admin@school.edu
ADMIN_PASSWORD=admin123456
ADMIN_NAME=System Administrator

# School Information
SCHOOL_NAME=Your School Name
SCHOOL_ADDRESS=Your School Address
SCHOOL_PHONE=+880-1234-567890
SCHOOL_EMAIL=info@yourschool.edu.bd
SCHOOL_WEBSITE=https://yourschool.edu.bd
```

### Frontend Configuration (.env)
```env
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_APP_NAME=School Management System
GENERATE_SOURCEMAP=false
```

## 🚀 Deployment Steps

### 1. Local Development Setup
```bash
# Clone or navigate to project
cd /path/to/school-website

# Backend setup
cd backend
npm install
npm start

# Frontend setup (new terminal)
cd ../frontend
npm install
npm start
```

### 2. Production Deployment

#### Backend Deployment
```bash
cd backend

# Install dependencies
npm install --production

# Build if needed
npm run build

# Start with PM2 (recommended)
npm install -g pm2
pm2 start server.js --name "school-backend"

# Or start directly
npm start
```

#### Frontend Deployment
```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Serve with nginx or serve
npm install -g serve
serve -s build -l 3000

# Or deploy to Netlify/Vercel
# Upload build folder to hosting service
```

### 3. Database Setup
```bash
# Start MongoDB
mongod

# The application will automatically:
# - Connect to MongoDB
# - Create default admin user
# - Set up required collections
```

## 🔐 Security Configuration

### 1. JWT Secret
- Generate a strong JWT secret (minimum 32 characters)
- Use environment variables, never hardcode

### 2. Cloudinary Setup
1. Create account at https://cloudinary.com
2. Get your Cloud Name, API Key, and API Secret
3. Update .env file with actual credentials

### 3. Admin Credentials
- Change default admin password after first login
- Use strong passwords in production

## 🌐 Production Considerations

### 1. Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name yourschool.edu.bd;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 2. SSL Certificate
```bash
# Using Certbot for Let's Encrypt
sudo certbot --nginx -d yourschool.edu.bd
```

### 3. Environment Variables
- Use production MongoDB URI
- Set NODE_ENV=production
- Configure proper CORS origins
- Set up monitoring and logging

## 📊 Monitoring & Maintenance

### 1. Process Management
```bash
# PM2 commands
pm2 list
pm2 restart school-backend
pm2 logs school-backend
pm2 monit
```

### 2. Database Backup
```bash
# MongoDB backup
mongodump --db school_website --out /backup/$(date +%Y%m%d)

# Restore
mongorestore --db school_website /backup/20231201/school_website
```

### 3. Log Monitoring
- Monitor application logs
- Set up error tracking (Sentry)
- Monitor server resources

## 🎯 Post-Deployment Checklist

### ✅ Functionality Testing
- [ ] Homepage loads with dynamic content
- [ ] Admin login works
- [ ] CRUD operations function
- [ ] File uploads work
- [ ] Language switching works
- [ ] All pages load without errors
- [ ] Mobile responsiveness
- [ ] SEO meta tags

### ✅ Security Testing
- [ ] Admin panel requires authentication
- [ ] File upload restrictions work
- [ ] CORS configured properly
- [ ] Rate limiting active
- [ ] HTTPS enabled (production)

### ✅ Performance Testing
- [ ] Page load times acceptable
- [ ] Database queries optimized
- [ ] Images optimized via Cloudinary
- [ ] Caching configured

## 🔄 Updates & Maintenance

### Regular Tasks
1. **Database Backup**: Weekly automated backups
2. **Security Updates**: Monthly dependency updates
3. **Content Review**: Regular content moderation
4. **Performance Monitoring**: Weekly performance checks

### Update Process
```bash
# Backend updates
cd backend
git pull origin main
npm install
pm2 restart school-backend

# Frontend updates
cd frontend
git pull origin main
npm install
npm run build
# Deploy new build
```

## 🆘 Troubleshooting

### Common Issues
1. **MongoDB Connection**: Check MongoDB service status
2. **File Upload Fails**: Verify Cloudinary credentials
3. **API Errors**: Check backend logs and CORS settings
4. **Build Failures**: Clear node_modules and reinstall

### Support Resources
- Application logs: `pm2 logs`
- Database logs: MongoDB logs
- Frontend errors: Browser console
- Network issues: Check API endpoints

## 📞 Support Information
- **Admin Login**: admin@school.edu / admin123456 (change after first login)
- **Backend Port**: 5001
- **Frontend Port**: 3000
- **Database**: MongoDB on default port 27017

---

**🎉 Your dynamic, bilingual school website is now ready for production!**
