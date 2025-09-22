# System Testing Guide

## ✅ Current Status
- **Backend Server**: Running on http://localhost:5001
- **Frontend Server**: Running on http://localhost:3000
- **Database**: MongoDB connected
- **Admin Account**: admin@school.edu / admin123456

## 🧪 Testing Steps

### 1. Frontend Access
- Open http://localhost:3000
- Verify homepage loads without errors
- Check language switching (Bengali/English)
- Navigate to different pages

### 2. Admin Dashboard Access
- Click "Login" or go to http://localhost:3000/login
- Login with: admin@school.edu / admin123456
- Access admin dashboard
- Test new tabs: Committee, Institution

### 3. Dynamic Content Testing
- **Homepage**: Check if statistics load dynamically
- **About Page**: Verify institution data displays
- **Management Committee**: Test member profiles
- **Notices**: Check notice listing and pagination

### 4. Admin Features Testing
- **Management Committee Manager**: 
  - Add new committee member
  - Upload member photo
  - Edit existing member
  - Test bilingual input

- **Institution Settings Manager**:
  - Update basic information
  - Modify vision/mission
  - Update statistics
  - Test different tabs

### 5. API Endpoints (when rate limit clears)
```bash
# Test health endpoint
curl http://localhost:5001/api/health

# Test notices endpoint
curl http://localhost:5001/api/notices

# Test management committee endpoint
curl http://localhost:5001/api/management-committee

# Test institution settings
curl http://localhost:5001/api/institution/settings
```

## 🎯 Expected Results
- All pages load without runtime errors
- Dynamic content displays properly
- Admin dashboard functions correctly
- Bilingual switching works seamlessly
- File uploads work (with proper Cloudinary config)

## 🔧 Troubleshooting
- If API calls fail, check backend console for errors
- If images don't upload, verify Cloudinary credentials in .env
- If database errors occur, ensure MongoDB is running
- Clear browser cache if seeing old static content

## 📋 Features Implemented
✅ Dynamic content management
✅ Bilingual support (Bengali/English)
✅ Admin dashboard with CRUD operations
✅ File upload system
✅ Management committee management
✅ Institution settings management
✅ Notice system with PDF attachments
✅ Real-time statistics calculation
✅ Responsive design
✅ Error handling and null safety
