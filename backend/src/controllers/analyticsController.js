const WaterTestLog = require('../models/WaterTestLog');
const IssueReport = require('../models/IssueReport');
const WaterSource = require('../models/WaterSource');

// @desc    Get dashboard summary statistics & analytics charts data
// @route   GET /api/v1/analytics/dashboard
// @access  Private
exports.getDashboardData = async (req, res, next) => {
  try {
    const totalSources = await WaterSource.countDocuments();
    const contaminatedSources = await WaterSource.countDocuments({ status: 'contaminated' });
    const openIssues = await IssueReport.countDocuments({ status: { $ne: 'resolved' } });
    const totalTestsLogged = await WaterTestLog.countDocuments();

    // WQI distribution breakdown
    const wqiDistribution = await WaterTestLog.aggregate([
      {
        $group: {
          _id: '$qualityStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    // pH & TDS trends over time (last 10 tests)
    const recentTrends = await WaterTestLog.find()
      .select('parameters.ph parameters.tds parameters.turbidity calculatedWQI testDate villageName')
      .sort({ testDate: 1 })
      .limit(15);

    res.status(200).json({
      success: true,
      summary: {
        totalSources,
        contaminatedSources,
        openIssues,
        totalTestsLogged
      },
      wqiDistribution,
      recentTrends
    });
  } catch (error) {
    next(error);
  }
};
