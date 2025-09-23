const axios = require('axios');
require('dotenv').config();

const API_BASE = 'http://localhost:5001/api';

// Admin credentials
const adminCredentials = {
  email: 'admin@school.edu',
  password: 'admin123456'
};

let authToken = '';

const seedViaAPI = async () => {
  try {
    console.log('🔐 Logging in as admin...');
    
    // Login to get auth token
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, adminCredentials);
    authToken = loginResponse.data.token;
    console.log('✅ Admin login successful');

    // Set default headers
    const headers = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };

    // Create sample routines
    console.log('📅 Creating sample routines...');
    const routinesData = [
      {
        title: { en: 'Class 9A Weekly Routine', bn: 'নবম শ্রেণী ক সাপ্তাহিক রুটিন' },
        type: 'Class',
        class: { en: 'Class 9', bn: 'নবম শ্রেণী' },
        section: 'A',
        academicYear: '2024',
        effectiveFrom: new Date('2024-01-01'),
        schedule: [
          {
            day: 'Sunday',
            dayName: { en: 'Sunday', bn: 'রবিবার' },
            periods: [
              {
                periodNumber: 1,
                startTime: '08:00',
                endTime: '08:45',
                subject: { en: 'Mathematics', bn: 'গণিত' },
                room: { en: 'Room 101', bn: 'কক্ষ ১০১' },
                type: 'Regular'
              },
              {
                periodNumber: 2,
                startTime: '08:45',
                endTime: '09:30',
                subject: { en: 'English', bn: 'ইংরেজি' },
                room: { en: 'Room 102', bn: 'কক্ষ ১০২' },
                type: 'Regular'
              },
              {
                periodNumber: 3,
                startTime: '09:30',
                endTime: '09:45',
                subject: { en: 'Break', bn: 'বিরতি' },
                room: { en: '', bn: '' },
                type: 'Break'
              },
              {
                periodNumber: 4,
                startTime: '09:45',
                endTime: '10:30',
                subject: { en: 'Physics', bn: 'পদার্থবিজ্ঞান' },
                room: { en: 'Lab 1', bn: 'ল্যাব ১' },
                type: 'Lab'
              }
            ]
          },
          {
            day: 'Monday',
            dayName: { en: 'Monday', bn: 'সোমবার' },
            periods: [
              {
                periodNumber: 1,
                startTime: '08:00',
                endTime: '08:45',
                subject: { en: 'English', bn: 'ইংরেজি' },
                room: { en: 'Room 102', bn: 'কক্ষ ১০২' },
                type: 'Regular'
              },
              {
                periodNumber: 2,
                startTime: '08:45',
                endTime: '09:30',
                subject: { en: 'Physics', bn: 'পদার্থবিজ্ঞান' },
                room: { en: 'Lab 1', bn: 'ল্যাব ১' },
                type: 'Lab'
              },
              {
                periodNumber: 3,
                startTime: '09:30',
                endTime: '09:45',
                subject: { en: 'Break', bn: 'বিরতি' },
                room: { en: '', bn: '' },
                type: 'Break'
              },
              {
                periodNumber: 4,
                startTime: '09:45',
                endTime: '10:30',
                subject: { en: 'Mathematics', bn: 'গণিত' },
                room: { en: 'Room 101', bn: 'কক্ষ ১০১' },
                type: 'Regular'
              }
            ]
          }
        ],
        isActive: true,
        status: 'published'
      }
    ];

    for (const routine of routinesData) {
      try {
        const response = await axios.post(`${API_BASE}/routines`, routine, { headers });
        console.log(`✅ Created routine: ${routine.title.en}`);
      } catch (error) {
        console.log(`❌ Failed to create routine: ${error.response?.data?.message || error.message}`);
        if (error.response?.data?.errors) {
          console.log('Validation errors:', JSON.stringify(error.response.data.errors, null, 2));
        }
      }
    }

    // Create sample syllabus
    console.log('📚 Creating sample syllabus...');
    const syllabusData = [
      {
        title: { en: 'Mathematics Syllabus - Class 9', bn: 'গণিত পাঠ্যক্রম - নবম শ্রেণী' },
        subject: { en: 'Mathematics', bn: 'গণিত' },
        class: { en: 'Class 9', bn: 'নবম শ্রেণী' },
        academicYear: '2024',
        description: { 
          en: 'Complete mathematics curriculum for Class 9 students covering algebra, geometry, and statistics.',
          bn: 'নবম শ্রেণীর শিক্ষার্থীদের জন্য বীজগণিত, জ্যামিতি এবং পরিসংখ্যান সহ সম্পূর্ণ গণিত পাঠ্যক্রম।'
        },
        chapters: [
          {
            title: { en: 'Number Systems', bn: 'সংখ্যা পদ্ধতি' },
            description: { en: 'Real numbers, rational and irrational numbers', bn: 'বাস্তব সংখ্যা, মূলদ ও অমূলদ সংখ্যা' },
            duration: '2 weeks',
            topics: [
              { en: 'Real Numbers', bn: 'বাস্তব সংখ্যা' },
              { en: 'Rational Numbers', bn: 'মূলদ সংখ্যা' },
              { en: 'Irrational Numbers', bn: 'অমূলদ সংখ্যা' }
            ]
          },
          {
            title: { en: 'Polynomials', bn: 'বহুপদী' },
            description: { en: 'Introduction to polynomials and their operations', bn: 'বহুপদী এবং তাদের ক্রিয়াকলাপের পরিচয়' },
            duration: '3 weeks',
            topics: [
              { en: 'Definition of Polynomials', bn: 'বহুপদীর সংজ্ঞা' },
              { en: 'Addition and Subtraction', bn: 'যোগ ও বিয়োগ' },
              { en: 'Multiplication', bn: 'গুণ' }
            ]
          }
        ],
        assessmentMethods: [
          { en: 'Class Tests', bn: 'শ্রেণী পরীক্ষা' },
          { en: 'Assignments', bn: 'অ্যাসাইনমেন্ট' },
          { en: 'Final Examination', bn: 'চূড়ান্ত পরীক্ষা' }
        ],
        textbooks: [
          { title: 'NCTB Mathematics Book - Class 9', author: 'NCTB', isbn: '978-984-123-456-7' }
        ],
        isActive: true
      },
      {
        title: { en: 'English Syllabus - Class 9', bn: 'ইংরেজি পাঠ্যক্রম - নবম শ্রেণী' },
        subject: { en: 'English', bn: 'ইংরেজি' },
        class: { en: 'Class 9', bn: 'নবম শ্রেণী' },
        academicYear: '2024',
        description: { 
          en: 'English language and literature curriculum focusing on reading, writing, and communication skills.',
          bn: 'পড়া, লেখা এবং যোগাযোগ দক্ষতার উপর দৃষ্টি নিবদ্ধ করে ইংরেজি ভাষা ও সাহিত্যের পাঠ্যক্রম।'
        },
        chapters: [
          {
            title: { en: 'Reading Comprehension', bn: 'পাঠ বোধগম্যতা' },
            description: { en: 'Developing reading and comprehension skills', bn: 'পড়া এবং বোঝার দক্ষতা বিকাশ' },
            duration: '4 weeks',
            topics: [
              { en: 'Short Stories', bn: 'ছোট গল্প' },
              { en: 'Poems', bn: 'কবিতা' },
              { en: 'Essays', bn: 'প্রবন্ধ' }
            ]
          }
        ],
        assessmentMethods: [
          { en: 'Reading Tests', bn: 'পড়া পরীক্ষা' },
          { en: 'Writing Assignments', bn: 'লেখার অ্যাসাইনমেন্ট' },
          { en: 'Oral Presentation', bn: 'মৌখিক উপস্থাপনা' }
        ],
        textbooks: [
          { title: 'English For Today - Class 9', author: 'NCTB', isbn: '978-984-123-789-0' }
        ],
        isActive: true
      }
    ];

    for (const syllabus of syllabusData) {
      try {
        const response = await axios.post(`${API_BASE}/syllabus`, syllabus, { headers });
        console.log(`✅ Created syllabus: ${syllabus.title.en}`);
      } catch (error) {
        console.log(`❌ Failed to create syllabus: ${error.response?.data?.message || error.message}`);
      }
    }

    // Create sample results
    console.log('📊 Creating sample results...');
    const resultsData = [
      {
        title: { en: 'First Term Examination - Class 9A', bn: 'প্রথম সাময়িক পরীক্ষা - নবম শ্রেণী ক' },
        examName: { en: 'First Term Examination', bn: 'প্রথম সাময়িক পরীক্ষা' },
        examType: 'First Term',
        class: { en: 'Class 9', bn: 'নবম শ্রেণী' },
        section: 'A',
        academicYear: '2024',
        examDate: new Date('2024-03-15'),
        publishDate: new Date('2024-03-25'),
        results: [
          {
            student: '68d248a6e3059340d60f0546', // Ahmed Ali's ObjectId
            rollNumber: 1,
            subjects: [
              { 
                subject: { en: 'Mathematics', bn: 'গণিত' },
                fullMarks: 100,
                passMarks: 40,
                obtainedMarks: 85, 
                grade: 'A+', 
                gpa: 5.0 
              },
              { 
                subject: { en: 'English', bn: 'ইংরেজি' },
                fullMarks: 100,
                passMarks: 40,
                obtainedMarks: 78, 
                grade: 'A', 
                gpa: 4.0 
              },
              { 
                subject: { en: 'Physics', bn: 'পদার্থবিজ্ঞান' },
                fullMarks: 100,
                passMarks: 40,
                obtainedMarks: 82, 
                grade: 'A+', 
                gpa: 5.0 
              }
            ],
            totalMarks: 300,
            obtainedMarks: 245,
            percentage: 81.67,
            grade: 'A+',
            gpa: 4.67,
            position: 1,
            remarks: { en: 'Excellent performance', bn: 'চমৎকার পারফরম্যান্স' }
          },
          {
            student: '68d248a6e3059340d60f054c', // Fatima Rahman's ObjectId
            rollNumber: 2,
            subjects: [
              { 
                subject: { en: 'Mathematics', bn: 'গণিত' },
                fullMarks: 100,
                passMarks: 40,
                obtainedMarks: 75, 
                grade: 'A', 
                gpa: 4.0 
              },
              { 
                subject: { en: 'English', bn: 'ইংরেজি' },
                fullMarks: 100,
                passMarks: 40,
                obtainedMarks: 88, 
                grade: 'A+', 
                gpa: 5.0 
              },
              { 
                subject: { en: 'Physics', bn: 'পদার্থবিজ্ঞান' },
                fullMarks: 100,
                passMarks: 40,
                obtainedMarks: 70, 
                grade: 'A-', 
                gpa: 3.5 
              }
            ],
            totalMarks: 300,
            obtainedMarks: 233,
            percentage: 77.67,
            grade: 'A',
            gpa: 4.17,
            position: 2,
            remarks: { en: 'Very good performance', bn: 'খুব ভাল পারফরম্যান্স' }
          }
        ],
        statistics: {
          totalStudents: 2,
          passedStudents: 2,
          failedStudents: 0,
          highestMarks: 245,
          lowestMarks: 233,
          averageMarks: 239,
          passPercentage: 100
        },
        isPublished: true
      }
    ];

    for (const result of resultsData) {
      try {
        const response = await axios.post(`${API_BASE}/results`, result, { headers });
        console.log(`✅ Created result: ${result.title.en}`);
      } catch (error) {
        console.log(`❌ Failed to create result: ${error.response?.data?.message || error.message}`);
        if (error.response?.data?.errors) {
          console.log('Validation errors:', JSON.stringify(error.response.data.errors, null, 2));
        }
      }
    }

    console.log('🎉 Sample data creation completed!');
    console.log('📊 Summary:');
    console.log(`   - Routines: ${routinesData.length}`);
    console.log(`   - Syllabus: ${syllabusData.length}`);
    console.log(`   - Results: ${resultsData.length}`);

  } catch (error) {
    console.error('❌ Error creating sample data:', error.response?.data || error.message);
  }
};

seedViaAPI();
