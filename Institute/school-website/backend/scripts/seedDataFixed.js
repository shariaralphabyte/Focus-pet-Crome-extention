const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Content = require('../models/Content');
const Event = require('../models/Event');
const Gallery = require('../models/Gallery');
const Notice = require('../models/Notice');
const InstitutionSettings = require('../models/InstitutionSettings');
const ManagementCommittee = require('../models/ManagementCommittee');
const Teacher = require('../models/Teacher');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school_website');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Content.deleteMany({});
    await Event.deleteMany({});
    await Gallery.deleteMany({});
    await Notice.deleteMany({});
    await InstitutionSettings.deleteMany({});
    await ManagementCommittee.deleteMany({});
    await Teacher.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // 1. Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@school.edu',
      password: 'admin123456', // Let the model hash it
      role: 'admin',
      isActive: true
    });
    console.log('👤 Created admin user:', adminUser.email);

    // 2. Create Institution Settings (with all required fields)
    const institutionSettings = await InstitutionSettings.create({
      institutionName: {
        en: 'Greenwood High School',
        bn: 'গ্রিনউড উচ্চ বিদ্যালয়'
      },
      establishmentYear: 1985,
      founder: {
        en: 'Professor Dr. Abdul Karim',
        bn: 'প্রফেসর ড. আব্দুল করিম'
      },
      location: {
        en: 'Dhaka, Bangladesh',
        bn: 'ঢাকা, বাংলাদেশ'
      },
      vision: {
        en: 'To be a leading educational institution in the country, playing a pioneering role in education and creating skilled human resources through world-class education.',
        bn: 'একটি আদর্শ শিক্ষা প্রতিষ্ঠান হিসেবে দেশের শিক্ষা ক্ষেত্রে অগ্রণী ভূমিকা পালন করা এবং বিশ্বমানের শিক্ষা প্রদানের মাধ্যমে দক্ষ জনশক্তি তৈরি করা।'
      },
      mission: {
        en: 'To prepare the next generation for the service of country and nation through quality education, moral development, creativity enhancement and holistic development of students.',
        bn: 'মানসম্পন্ন শিক্ষা প্রদান, নৈতিক মূল্যবোধ গঠন, সৃজনশীলতা বিকাশ এবং শিক্ষার্থীদের সর্বাঙ্গীণ উন্নয়নের মাধ্যমে আগামী প্রজন্মকে দেশ ও জাতির সেবায় প্রস্তুত করা।'
      },
      about: {
        en: 'A leading educational institution committed to excellence in education and character development. We provide quality education with modern facilities and experienced teachers.',
        bn: 'শিক্ষায় উৎকর্ষতা ও চরিত্র গঠনে প্রতিশ্রুতিবদ্ধ একটি অগ্রণী শিক্ষা প্রতিষ্ঠান। আমরা আধুনিক সুবিধা ও অভিজ্ঞ শিক্ষকদের মাধ্যমে মানসম্পন্ন শিক্ষা প্রদান করি।'
      },
      contactInfo: {
        address: {
          en: '123 Education Street, Dhaka-1000, Bangladesh',
          bn: '১২৩ শিক্ষা সড়ক, ঢাকা-১০০০, বাংলাদেশ'
        },
        phone: ['+880-2-123456789', '+880-2-987654321'],
        email: ['info@greenwoodhigh.edu.bd', 'admin@greenwoodhigh.edu.bd'],
        website: 'www.greenwoodhigh.edu.bd'
      },
      academicInfo: {
        totalClasses: 12,
        totalSections: 48,
        academicYear: '2024-2025',
        sessionStart: new Date('2024-01-01'),
        sessionEnd: new Date('2024-12-31')
      },
      statistics: {
        totalStudents: 2450,
        totalTeachers: 145,
        totalStaff: 45,
        totalAlumni: 5000,
        successRate: 95.5,
        parentRating: 4.8,
        totalBooks: 15000
      }
    });
    console.log('🏫 Created institution settings');

    // 3. Create Hero Slides Content
    const heroSlides = [
      {
        key: 'hero-slide-1',
        type: 'hero-slide',
        title: {
          en: 'Excellence in Education',
          bn: 'শিক্ষায় উৎকর্ষতা'
        },
        content: {
          en: 'Nurturing minds, building futures with world-class education and modern facilities.',
          bn: 'বিশ্বমানের শিক্ষা ও আধুনিক সুবিধা দিয়ে মন গড়ি, ভবিষ্যৎ গড়ি।'
        },
        excerpt: {
          en: 'Nurturing minds, building futures',
          bn: 'মন গড়ি, ভবিষ্যৎ গড়ি'
        },
        author: adminUser._id,
        settings: {
          isPublished: true,
          isVisible: true,
          order: 1
        }
      },
      {
        key: 'hero-slide-2',
        type: 'hero-slide',
        title: {
          en: 'Modern Learning Environment',
          bn: 'আধুনিক শিক্ষা পরিবেশ'
        },
        content: {
          en: 'State-of-the-art facilities and innovative teaching methods for holistic development.',
          bn: 'সর্বাঙ্গীণ উন্নয়নের জন্য অত্যাধুনিক সুবিধা ও উদ্ভাবনী শিক্ষা পদ্ধতি।'
        },
        excerpt: {
          en: 'State-of-the-art facilities for holistic development',
          bn: 'সর্বাঙ্গীণ উন্নয়নের জন্য অত্যাধুনিক সুবিধা'
        },
        author: adminUser._id,
        settings: {
          isPublished: true,
          isVisible: true,
          order: 2
        }
      }
    ];

    await Content.insertMany(heroSlides);
    console.log('🖼️  Created hero slides');

    // 4. Create Vision & Mission Content
    const visionMissionContent = [
      {
        key: 'vision',
        type: 'vision-mission',
        title: {
          en: 'Our Vision',
          bn: 'আমাদের দৃষ্টিভঙ্গি'
        },
        content: {
          en: 'To be a leading educational institution in the country, playing a pioneering role in education and creating skilled human resources through world-class education.',
          bn: 'একটি আদর্শ শিক্ষা প্রতিষ্ঠান হিসেবে দেশের শিক্ষা ক্ষেত্রে অগ্রণী ভূমিকা পালন করা এবং বিশ্বমানের শিক্ষা প্রদানের মাধ্যমে দক্ষ জনশক্তি তৈরি করা।'
        },
        author: adminUser._id,
        settings: {
          isPublished: true,
          isVisible: true,
          order: 0
        }
      },
      {
        key: 'mission',
        type: 'vision-mission',
        title: {
          en: 'Our Mission',
          bn: 'আমাদের লক্ষ্য'
        },
        content: {
          en: 'To prepare the next generation for the service of country and nation through quality education, moral development, creativity enhancement and holistic development of students.',
          bn: 'মানসম্পন্ন শিক্ষা প্রদান, নৈতিক মূল্যবোধ গঠন, সৃজনশীলতা বিকাশ এবং শিক্ষার্থীদের সর্বাঙ্গীণ উন্নয়নের মাধ্যমে আগামী প্রজন্মকে দেশ ও জাতির সেবায় প্রস্তুত করা।'
        },
        author: adminUser._id,
        settings: {
          isPublished: true,
          isVisible: true,
          order: 0
        }
      }
    ];

    await Content.insertMany(visionMissionContent);
    console.log('🎯 Created vision & mission');

    // 5. Create Events
    const events = [
      {
        title: {
          en: 'Annual Science Fair 2024',
          bn: 'বার্ষিক বিজ্ঞান মেলা ২০২৪'
        },
        slug: 'annual-science-fair-2024',
        content: {
          en: 'Join us for our annual science fair where students showcase their innovative projects and scientific discoveries. This year\'s theme is "Science for Sustainable Future".',
          bn: 'আমাদের বার্ষিক বিজ্ঞান মেলায় যোগ দিন যেখানে শিক্ষার্থীরা তাদের উদ্ভাবনী প্রকল্প ও বৈজ্ঞানিক আবিষ্কার প্রদর্শন করবে। এ বছরের প্রতিপাদ্য "টেকসই ভবিষ্যতের জন্য বিজ্ঞান"।'
        },
        excerpt: {
          en: 'Students showcase innovative projects and scientific discoveries',
          bn: 'শিক্ষার্থীরা উদ্ভাবনী প্রকল্প ও বৈজ্ঞানিক আবিষ্কার প্রদর্শন করবে'
        },
        category: 'Science',
        eventDetails: {
          eventDate: new Date('2024-03-15'),
          venue: {
            en: 'School Auditorium',
            bn: 'স্কুল অডিটোরিয়াম'
          }
        },
        featured: true,
        status: 'published',
        tags: [
          { en: 'science', bn: 'বিজ্ঞান' },
          { en: 'fair', bn: 'মেলা' }
        ],
        author: adminUser._id
      },
      {
        title: {
          en: 'Inter-School Sports Competition',
          bn: 'আন্তঃস্কুল ক্রীড়া প্রতিযোগিতা'
        },
        slug: 'inter-school-sports-competition',
        content: {
          en: 'Annual inter-school sports competition featuring various games including football, cricket, basketball, and athletics.',
          bn: 'ফুটবল, ক্রিকেট, বাস্কেটবল ও অ্যাথলেটিক্স সহ বিভিন্ন খেলার বার্ষিক আন্তঃস্কুল ক্রীড়া প্রতিযোগিতা।'
        },
        excerpt: {
          en: 'Annual sports competition featuring various games',
          bn: 'বিভিন্ন খেলার বার্ষিক ক্রীড়া প্রতিযোগিতা'
        },
        category: 'Sports',
        eventDetails: {
          eventDate: new Date('2024-04-20'),
          venue: {
            en: 'School Sports Ground',
            bn: 'স্কুল খেলার মাঠ'
          }
        },
        featured: true,
        status: 'published',
        tags: [
          { en: 'sports', bn: 'খেলাধুলা' },
          { en: 'competition', bn: 'প্রতিযোগিতা' }
        ],
        author: adminUser._id
      }
    ];

    await Event.insertMany(events);
    console.log('📅 Created events');

    // 6. Create Notices
    const notices = [
      {
        title: {
          en: 'Admission Open for Academic Year 2024-25',
          bn: '২০২৪-২৫ শিক্ষাবর্ষে ভর্তি চালু'
        },
        slug: 'admission-open-2024-25',
        content: {
          en: 'Admission is now open for the academic year 2024-25. Interested students can collect admission forms from the school office.',
          bn: '২০২৪-২৫ শিক্ষাবর্ষের জন্য ভর্তি এখন চালু। আগ্রহী শিক্ষার্থীরা স্কুল অফিস থেকে ভর্তির ফর্ম সংগ্রহ করতে পারেন।'
        },
        category: 'Admission',
        priority: 'High',
        targetAudience: ['All', 'Students', 'Parents'],
        status: 'published',
        publishDate: new Date(),
        expiryDate: new Date('2024-04-30'),
        noticeNumber: 'NOT-202409-001',
        author: adminUser._id
      },
      {
        title: {
          en: 'Mid-term Examination Schedule',
          bn: 'অর্ধবার্ষিক পরীক্ষার সময়সূচি'
        },
        slug: 'midterm-exam-schedule-2024',
        content: {
          en: 'The mid-term examination for all classes will be held from March 1st to March 15th, 2024.',
          bn: 'সকল শ্রেণির অর্ধবার্ষিক পরীক্ষা ১ মার্চ থেকে ১৫ মার্চ, ২০২ৄ পর্যন্ত অনুষ্ঠিত হবে।'
        },
        category: 'Examination',
        priority: 'High',
        targetAudience: ['Students', 'Parents', 'Teachers'],
        status: 'published',
        publishDate: new Date(),
        expiryDate: new Date('2024-03-15'),
        noticeNumber: 'NOT-202409-002',
        author: adminUser._id
      }
    ];

    await Notice.insertMany(notices);
    console.log('📢 Created notices');

    // 7. Create Gallery Items
    const galleryItems = [
      {
        title: {
          en: 'Science Laboratory',
          bn: 'বিজ্ঞান গবেষণাগার'
        },
        slug: 'science-laboratory-2024',
        description: {
          en: 'Modern science laboratory equipped with latest instruments',
          bn: 'সর্বাধুনিক যন্ত্রপাতি সহ আধুনিক বিজ্ঞান গবেষণাগার'
        },
        category: 'Infrastructure',
        type: 'image',
        media: [{
          type: 'image',
          url: '/images/gallery/science-lab.jpg',
          title: { en: 'Science Lab', bn: 'বিজ্ঞান গবেষণাগার' },
          caption: { en: 'Modern equipment', bn: 'আধুনিক যন্ত্রপাতি' },
          alt: { en: 'Science Laboratory', bn: 'বিজ্ঞান গবেষণাগার' }
        }],
        tags: [
          { en: 'science', bn: 'বিজ্ঞান' },
          { en: 'laboratory', bn: 'গবেষণাগার' }
        ],
        author: adminUser._id
      },
      {
        title: {
          en: 'Annual Sports Day',
          bn: 'বার্ষিক ক্রীড়া দিবস'
        },
        slug: 'annual-sports-day-2024',
        description: {
          en: 'Students participating in various sports activities',
          bn: 'বিভিন্ন ক্রীড়া কার্যক্রমে অংশগ্রহণকারী শিক্ষার্থীরা'
        },
        category: 'Sports',
        type: 'image',
        media: [{
          type: 'image',
          url: '/images/gallery/sports-day.jpg',
          title: { en: 'Sports Day', bn: 'ক্রীড়া দিবস' },
          caption: { en: 'Students in action', bn: 'ক্রীড়ারত শিক্ষার্থীরা' },
          alt: { en: 'Annual Sports Day', bn: 'বার্ষিক ক্রীড়া দিবস' }
        }],
        tags: [
          { en: 'sports', bn: 'খেলাধুলা' },
          { en: 'students', bn: 'শিক্ষার্থী' }
        ],
        eventDetails: {
          eventName: { en: 'Annual Sports Day 2024', bn: 'বার্ষিক ক্রীড়া দিবস ২০২৪' },
          eventDate: new Date('2024-02-15'),
          venue: { en: 'School Playground', bn: 'স্কুল খেলার মাঠ' }
        },
        author: adminUser._id
      }
    ];

    await Gallery.insertMany(galleryItems);
    console.log('🖼️  Created gallery items');

    // 8. Create Management Committee
    const managementCommittee = [
      {
        name: {
          en: 'Dr. Mohammad Rahman',
          bn: 'ড. মোহাম্মদ রহমান'
        },
        position: {
          en: 'Chairman',
          bn: 'চেয়ারম্যান'
        },
        qualification: {
          en: 'Ph.D. in Education, M.A. in English Literature',
          bn: 'শিক্ষায় পিএইচডি, ইংরেজি সাহিত্যে এমএ'
        },
        experience: {
          en: '30+ years in education sector, Former Vice-Chancellor',
          bn: 'শিক্ষা ক্ষেত্রে ৩০+ বছরের অভিজ্ঞতা, প্রাক্তন উপাচার্য'
        },
        bio: {
          en: 'Former Vice-Chancellor with 30+ years of experience in education.',
          bn: 'শিক্ষা ক্ষেত্রে ৩০+ বছরের অভিজ্ঞতাসহ প্রাক্তন উপাচার্য।'
        },
        contactInfo: {
          phone: '+880-1711-123456',
          email: 'chairman@greenwoodhigh.edu.bd'
        },
        joinDate: new Date('2020-01-01'),
        category: 'leadership',
        priority: 1,
        isActive: true
      },
      {
        name: {
          en: 'Prof. Fatema Khatun',
          bn: 'প্রফেসর ফাতেমা খাতুন'
        },
        position: {
          en: 'Vice-Chairman',
          bn: 'সহ-সভাপতি'
        },
        qualification: {
          en: 'M.Ed., B.Ed., M.A. in Mathematics',
          bn: 'এমএড, বিএড, গণিতে এমএ'
        },
        experience: {
          en: '25+ years in education, Former Principal',
          bn: 'শিক্ষায় ২৫+ বছরের অভিজ্ঞতা, প্রাক্তন অধ্যক্ষ'
        },
        bio: {
          en: 'Renowned educationist and former principal.',
          bn: 'প্রখ্যাত শিক্ষাবিদ ও প্রাক্তন অধ্যক্ষ।'
        },
        contactInfo: {
          phone: '+880-1711-123457',
          email: 'vice.chairman@greenwoodhigh.edu.bd'
        },
        joinDate: new Date('2020-06-01'),
        category: 'academic',
        priority: 2,
        isActive: true
      }
    ];

    await ManagementCommittee.insertMany(managementCommittee);
    console.log('👥 Created management committee');

    // 9. Skip teachers for now due to model issues
    console.log('⏭️  Skipped teachers (model issues)');

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- Admin User: 1');
    console.log('- Institution Settings: 1');
    console.log('- Hero Slides: 2');
    console.log('- Vision/Mission: 2');
    console.log('- Events: 2');
    console.log('- Notices: 2');
    console.log('- Gallery Items: 2');
    console.log('- Management Committee: 2');

    console.log('\n🔑 Admin Credentials:');
    console.log('Email: admin@school.edu');
    console.log('Password: admin123456');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the seeder
const runSeeder = async () => {
  await connectDB();
  await seedDatabase();
};

// Check if this script is being run directly
if (require.main === module) {
  runSeeder();
}

module.exports = { seedDatabase };
