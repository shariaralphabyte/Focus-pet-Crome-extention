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
const Student = require('../models/Student');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school-management');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample data
const sampleData = {
  // Admin user
  users: [
    {
      name: 'Admin User',
      email: 'admin@school.edu',
      password: 'admin123456',
      role: 'admin',
      isActive: true
    }
  ],

  // Hero slides content
  heroSlides: [
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
      metadata: {
        buttonText: { en: 'Learn More', bn: 'আরও জানুন' },
        buttonLink: '/about'
      },
      isActive: true,
      order: 1
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
      metadata: {
        buttonText: { en: 'Explore Campus', bn: 'ক্যাম্পাস দেখুন' },
        buttonLink: '/gallery'
      },
      isActive: true,
      order: 2
    },
    {
      key: 'hero-slide-3',
      type: 'hero-slide',
      title: {
        en: 'Empowering Students',
        bn: 'শিক্ষার্থীদের ক্ষমতায়ন'
      },
      content: {
        en: 'Preparing confident leaders for tomorrow through quality education and character building.',
        bn: 'মানসম্পন্ন শিক্ষা ও চরিত্র গঠনের মাধ্যমে আগামীর আত্মবিশ্বাসী নেতৃত্ব তৈরি করি।'
      },
      excerpt: {
        en: 'Preparing leaders for tomorrow',
        bn: 'আগামীর নেতৃত্ব তৈরি করি'
      },
      metadata: {
        buttonText: { en: 'Join Us', bn: 'যোগ দিন' },
        buttonLink: '/admission'
      },
      isActive: true,
      order: 3
    }
  ],

  // Vision & Mission content
  visionMission: [
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
      isActive: true
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
      isActive: true
    }
  ],

  // Sample events
  events: [
    {
      title: {
        en: 'Annual Science Fair 2024',
        bn: 'বার্ষিক বিজ্ঞান মেলা ২০২৪'
      },
      content: {
        en: 'Join us for our annual science fair where students showcase their innovative projects and scientific discoveries. This year\'s theme is "Science for Sustainable Future".',
        bn: 'আমাদের বার্ষিক বিজ্ঞান মেলায় যোগ দিন যেখানে শিক্ষার্থীরা তাদের উদ্ভাবনী প্রকল্প ও বৈজ্ঞানিক আবিষ্কার প্রদর্শন করবে। এ বছরের প্রতিপাদ্য "টেকসই ভবিষ্যতের জন্য বিজ্ঞান"।'
      },
      excerpt: {
        en: 'Students showcase innovative projects and scientific discoveries',
        bn: 'শিক্ষার্থীরা উদ্ভাবনী প্রকল্প ও বৈজ্ঞানিক আবিষ্কার প্রদর্শন করবে'
      },
      slug: 'annual-science-fair-2024',
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
        { en: 'fair', bn: 'মেলা' },
        { en: 'students', bn: 'শিক্ষার্থী' }
      ]
    },
    {
      title: {
        en: 'Inter-School Sports Competition',
        bn: 'আন্তঃস্কুল ক্রীড়া প্রতিযোগিতা'
      },
      content: {
        en: 'Annual inter-school sports competition featuring various games including football, cricket, basketball, and athletics. Students from different schools will compete for the championship.',
        bn: 'ফুটবল, ক্রিকেট, বাস্কেটবল ও অ্যাথলেটিক্স সহ বিভিন্ন খেলার বার্ষিক আন্তঃস্কুল ক্রীড়া প্রতিযোগিতা। বিভিন্ন স্কুলের শিক্ষার্থীরা চ্যাম্পিয়নশিপের জন্য প্রতিদ্বন্দ্বিতা করবে।'
      },
      excerpt: {
        en: 'Annual sports competition featuring various games',
        bn: 'বিভিন্ন খেলার বার্ষিক ক্রীড়া প্রতিযোগিতা'
      },
      slug: 'inter-school-sports-competition',
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
        { en: 'competition', bn: 'প্রতিযোগিতা' },
        { en: 'inter-school', bn: 'আন্তঃস্কুল' }
      ]
    }
  ],

  // Sample notices
  notices: [
    {
      title: {
        en: 'Admission Open for Academic Year 2024-25',
        bn: '২০২৪-২৫ শিক্ষাবর্ষে ভর্তি চালু'
      },
      slug: 'admission-open-2024-25',
      content: {
        en: 'Admission is now open for the academic year 2024-25. Interested students can collect admission forms from the school office or download from our website.',
        bn: '২০২৪-২৫ শিক্ষাবর্ষের জন্য ভর্তি এখন চালু। আগ্রহী শিক্ষার্থীরা স্কুল অফিস থেকে ভর্তির ফর্ম সংগ্রহ করতে পারেন অথবা আমাদের ওয়েবসাইট থেকে ডাউনলোড করতে পারেন।'
      },
      category: 'Admission',
      priority: 'High',
      targetAudience: ['All', 'Students', 'Parents'],
      status: 'published',
      publishDate: new Date(),
      expiryDate: new Date('2024-04-30'),
      noticeNumber: 'NOT-202409-001',
      isActive: true
    },
    {
      title: {
        en: 'Mid-term Examination Schedule',
        bn: 'অর্ধবার্ষিক পরীক্ষার সময়সূচি'
      },
      slug: 'midterm-exam-schedule-2024',
      content: {
        en: 'The mid-term examination for all classes will be held from March 1st to March 15th, 2024. Students are advised to prepare accordingly.',
        bn: 'সকল শ্রেণির অর্ধবার্ষিক পরীক্ষা ১ মার্চ থেকে ১৫ মার্চ, ২০২৪ পর্যন্ত অনুষ্ঠিত হবে। শিক্ষার্থীদের সে অনুযায়ী প্রস্তুতি নিতে পরামর্শ দেওয়া হচ্ছে।'
      },
      category: 'Examination',
      priority: 'High',
      targetAudience: ['Students', 'Parents', 'Teachers'],
      status: 'published',
      publishDate: new Date(),
      expiryDate: new Date('2024-03-15'),
      noticeNumber: 'NOT-202409-002',
      isActive: true
    }
  ],

  // Sample gallery images
  gallery: [
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
      tags: [
        { en: 'science', bn: 'বিজ্ঞান' },
        { en: 'laboratory', bn: 'গবেষণাগার' },
        { en: 'infrastructure', bn: 'অবকাঠামো' }
      ],
      media: [{
        type: 'image',
        url: '/images/gallery/science-lab.jpg',
        title: { en: 'Science Lab', bn: 'বিজ্ঞান গবেষণাগার' },
        caption: { en: 'Modern equipment', bn: 'আধুনিক যন্ত্রপাতি' },
        alt: { en: 'Science Laboratory', bn: 'বিজ্ঞান গবেষণাগার' }
      }],
      isActive: true
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
      tags: [
        { en: 'sports', bn: 'খেলাধুলা' },
        { en: 'students', bn: 'শিক্ষার্থী' },
        { en: 'activities', bn: 'কার্যক্রম' }
      ],
      media: [{
        type: 'image',
        url: '/images/gallery/sports-day.jpg',
        title: { en: 'Sports Day', bn: 'ক্রীড়া দিবস' },
        caption: { en: 'Students in action', bn: 'ক্রীড়ারত শিক্ষার্থীরা' },
        alt: { en: 'Annual Sports Day', bn: 'বার্ষিক ক্রীড়া দিবস' }
      }],
      eventDetails: {
        eventName: { en: 'Annual Sports Day 2024', bn: 'বার্ষিক ক্রীড়া দিবস ২০২৪' },
        eventDate: new Date('2024-02-15'),
        venue: { en: 'School Playground', bn: 'স্কুল খেলার মাঠ' }
      },
      isActive: true
    }
  ],

  // Institution settings
  institutionSettings: {
    name: {
      en: 'Greenwood High School',
      bn: 'গ্রিনউড উচ্চ বিদ্যালয়'
    },
    establishmentYear: 1985,
    address: {
      en: '123 Education Street, Dhaka, Bangladesh',
      bn: '১২৩ শিক্ষা সড়ক, ঢাকা, বাংলাদেশ'
    },
    phone: '+880-2-123456789',
    email: 'info@greenwoodhigh.edu.bd',
    website: 'www.greenwoodhigh.edu.bd',
    description: {
      en: 'A leading educational institution committed to excellence in education and character development.',
      bn: 'শিক্ষায় উৎকর্ষতা ও চরিত্র গঠনে প্রতিশ্রুতিবদ্ধ একটি অগ্রণী শিক্ষা প্রতিষ্ঠান।'
    },
    vision: {
      en: 'To be a leading educational institution in the country.',
      bn: 'দেশের একটি অগ্রণী শিক্ষা প্রতিষ্ঠান হওয়া।'
    },
    mission: {
      en: 'To provide quality education and develop skilled human resources.',
      bn: 'মানসম্পন্ন শিক্ষা প্রদান ও দক্ষ জনশক্তি গড়ে তোলা।'
    },
    statistics: {
      students: { total: 2450, male: 1300, female: 1150 },
      teachers: { total: 145, male: 85, female: 60 },
      staff: { total: 45, male: 30, female: 15 },
      classrooms: 48,
      laboratories: 8,
      library: 1
    }
  },

  // Management committee
  managementCommittee: [
    {
      name: {
        en: 'Dr. Mohammad Rahman',
        bn: 'ড. মোহাম্মদ রহমান'
      },
      designation: {
        en: 'Chairman',
        bn: 'চেয়ারম্যান'
      },
      bio: {
        en: 'Former Vice-Chancellor with 30+ years of experience in education.',
        bn: 'শিক্ষা ক্ষেত্রে ৩০+ বছরের অভিজ্ঞতাসহ প্রাক্তন উপাচার্য।'
      },
      phone: '+880-1711-123456',
      email: 'chairman@greenwoodhigh.edu.bd',
      isActive: true,
      order: 1
    },
    {
      name: {
        en: 'Prof. Fatema Khatun',
        bn: 'প্রফেসর ফাতেমা খাতুন'
      },
      designation: {
        en: 'Vice-Chairman',
        bn: 'সহ-সভাপতি'
      },
      bio: {
        en: 'Renowned educationist and former principal.',
        bn: 'প্রখ্যাত শিক্ষাবিদ ও প্রাক্তন অধ্যক্ষ।'
      },
      phone: '+880-1711-123457',
      email: 'vice.chairman@greenwoodhigh.edu.bd',
      isActive: true,
      order: 2
    }
  ]
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

    console.log('🗑️  Cleared existing data');

    // Create admin user
    const hashedPassword = await bcrypt.hash(sampleData.users[0].password, 12);
    const adminUser = await User.create({
      ...sampleData.users[0],
      password: hashedPassword
    });
    console.log('👤 Created admin user');

    // Add author to hero slides
    const heroSlidesWithAuthor = sampleData.heroSlides.map(slide => ({
      ...slide,
      author: adminUser._id,
      settings: {
        isPublished: true,
        isVisible: true,
        order: slide.order || 0
      }
    }));

    // Create hero slides
    await Content.insertMany(heroSlidesWithAuthor);
    console.log('🖼️  Created hero slides');

    // Add author to vision & mission
    const visionMissionWithAuthor = sampleData.visionMission.map(item => ({
      ...item,
      author: adminUser._id,
      settings: {
        isPublished: true,
        isVisible: true,
        order: 0
      }
    }));

    // Create vision & mission
    await Content.insertMany(visionMissionWithAuthor);
    console.log('🎯 Created vision & mission');

    // Add author to events
    const eventsWithAuthor = sampleData.events.map(event => ({
      ...event,
      author: adminUser._id
    }));

    // Create events
    await Event.insertMany(eventsWithAuthor);
    console.log('📅 Created events');

    // Add author to notices
    const noticesWithAuthor = sampleData.notices.map(notice => ({
      ...notice,
      author: adminUser._id
    }));

    // Create notices
    await Notice.insertMany(noticesWithAuthor);
    console.log('📢 Created notices');

    // Add author to gallery images
    const galleryWithAuthor = sampleData.gallery.map(gallery => ({
      ...gallery,
      author: adminUser._id
    }));

    // Create gallery images
    await Gallery.insertMany(galleryWithAuthor);
    console.log('🖼️  Created gallery images');

    // Create institution settings
    await InstitutionSettings.create(sampleData.institutionSettings);
    console.log('🏫 Created institution settings');

    // Create management committee
    await ManagementCommittee.insertMany(sampleData.managementCommittee);
    console.log('👥 Created management committee');

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: ${sampleData.users.length}`);
    console.log(`- Hero Slides: ${sampleData.heroSlides.length}`);
    console.log(`- Vision/Mission: ${sampleData.visionMission.length}`);
    console.log(`- Events: ${sampleData.events.length}`);
    console.log(`- Notices: ${sampleData.notices.length}`);
    console.log(`- Gallery Images: ${sampleData.gallery.length}`);
    console.log(`- Management Committee: ${sampleData.managementCommittee.length}`);
    console.log(`- Institution Settings: 1`);

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

module.exports = { seedDatabase, sampleData };
