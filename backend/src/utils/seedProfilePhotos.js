const mongoose = require('mongoose');
const User = require('../models/User');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kcas_department_db';

// Curated high quality diverse portrait headshots
const femalePortraits = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80', // Academic woman in blazer
  'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=400&auto=format&fit=crop&q=80', // Smiling professor/student
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', // Student portrait
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80', // Student portrait 2
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80', // Confident student
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80', // Young female scholar
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&auto=format&fit=crop&q=80', // Professional researcher
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80', // Faculty lecturer
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&auto=format&fit=crop&q=80', // Bright young student
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80', // Smiling scholar
  'https://images.unsplash.com/photo-1507152832244-10d45c7eda57?w=400&auto=format&fit=crop&q=80', // University student
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80', // Scholar
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80', // Student leader
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80', // Tech researcher
];

const malePortraits = [
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80', // Academic professor
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80', // Admin lead
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80', // Professional dean
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80', // Lecturer
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80', // Tech faculty
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80', // Executive admin
];

const adminPortrait = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';

async function seedPhotos() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully.');

    // 1. Seed Faculty Profiles
    const faculties = await Faculty.find({});
    console.log(`Found ${faculties.length} faculty member(s). Assigning photos...`);
    for (let i = 0; i < faculties.length; i++) {
      const fac = faculties[i];
      // Pick based on index to ensure variety
      const photo = femalePortraits[i % femalePortraits.length];
      fac.profilePhoto = photo;
      await fac.save();

      // Sync with linked User if any
      await User.updateMany(
        { $or: [{ email: fac.email }, { referenceId: fac._id }] },
        { profilePhoto: photo, avatar: photo }
      );
    }
    console.log('✅ Faculty photos updated.');

    // 2. Seed Student Profiles
    const students = await Student.find({});
    console.log(`Found ${students.length} student(s). Assigning photos...`);
    for (let i = 0; i < students.length; i++) {
      const stud = students[i];
      const photo = femalePortraits[(i + 3) % femalePortraits.length];
      stud.photoUrl = photo;
      stud.profilePhoto = photo;
      await stud.save();

      // Sync with linked User if any
      await User.updateMany(
        { $or: [{ email: stud.email }, { referenceId: stud._id }] },
        { profilePhoto: photo, avatar: photo }
      );
    }
    console.log('✅ Student photos updated.');

    // 3. Seed Admins & All Remaining Users
    const users = await User.find({});
    console.log(`Found ${users.length} user account(s). Updating avatars...`);
    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      if (u.email === 'santhoshsiva754@gmail.com') {
        u.profilePhoto = adminPortrait;
        u.avatar = adminPortrait;
      } else if (!u.profilePhoto) {
        if (u.role === 'admin') {
          u.profilePhoto = malePortraits[i % malePortraits.length];
          u.avatar = malePortraits[i % malePortraits.length];
        } else {
          u.profilePhoto = femalePortraits[i % femalePortraits.length];
          u.avatar = femalePortraits[i % femalePortraits.length];
        }
      }
      await u.save();
    }
    console.log('✅ User accounts updated with profile photos.');

    console.log('\n🎉 ALL PROFILE PHOTOS SEEDED SUCCESSFULLY ACROSS ENTIRE DATABASE!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding profile photos:', err);
    process.exit(1);
  }
}

seedPhotos();
