const { User, WaterTest, IssueReport } = require('../models');

exports.getDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalTests,
      totalIssues,
      openIssues,
      unsafeTests,
      villages,
      recentTests,
      recentIssues,
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      WaterTest.countDocuments(),
      IssueReport.countDocuments(),
      IssueReport.countDocuments({ status: { $in: ['reported', 'acknowledged', 'in_progress'] } }),
      WaterTest.countDocuments({ overallStatus: 'unsafe' }),
      WaterTest.distinct('village'),
      WaterTest.find().populate('userId', 'name village').sort({ testDate: -1 }).limit(10),
      IssueReport.find().populate('userId', 'name village').sort({ createdAt: -1 }).limit(10),
    ]);

    res.json({
      stats: {
        totalUsers,
        totalTests,
        totalIssues,
        openIssues,
        unsafeTests,
        villageCount: villages.length,
        villages,
      },
      recentTests,
      recentIssues,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { role, village, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (village) filter.village = village;

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        village: user.village,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getVillageOverview = async (req, res) => {
  try {
    const overview = await WaterTest.aggregate([
      {
        $group: {
          _id: '$village',
          totalTests: { $sum: 1 },
          avgPh: { $avg: '$ph' },
          avgTurbidity: { $avg: '$turbidity' },
          avgTds: { $avg: '$tds' },
          safeCount: {
            $sum: { $cond: [{ $eq: ['$overallStatus', 'safe'] }, 1, 0] },
          },
          unsafeCount: {
            $sum: { $cond: [{ $eq: ['$overallStatus', 'unsafe'] }, 1, 0] },
          },
          lastTest: { $max: '$testDate' },
        },
      },
      { $sort: { lastTest: -1 } },
    ]);

    const villageIssues = await IssueReport.aggregate([
      { $match: { status: { $in: ['reported', 'acknowledged', 'in_progress'] } } },
      {
        $group: {
          _id: '$village',
          openIssues: { $sum: 1 },
          criticalCount: {
            $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] },
          },
        },
      },
    ]);

    const issuesMap = {};
    villageIssues.forEach((v) => {
      issuesMap[v._id] = v;
    });

    const result = overview.map((v) => ({
      village: v._id,
      totalTests: v.totalTests,
      avgPh: v.avgPh ? v.avgPh.toFixed(2) : null,
      avgTurbidity: v.avgTurbidity ? v.avgTurbidity.toFixed(2) : null,
      avgTds: v.avgTds ? v.avgTds.toFixed(0) : null,
      safetyRate: v.totalTests > 0 ? ((v.safeCount / v.totalTests) * 100).toFixed(1) : 0,
      unsafeCount: v.unsafeCount,
      lastTest: v.lastTest,
      openIssues: issuesMap[v._id]?.openIssues || 0,
      criticalIssues: issuesMap[v._id]?.criticalCount || 0,
    }));

    res.json({ villages: result });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
