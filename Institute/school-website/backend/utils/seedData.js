const mongoose = require('mongoose');
const Routine = require('../models/Routine');
const Syllabus = require('../models/Syllabus');
const Result = require('../models/Result');
const Class = require('../models/Class');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const User = require('../models/User');

const seedData = async () => {
  try {
    console.log('🌱 Starting data seeding...');

    // Get admin user for created by field
    const adminUser = await User.findOne({ email: 'admin@school.edu' });
    if (!adminUser) {
      console.error('Admin user not found. Please create admin user first.');
      return;
    }

    // Create sample teacher users and teachers
    const teacherUsersData = [
      {
        name: 'Dr. Rahman Ahmed',
        email: 'rahman@school.edu',
        password: 'teacher123',
        role: 'teacher',
        isActive: true
      },
      {
        name: 'Ms. Fatima Khatun',
        email: 'fatima@school.edu',
        password: 'teacher123',
        role: 'teacher',
        isActive: true
      },
      {
        name: 'Mr. Karim Hassan',
        email: 'karim@school.edu',
        password: 'teacher123',
        role: 'teacher',
        isActive: true
      }
    ];

    const teacherUsers = [];
    for (const userData of teacherUsersData) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = new User(userData);
        await user.save();
        console.log(`✅ Created teacher user: ${user.name}`);
      }
      teacherUsers.push(user);
    }

    const teachersData = [
      {
        user: teacherUsers[0]._id,
        teacherId: 'TCH240001',
        designation: { en: 'Professor', bn: 'অধ্যাপক' },
        department: 'Mathematics',
        subjects: ['Mathematics', 'Statistics'],
        joiningDate: new Date('2020-01-15'),
        qualifications: [{
          degree: 'PhD in Mathematics',
          institution: 'University of Dhaka',
          year: 2015,
          result: 'First Class'
        }],
        experience: { totalYears: 15 }
      },
      {
        user: teacherUsers[1]._id,
        teacherId: 'TCH240002',
        designation: { en: 'Assistant Professor', bn: 'সহকারী অধ্যাপক' },
        department: 'English',
        subjects: ['English', 'Literature'],
        joiningDate: new Date('2021-03-10'),
        qualifications: [{
          degree: 'MA in English Literature',
          institution: 'Dhaka University',
          year: 2018,
          result: 'First Class'
        }],
        experience: { totalYears: 8 }
      },
      {
        user: teacherUsers[2]._id,
        teacherId: 'TCH240003',
        designation: { en: 'Lecturer', bn: 'প্রভাষক' },
        department: 'Physics',
        subjects: ['Physics', 'Chemistry'],
        joiningDate: new Date('2022-06-01'),
        qualifications: [{
          degree: 'MSc in Physics',
          institution: 'Bangladesh University of Engineering and Technology',
          year: 2020,
          result: 'First Class'
        }],
        experience: { totalYears: 5 }
      }
    ];

    const teachers = [];
    for (let i = 0; i < teachersData.length; i++) {
      const teacherData = teachersData[i];
      let teacher = await Teacher.findOne({ user: teacherData.user });
      if (!teacher) {
        teacher = new Teacher(teacherData);
        await teacher.save();
        console.log(`✅ Created teacher: ${teacherUsers[i].name}`);
      }
      teachers.push(teacher);
    }

    // Create sample classes if they don't exist
    const classesData = [
      {
        name: { en: 'Class 9', bn: 'নবম শ্রেণী' },
        level: 'Secondary',
        grade: '9',
        sections: [
          { name: 'A', capacity: 40, classTeacher: teachers[0]._id },
          { name: 'B', capacity: 40, classTeacher: teachers[1]._id }
        ],
        subjects: [
          { name: { en: 'Mathematics', bn: 'গণিত' }, code: 'MATH-9', teacher: teachers[0]._id },
          { name: { en: 'English', bn: 'ইংরেজি' }, code: 'ENG-9', teacher: teachers[1]._id },
          { name: { en: 'Physics', bn: 'পদার্থবিজ্ঞান' }, code: 'PHY-9', teacher: teachers[2]._id }
        ],
        createdBy: adminUser._id
      },
      {
        name: { en: 'Class 10', bn: 'দশম শ্রেণী' },
        level: 'Secondary',
        grade: '10',
        sections: [
          { name: 'A', capacity: 35, classTeacher: teachers[1]._id },
          { name: 'B', capacity: 35, classTeacher: teachers[2]._id }
        ],
        subjects: [
          { name: { en: 'Mathematics', bn: 'গণিত' }, code: 'MATH-10', teacher: teachers[0]._id },
          { name: { en: 'English', bn: 'ইংরেজি' }, code: 'ENG-10', teacher: teachers[1]._id },
          { name: { en: 'Physics', bn: 'পদার্থবিজ্ঞান' }, code: 'PHY-10', teacher: teachers[2]._id }
        ],
        createdBy: adminUser._id
      }
    ];

    const classes = [];
    for (const classData of classesData) {
      let classDoc = await Class.findOne({ 'name.en': classData.name.en, grade: classData.grade });
      if (!classDoc) {
        classDoc = new Class(classData);
        await classDoc.save();
        console.log(`✅ Created class: ${classDoc.name.en}`);
      }
      classes.push(classDoc);
    }

    // Create sample student users and students
    const studentUsersData = [
      {
        name: 'Ahmed Ali',
        email: 'ahmed@student.edu',
        password: 'student123',
        role: 'student',
        isActive: true
      },
      {
        name: 'Fatima Rahman',
        email: 'fatima.student@school.edu',
        password: 'student123',
        role: 'student',
        isActive: true
      }
    ];

    const studentUsers = [];
    for (const userData of studentUsersData) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = new User(userData);
        await user.save();
        console.log(`✅ Created student user: ${user.name}`);
      }
      studentUsers.push(user);
    }

    const studentsData = [
      {
        user: studentUsers[0]._id,
        studentId: 'STU240001',
        name: { en: 'Ahmed Ali', bn: 'আহমেদ আলী' },
        class: { en: 'Class 9', bn: 'নবম শ্রেণী' },
        section: 'A',
        session: '2024',
        rollNumber: 1,
        admissionDate: new Date('2024-01-15'),
        guardianInfo: {
          name: { en: 'Ali Ahmed', bn: 'আলী আহমেদ' },
          phone: '+880-1711-111110',
          relation: { en: 'Father', bn: 'পিতা' }
        },
        personalInfo: {
          dateOfBirth: new Date('2008-05-15'),
          gender: 'Male',
          bloodGroup: 'O+'
        }
      },
      {
        user: studentUsers[1]._id,
        studentId: 'STU240002',
        name: { en: 'Fatima Rahman', bn: 'ফাতিমা রহমান' },
        class: { en: 'Class 9', bn: 'নবম শ্রেণী' },
        section: 'A',
        session: '2024',
        rollNumber: 2,
        admissionDate: new Date('2024-01-15'),
        guardianInfo: {
          name: { en: 'Rahman Ali', bn: 'রহমান আলী' },
          phone: '+880-1711-222220',
          relation: { en: 'Father', bn: 'পিতা' }
        },
        personalInfo: {
          dateOfBirth: new Date('2008-08-20'),
          gender: 'Female',
          bloodGroup: 'A+'
        }
      }
    ];

    const students = [];
    for (let i = 0; i < studentsData.length; i++) {
      const studentData = studentsData[i];
      let student = await Student.findOne({ user: studentData.user });
      if (!student) {
        student = new Student(studentData);
        await student.save();
        console.log(`✅ Created student: ${studentUsers[i].name}`);
      }
      students.push(student);
    }

    // Create sample routines
    const routinesData = [
      {
        title: { en: 'Class 9A Weekly Routine', bn: 'নবম শ্রেণী ক সাপ্তাহিক রুটিন' },
        type: 'Class',
        class: classes[0]._id,
        section: 'A',
        academicYear: '2024',
        schedule: [
          {
            day: 'Sunday',
            periods: [
              { time: '08:00-08:45', subject: 'Mathematics', teacher: teachers[0]._id, room: 'Room 101' },
              { time: '08:45-09:30', subject: 'English', teacher: teachers[1]._id, room: 'Room 102' },
              { time: '09:30-09:45', subject: 'Break', teacher: null, room: null },
              { time: '09:45-10:30', subject: 'Physics', teacher: teachers[2]._id, room: 'Lab 1' },
              { time: '10:30-11:15', subject: 'Mathematics', teacher: teachers[0]._id, room: 'Room 101' }
            ]
          },
          {
            day: 'Monday',
            periods: [
              { time: '08:00-08:45', subject: 'English', teacher: teachers[1]._id, room: 'Room 102' },
              { time: '08:45-09:30', subject: 'Physics', teacher: teachers[2]._id, room: 'Lab 1' },
              { time: '09:30-09:45', subject: 'Break', teacher: null, room: null },
              { time: '09:45-10:30', subject: 'Mathematics', teacher: teachers[0]._id, room: 'Room 101' },
              { time: '10:30-11:15', subject: 'English', teacher: teachers[1]._id, room: 'Room 102' }
            ]
          },
          {
            day: 'Tuesday',
            periods: [
              { time: '08:00-08:45', subject: 'Physics', teacher: teachers[2]._id, room: 'Lab 1' },
              { time: '08:45-09:30', subject: 'Mathematics', teacher: teachers[0]._id, room: 'Room 101' },
              { time: '09:30-09:45', subject: 'Break', teacher: null, room: null },
              { time: '09:45-10:30', subject: 'English', teacher: teachers[1]._id, room: 'Room 102' },
              { time: '10:30-11:15', subject: 'Physics', teacher: teachers[2]._id, room: 'Lab 1' }
            ]
          }
        ],
        isActive: true,
        createdBy: adminUser._id
      },
      {
        title: { en: 'Class 10A Weekly Routine', bn: 'দশম শ্রেণী ক সাপ্তাহিক রুটিন' },
        type: 'Class',
        class: classes[1]._id,
        section: 'A',
        academicYear: '2024',
        schedule: [
          {
            day: 'Sunday',
            periods: [
              { time: '08:00-08:45', subject: 'Physics', teacher: teachers[2]._id, room: 'Lab 2' },
              { time: '08:45-09:30', subject: 'Mathematics', teacher: teachers[0]._id, room: 'Room 201' },
              { time: '09:30-09:45', subject: 'Break', teacher: null, room: null },
              { time: '09:45-10:30', subject: 'English', teacher: teachers[1]._id, room: 'Room 202' },
              { time: '10:30-11:15', subject: 'Physics', teacher: teachers[2]._id, room: 'Lab 2' }
            ]
          }
        ],
        isActive: true,
        createdBy: adminUser._id
      }
    ];

    for (const routineData of routinesData) {
      const existingRoutine = await Routine.findOne({ 
        'title.en': routineData.title.en,
        class: routineData.class,
        section: routineData.section
      });
      if (!existingRoutine) {
        const routine = new Routine(routineData);
        await routine.save();
        console.log(`✅ Created routine: ${routine.title.en}`);
      }
    }

    // Create sample syllabus
    const syllabusData = [
      {
        title: { en: 'Mathematics Syllabus - Class 9', bn: 'গণিত পাঠ্যক্রম - নবম শ্রেণী' },
        subject: { en: 'Mathematics', bn: 'গণিত' },
        class: classes[0]._id,
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
        isActive: true,
        createdBy: adminUser._id
      },
      {
        title: { en: 'English Syllabus - Class 9', bn: 'ইংরেজি পাঠ্যক্রম - নবম শ্রেণী' },
        subject: { en: 'English', bn: 'ইংরেজি' },
        class: classes[0]._id,
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
        isActive: true,
        createdBy: adminUser._id
      }
    ];

    for (const syllabusItem of syllabusData) {
      const existingSyllabus = await Syllabus.findOne({ 
        'title.en': syllabusItem.title.en,
        class: syllabusItem.class
      });
      if (!existingSyllabus) {
        const syllabus = new Syllabus(syllabusItem);
        await syllabus.save();
        console.log(`✅ Created syllabus: ${syllabus.title.en}`);
      }
    }

    // Create sample results
    const resultsData = [
      {
        title: { en: 'First Term Examination - Class 9A', bn: 'প্রথম সাময়িক পরীক্ষা - নবম শ্রেণী ক' },
        examType: 'Term',
        class: classes[0]._id,
        section: 'A',
        academicYear: '2024',
        examDate: new Date('2024-03-15'),
        publishDate: new Date('2024-03-25'),
        results: [
          {
            student: students[0]._id,
            subjects: [
              { name: 'Mathematics', fullMarks: 100, obtainedMarks: 85, grade: 'A+', gpa: 5.0 },
              { name: 'English', fullMarks: 100, obtainedMarks: 78, grade: 'A', gpa: 4.0 },
              { name: 'Physics', fullMarks: 100, obtainedMarks: 82, grade: 'A+', gpa: 5.0 }
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
            student: students[1]._id,
            subjects: [
              { name: 'Mathematics', fullMarks: 100, obtainedMarks: 75, grade: 'A', gpa: 4.0 },
              { name: 'English', fullMarks: 100, obtainedMarks: 88, grade: 'A+', gpa: 5.0 },
              { name: 'Physics', fullMarks: 100, obtainedMarks: 70, grade: 'A-', gpa: 3.5 }
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
        isPublished: true,
        createdBy: adminUser._id
      }
    ];

    for (const resultData of resultsData) {
      const existingResult = await Result.findOne({ 
        'title.en': resultData.title.en,
        class: resultData.class,
        section: resultData.section
      });
      if (!existingResult) {
        const result = new Result(resultData);
        await result.save();
        console.log(`✅ Created result: ${result.title.en}`);
      }
    }

    console.log('🎉 Data seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Teachers: ${teachers.length}`);
    console.log(`   - Classes: ${classes.length}`);
    console.log(`   - Students: ${students.length}`);
    console.log(`   - Routines: ${routinesData.length}`);
    console.log(`   - Syllabus: ${syllabusData.length}`);
    console.log(`   - Results: ${resultsData.length}`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
};

module.exports = seedData;
