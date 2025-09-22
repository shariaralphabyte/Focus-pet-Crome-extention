const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Notice = require('../models/Notice');
const User = require('../models/User');

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

// Add more notices
const addNotices = async () => {
  try {
    console.log('🌱 Adding 5 more notices...');

    // Get admin user
    const adminUser = await User.findOne({ email: 'admin@school.edu' });
    if (!adminUser) {
      console.error('Admin user not found!');
      return;
    }

    const newNotices = [
      {
        title: {
          en: 'Annual Cultural Program 2024',
          bn: 'বার্ষিক সাংস্কৃতিক অনুষ্ঠান ২০২৪'
        },
        slug: 'annual-cultural-program-2024',
        content: {
          en: 'Join us for our grand annual cultural program featuring dance, music, drama, and poetry performances by our talented students. The event will be held on December 15th, 2024.',
          bn: 'আমাদের প্রতিভাবান শিক্ষার্থীদের নৃত্য, সঙ্গীত, নাটক ও কবিতা পরিবেশনা সহ বার্ষিক সাংস্কৃতিক অনুষ্ঠানে যোগ দিন। অনুষ্ঠানটি ১৫ ডিসেম্বর, ২০২৪ তারিখে অনুষ্ঠিত হবে।'
        },
        excerpt: {
          en: 'Grand cultural program featuring student performances',
          bn: 'শিক্ষার্থীদের পরিবেশনা সহ বৃহৎ সাংস্কৃতিক অনুষ্ঠান'
        },
        category: 'Cultural',
        priority: 'High',
        targetAudience: ['All', 'Students', 'Parents', 'Teachers'],
        status: 'published',
        publishDate: new Date(),
        expiryDate: new Date('2024-12-20'),
        isPublished: true,
        noticeNumber: 'NOT-202409-003',
        author: adminUser._id
      },
      {
        title: {
          en: 'Parent-Teacher Meeting Notice',
          bn: 'অভিভাবক-শিক্ষক সভার নোটিশ'
        },
        slug: 'parent-teacher-meeting-notice',
        content: {
          en: 'Monthly parent-teacher meeting will be held on October 5th, 2024 from 10:00 AM to 2:00 PM. Parents are requested to attend and discuss their children\'s academic progress.',
          bn: 'মাসিক অভিভাবক-শিক্ষক সভা ৫ অক্টোবর, ২০২৪ তারিখে সকাল ১০টা থেকে দুপুর ২টা পর্যন্ত অনুষ্ঠিত হবে। অভিভাবকদের উপস্থিত থেকে সন্তানদের শিক্ষাগত অগ্রগতি নিয়ে আলোচনা করার অনুরোধ জানানো হচ্ছে।'
        },
        excerpt: {
          en: 'Monthly meeting to discuss academic progress',
          bn: 'শিক্ষাগত অগ্রগতি নিয়ে আলোচনার মাসিক সভা'
        },
        category: 'Meeting',
        priority: 'High',
        targetAudience: ['Parents', 'Teachers'],
        status: 'published',
        publishDate: new Date(),
        expiryDate: new Date('2024-10-06'),
        isPublished: true,
        noticeNumber: 'NOT-202409-004',
        author: adminUser._id
      },
      {
        title: {
          en: 'School Holiday Announcement',
          bn: 'স্কুল ছুটির ঘোষণা'
        },
        slug: 'school-holiday-announcement',
        content: {
          en: 'The school will remain closed from October 10th to October 15th, 2024 due to Durga Puja celebrations. Classes will resume on October 16th, 2024.',
          bn: 'দুর্গাপূজা উদযাপনের কারণে ১০ অক্টোবর থেকে ১৫ অক্টোবর, ২০২৪ পর্যন্ত স্কুল বন্ধ থাকবে। ১৬ অক্টোবর, ২০২৪ থেকে ক্লাস পুনরায় শুরু হবে।'
        },
        excerpt: {
          en: 'School closure for Durga Puja celebrations',
          bn: 'দুর্গাপূজা উদযাপনের জন্য স্কুল বন্ধ'
        },
        category: 'Holiday',
        priority: 'Medium',
        targetAudience: ['All', 'Students', 'Parents', 'Teachers', 'Staff'],
        status: 'published',
        publishDate: new Date(),
        expiryDate: new Date('2024-10-16'),
        isPublished: true,
        isPinned: true,
        noticeNumber: 'NOT-202409-005',
        author: adminUser._id
      },
      {
        title: {
          en: 'Library Book Return Reminder',
          bn: 'লাইব্রেরির বই ফেরত দেওয়ার স্মরণিকা'
        },
        slug: 'library-book-return-reminder',
        content: {
          en: 'All students are reminded to return their borrowed library books by September 30th, 2024. Late returns will incur a fine of 5 Taka per day per book.',
          bn: 'সকল শিক্ষার্থীকে স্মরণ করিয়ে দেওয়া হচ্ছে যে ৩০ সেপ্টেম্বর, ২০২৪ এর মধ্যে লাইব্রেরি থেকে নেওয়া বই ফেরত দিতে হবে। দেরিতে ফেরত দিলে প্রতিদিন প্রতি বইয়ের জন্য ৫ টাকা জরিমানা দিতে হবে।'
        },
        excerpt: {
          en: 'Return borrowed books by September 30th',
          bn: '৩০ সেপ্টেম্বরের মধ্যে ধার করা বই ফেরত দিন'
        },
        category: 'General',
        priority: 'Medium',
        targetAudience: ['Students'],
        status: 'published',
        publishDate: new Date(),
        expiryDate: new Date('2024-09-30'),
        isPublished: true,
        noticeNumber: 'NOT-202409-006',
        author: adminUser._id
      },
      {
        title: {
          en: 'Annual Sports Day Registration',
          bn: 'বার্ষিক ক্রীড়া দিবসের নিবন্ধন'
        },
        slug: 'annual-sports-day-registration',
        content: {
          en: 'Registration for Annual Sports Day 2024 is now open. Students interested in participating in various sports events can register with their respective class teachers by October 1st, 2024.',
          bn: 'বার্ষিক ক্রীড়া দিবস ২০২৪ এর নিবন্ধন এখন চালু। বিভিন্ন ক্রীড়া ইভেন্টে অংশগ্রহণে আগ্রহী শিক্ষার্থীরা ১ অক্টোবর, ২০২৪ এর মধ্যে নিজ নিজ শ্রেণি শিক্ষকের কাছে নিবন্ধন করতে পারবে।'
        },
        excerpt: {
          en: 'Register for sports events by October 1st',
          bn: '১ অক্টোবরের মধ্যে ক্রীড়া ইভেন্টের জন্য নিবন্ধন করুন'
        },
        category: 'Sports',
        priority: 'Medium',
        targetAudience: ['Students', 'Teachers'],
        status: 'published',
        publishDate: new Date(),
        expiryDate: new Date('2024-10-02'),
        isPublished: true,
        featured: true,
        noticeNumber: 'NOT-202409-007',
        author: adminUser._id
      }
    ];

    await Notice.insertMany(newNotices);
    console.log('✅ Successfully added 5 new notices!');

    // Show total count
    const totalNotices = await Notice.countDocuments();
    console.log(`📊 Total notices in database: ${totalNotices}`);

    console.log('\n📋 New notices added:');
    newNotices.forEach((notice, index) => {
      console.log(`${index + 1}. ${notice.title.en} (${notice.category})`);
    });

  } catch (error) {
    console.error('❌ Error adding notices:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the script
const runScript = async () => {
  await connectDB();
  await addNotices();
};

runScript();
