const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const WaterSource = require('../models/WaterSource');
const WaterTestLog = require('../models/WaterTestLog');
const IssueReport = require('../models/IssueReport');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jaldrishti_db');
    console.log('[Seed] Connected to MongoDB...');

    // Clear existing data
    await User.deleteMany();
    await WaterSource.deleteMany();
    await WaterTestLog.deleteMany();
    await IssueReport.deleteMany();

    // Create sample users
    const repUser = await User.create({
      name: 'Ramesh Patel',
      email: 'ramesh@village.in',
      password: 'password123',
      role: 'village_rep',
      villageName: 'Rampur',
      district: 'Varanasi',
      state: 'Uttar Pradesh',
      phone: '+91 9876543210'
    });

    const healthWorker = await User.create({
      name: 'Dr. Sunita Sharma',
      email: 'sunita@health.gov.in',
      password: 'password123',
      role: 'health_worker',
      villageName: 'Rampur Block',
      district: 'Varanasi',
      state: 'Uttar Pradesh',
      phone: '+91 9876500112'
    });

    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@jaldrishti.gov.in',
      password: 'password123',
      role: 'admin',
      villageName: 'HQ Office',
      district: 'Varanasi',
      state: 'Uttar Pradesh',
      phone: '+91 9999999999'
    });

    // Create sample water sources
    const source1 = await WaterSource.create({
      name: 'Panchayat Bhavan Handpump #01',
      sourceType: 'handpump',
      villageName: 'Rampur',
      district: 'Varanasi',
      locationCoordinates: { latitude: 25.3176, longitude: 82.9739 },
      status: 'active'
    });

    const source2 = await WaterSource.create({
      name: 'East School Overhead Tank',
      sourceType: 'overhead_tank',
      villageName: 'Rampur',
      district: 'Varanasi',
      locationCoordinates: { latitude: 25.3200, longitude: 82.9800 },
      status: 'contaminated'
    });

    // Create sample water logs
    await WaterTestLog.create([
      {
        waterSource: source1._id,
        testedBy: repUser._id,
        villageName: 'Rampur',
        parameters: { ph: 7.4, turbidity: 1.2, tds: 320, nitrates: 12, fluoride: 0.8, eColiPresent: false },
        calculatedWQI: 92,
        qualityStatus: 'Excellent',
        remarks: 'Clear water, pleasant taste.'
      },
      {
        waterSource: source2._id,
        testedBy: repUser._id,
        villageName: 'Rampur',
        parameters: { ph: 8.9, turbidity: 6.8, tds: 950, nitrates: 58, fluoride: 2.1, eColiPresent: true },
        calculatedWQI: 28,
        qualityStatus: 'Critical',
        remarks: 'High turbidity and bacterial contamination detected after heavy rainfall.'
      }
    ]);

    // Create sample issue report
    await IssueReport.create({
      waterSource: source2._id,
      reportedBy: repUser._id,
      villageName: 'Rampur',
      issueType: 'discoloration',
      severity: 'emergency',
      description: 'Water coming out reddish yellow with bad odor from East School Tank.',
      status: 'open'
    });

    console.log('[Seed] Database successfully populated with initial sample data!');
    process.exit();
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedData();
