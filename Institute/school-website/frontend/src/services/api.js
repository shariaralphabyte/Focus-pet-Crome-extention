import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Classes API
export const classAPI = {
  getAll: (params) => api.get('/classes', { params }),
  getById: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post('/classes', data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`),
  getActive: () => api.get('/classes/active'),
  getByLevel: (level) => api.get(`/classes/level/${level}`),
};

// Results API
export const resultAPI = {
  getAll: (params) => api.get('/results', { params }),
  getById: (id) => api.get(`/results/${id}`),
  create: (data) => api.post('/results', data),
  update: (id, data) => api.put(`/results/${id}`, data),
  delete: (id) => api.delete(`/results/${id}`),
  getByStudent: (studentId) => api.get(`/results/student/${studentId}`),
  getByClass: (classId) => api.get(`/results/class/${classId}`),
};

// Routines API
export const routineAPI = {
  getAll: (params) => api.get('/routines', { params }),
  getById: (id) => api.get(`/routines/${id}`),
  create: (data) => api.post('/routines', data),
  update: (id, data) => api.put(`/routines/${id}`, data),
  delete: (id) => api.delete(`/routines/${id}`),
  getByClass: (classId) => api.get(`/routines/class/${classId}`),
  getByTeacher: (teacherId) => api.get(`/routines/teacher/${teacherId}`),
};

// Syllabus API
export const syllabusAPI = {
  getAll: (params) => api.get('/syllabus', { params }),
  getById: (id) => api.get(`/syllabus/${id}`),
  create: (data) => api.post('/syllabus', data),
  update: (id, data) => api.put(`/syllabus/${id}`, data),
  delete: (id) => api.delete(`/syllabus/${id}`),
  getByClass: (classId) => api.get(`/syllabus/class/${classId}`),
  getBySubject: (subjectId) => api.get(`/syllabus/subject/${subjectId}`),
};

// Events API
export const eventAPI = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  getUpcoming: () => api.get('/events/upcoming'),
  getFeatured: () => api.get('/events/featured'),
};

// Notices API
export const noticeAPI = {
  getAll: (params) => api.get('/notices', { params }),
  getById: (id) => api.get(`/notices/${id}`),
  create: (data) => api.post('/notices', data),
  update: (id, data) => api.put(`/notices/${id}`, data),
  delete: (id) => api.delete(`/notices/${id}`),
  getRecent: (limit = 5) => api.get(`/notices/recent?limit=${limit}`),
  getImportant: () => api.get('/notices/important'),
};

// Gallery API
export const galleryAPI = {
  getAll: (params) => api.get('/gallery', { params }),
  getById: (id) => api.get(`/gallery/${id}`),
  create: (data) => api.post('/gallery', data),
  update: (id, data) => api.put(`/gallery/${id}`, data),
  delete: (id) => api.delete(`/gallery/${id}`),
  getByCategory: (category) => api.get(`/gallery/category/${category}`),
};

// Content API
export const contentAPI = {
  getAll: (params) => api.get('/content', { params }),
  getById: (id) => api.get(`/content/${id}`),
  create: (data) => api.post('/content', data),
  update: (id, data) => api.put(`/content/${id}`, data),
  delete: (id) => api.delete(`/content/${id}`),
  getByType: (type) => api.get(`/content/type/${type}`),
  getHeroSlides: () => api.get('/content/hero-slides'),
};

// Institution API
export const institutionAPI = {
  getSettings: () => api.get('/institution/settings'),
  updateSettings: (data) => api.put('/institution/settings', data),
  getStatistics: () => api.get('/institution/statistics'),
  updateStatistics: (data) => api.put('/institution/statistics', data),
};

// Management Committee API
export const committeeAPI = {
  getAll: (params) => api.get('/management-committee', { params }),
  getById: (id) => api.get(`/management-committee/${id}`),
  create: (data) => api.post('/management-committee', data),
  update: (id, data) => api.put(`/management-committee/${id}`, data),
  delete: (id) => api.delete(`/management-committee/${id}`),
  getActive: () => api.get('/management-committee/active'),
};

// Teachers API
export const teacherAPI = {
  getAll: (params) => api.get('/teachers', { params }),
  getById: (id) => api.get(`/teachers/${id}`),
  create: (data) => api.post('/teachers', data),
  update: (id, data) => api.put(`/teachers/${id}`, data),
  delete: (id) => api.delete(`/teachers/${id}`),
  getActive: () => api.get('/teachers/active'),
};

// Students API
export const studentAPI = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  getByClass: (classId) => api.get(`/students/class/${classId}`),
};

// File upload API
export const uploadAPI = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadDocument: (file) => {
    const formData = new FormData();
    formData.append('document', file);
    return api.post('/upload/document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;
