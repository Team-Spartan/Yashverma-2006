const { WaterTest } = require('../models');

exports.createTest = async (req, res) => {
  try {
    const {
      village, sourceName, sourceType, testDate,
      ph, turbidity, turbidityUnit, tds, tdsUnit,
      chlorine, chlorineUnit, temperature, bacteriaTest,
      overallStatus, notes,
    } = req.body;

    const test = await WaterTest.create({
      userId: req.user._id,
      village,
      sourceName,
      sourceType,
      testDate,
      ph,
      turbidity,
      turbidityUnit,
      tds,
      tdsUnit,
      chlorine,
      chlorineUnit,
      temperature,
      bacteriaTest,
      overallStatus,
      notes,
    });

    const populated = await test.populate('userId', 'name village');
    res.status(201).json({ test: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTests = async (req, res) => {
  try {
    const { village, status, page = 1, limit = 20, startDate, endDate } = req.query;
    const filter = {};

    if (village) filter.village = village;
    else if (req.user.role !== 'admin') filter.village = req.user.village;

    if (status) filter.overallStatus = status;
    if (startDate || endDate) {
      filter.testDate = {};
      if (startDate) filter.testDate.$gte = new Date(startDate);
      if (endDate) filter.testDate.$lte = new Date(endDate);
    }

    const total = await WaterTest.countDocuments(filter);
    const tests = await WaterTest.find(filter)
      .populate('userId', 'name village')
      .sort({ testDate: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      tests,
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

exports.getTestById = async (req, res) => {
  try {
    const test = await WaterTest.findById(req.params.id).populate('userId', 'name village');
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    res.json({ test });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateTest = async (req, res) => {
  try {
    const test = req.resource || await WaterTest.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    const allowedFields = [
      'village', 'sourceName', 'sourceType', 'testDate',
      'ph', 'turbidity', 'turbidityUnit', 'tds', 'tdsUnit',
      'chlorine', 'chlorineUnit', 'temperature', 'bacteriaTest',
      'overallStatus', 'notes',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        test[field] = req.body[field];
      }
    });

    await test.save();
    const populated = await test.populate('userId', 'name village');
    res.json({ test: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteTest = async (req, res) => {
  try {
    const test = await WaterTest.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    await WaterTest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Test deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTrends = async (req, res) => {
  try {
    const { village, months = 12 } = req.query;
    const filter = {};

    if (village) filter.village = village;
    else if (req.user.role !== 'admin') filter.village = req.user.village;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));
    filter.testDate = { $gte: startDate };

    const trends = await WaterTest.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$testDate' },
            month: { $month: '$testDate' },
          },
          avgPh: { $avg: '$ph' },
          avgTurbidity: { $avg: '$turbidity' },
          avgTds: { $avg: '$tds' },
          avgChlorine: { $avg: '$chlorine' },
          count: { $sum: 1 },
          safeCount: {
            $sum: { $cond: [{ $eq: ['$overallStatus', 'safe'] }, 1, 0] },
          },
          cautionCount: {
            $sum: { $cond: [{ $eq: ['$overallStatus', 'caution'] }, 1, 0] },
          },
          unsafeCount: {
            $sum: { $cond: [{ $eq: ['$overallStatus', 'unsafe'] }, 1, 0] },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({ trends });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.compareVillages = async (req, res) => {
  try {
    const { villages, months = 12 } = req.query;

    if (!villages) {
      return res.status(400).json({ message: 'villages parameter is required' });
    }

    const villageList = villages.split(',').map((v) => v.trim()).filter(Boolean);

    if (villageList.length === 0) {
      return res.status(400).json({ message: 'At least one village is required' });
    }

    if (villageList.length > 5) {
      return res.status(400).json({ message: 'Maximum 5 villages can be compared at once' });
    }

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const trends = await WaterTest.aggregate([
      {
        $match: {
          village: { $in: villageList },
          testDate: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            village: '$village',
            year: { $year: '$testDate' },
            month: { $month: '$testDate' },
          },
          avgPh: { $avg: '$ph' },
          avgTurbidity: { $avg: '$turbidity' },
          avgTds: { $avg: '$tds' },
          avgChlorine: { $avg: '$chlorine' },
          count: { $sum: 1 },
          safeCount: {
            $sum: { $cond: [{ $eq: ['$overallStatus', 'safe'] }, 1, 0] },
          },
          cautionCount: {
            $sum: { $cond: [{ $eq: ['$overallStatus', 'caution'] }, 1, 0] },
          },
          unsafeCount: {
            $sum: { $cond: [{ $eq: ['$overallStatus', 'unsafe'] }, 1, 0] },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const villageData = {};
    villageList.forEach((v) => {
      villageData[v] = trends
        .filter((t) => t._id.village === v)
        .map((t) => ({
          year: t._id.year,
          month: t._id.month,
          avgPh: t.avgPh,
          avgTurbidity: t.avgTurbidity,
          avgTds: t.avgTds,
          avgChlorine: t.avgChlorine,
          count: t.count,
          safeCount: t.safeCount,
          cautionCount: t.cautionCount,
          unsafeCount: t.unsafeCount,
        }));
    });

    res.json({ villageData });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role !== 'admin') filter.village = req.user.village;

    const [totalTests, safeTests, cautionTests, unsafeTests, sourceBreakdown] =
      await Promise.all([
        WaterTest.countDocuments(filter),
        WaterTest.countDocuments({ ...filter, overallStatus: 'safe' }),
        WaterTest.countDocuments({ ...filter, overallStatus: 'caution' }),
        WaterTest.countDocuments({ ...filter, overallStatus: 'unsafe' }),
        WaterTest.aggregate([
          { $match: filter },
          { $group: { _id: '$sourceType', count: { $sum: 1 } } },
        ]),
      ]);

    const recentTests = await WaterTest.find(filter)
      .populate('userId', 'name village')
      .sort({ testDate: -1 })
      .limit(5);

    res.json({
      stats: {
        totalTests,
        safeTests,
        cautionTests,
        unsafeTests,
        safetyRate: totalTests > 0 ? ((safeTests / totalTests) * 100).toFixed(1) : 0,
        sourceBreakdown,
      },
      recentTests,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
