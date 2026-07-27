const WaterTestLog = require('../models/WaterTestLog');
const WaterSource = require('../models/WaterSource');
const { calculateWQI } = require('../utils/calculateWQI');

// @desc    Get all water quality test logs
// @route   GET /api/v1/logs
// @access  Private
exports.getWaterLogs = async (req, res, next) => {
  try {
    const { villageName, sourceId, qualityStatus, limit = 20, page = 1 } = req.query;

    const query = {};
    if (villageName) query.villageName = villageName;
    if (sourceId) query.waterSource = sourceId;
    if (qualityStatus) query.qualityStatus = qualityStatus;

    const skip = (page - 1) * limit;

    const logs = await WaterTestLog.find(query)
      .populate('waterSource', 'name sourceType locationCoordinates')
      .populate('testedBy', 'name role email')
      .sort({ testDate: -1 })
      .skip(Number(skip))
      .limit(Number(limit));

    const total = await WaterTestLog.countDocuments(query);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: logs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new water quality test log
// @route   POST /api/v1/logs
// @access  Private (Village Rep / Admin)
exports.createWaterLog = async (req, res, next) => {
  try {
    const { waterSourceId, ph, turbidity, tds, nitrates, fluoride, dissolvedOxygen, eColiPresent, remarks } = req.body;

    const waterSource = await WaterSource.findById(waterSourceId);
    if (!waterSource) {
      return res.status(404).json({ success: false, message: 'Water source not found' });
    }

    const { score, status } = calculateWQI({ ph, turbidity, tds, nitrates, fluoride, eColiPresent });

    const log = await WaterTestLog.create({
      waterSource: waterSourceId,
      testedBy: req.user._id,
      villageName: waterSource.villageName,
      parameters: {
        ph,
        turbidity,
        tds,
        nitrates,
        fluoride,
        dissolvedOxygen,
        eColiPresent
      },
      calculatedWQI: score,
      qualityStatus: status,
      remarks
    });

    // If critical or unsafe, mark water source as contaminated
    if (status === 'Critical' || status === 'Unsafe') {
      await WaterSource.findByIdAndUpdate(waterSourceId, { status: 'contaminated' });
    }

    res.status(201).json({
      success: true,
      data: log
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single log detail
// @route   GET /api/v1/logs/:id
// @access  Private
exports.getWaterLogById = async (req, res, next) => {
  try {
    const log = await WaterTestLog.findById(req.params.id)
      .populate('waterSource')
      .populate('testedBy', 'name email role');

    if (!log) {
      return res.status(404).json({ success: false, message: 'Log record not found' });
    }

    res.status(200).json({
      success: true,
      data: log
    });
  } catch (error) {
    next(error);
  }
};
