const WaterTestLog = require('../models/WaterTestLog');
const WaterSource = require('../models/WaterSource');
const { calculateWQI } = require('../utils/calculateWQI');

// @desc    Get all water quality test logs
// @route   GET /api/v1/logs
// @access  Private
exports.getWaterLogs = async (req, res, next) => {
  try {
    const { villageName, sourceId, qualityStatus, startDate, endDate, limit = 20, page = 1 } = req.query;

    const query = {};
    
    // Scoping for village representatives
    if (req.user && req.user.role === 'village_rep') {
      query.villageName = req.user.villageName;
    }

    if (villageName) {
      // Find water sources matching by name regex
      const matchingSources = await WaterSource.find({
        name: { $regex: villageName, $options: 'i' }
      }).select('_id');
      const sourceIds = matchingSources.map(s => s._id);

      const locationFilter = {
        $or: [
          { villageName: { $regex: villageName, $options: 'i' } },
          { waterSource: { $in: sourceIds } }
        ]
      };

      if (query.villageName) {
        // Compound query to restrict to user's community AND match search query
        query.$and = [
          { villageName: query.villageName },
          locationFilter
        ];
        delete query.villageName;
      } else {
        query.$or = locationFilter.$or;
      }
    }

    if (sourceId) query.waterSource = sourceId;
    if (qualityStatus) query.qualityStatus = qualityStatus;

    // Date range filtering
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      
      const hasValidStart = start && !isNaN(start.getTime());
      const hasValidEnd = end && !isNaN(end.getTime());

      if (hasValidStart || hasValidEnd) {
        query.testDate = {};
        if (hasValidStart) {
          query.testDate.$gte = start;
        }
        if (hasValidEnd) {
          end.setHours(23, 59, 59, 999);
          query.testDate.$lte = end;
        }
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const skip = (pageNum - 1) * limitNum;

    const logs = await WaterTestLog.find(query)
      .populate('waterSource', 'name sourceType locationCoordinates')
      .populate('testedBy', 'name role email')
      .sort({ testDate: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await WaterTestLog.countDocuments(query);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
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

// @desc    Update a water quality test log
// @route   PUT /api/v1/logs/:id
// @access  Private (Village Rep / Admin)
exports.updateWaterLog = async (req, res, next) => {
  try {
    const { waterSourceId, ph, turbidity, tds, nitrates, fluoride, dissolvedOxygen, eColiPresent, remarks } = req.body;

    const log = await WaterTestLog.findById(req.params.id).populate('waterSource');
    if (!log) {
      return res.status(404).json({ success: false, message: 'Log record not found' });
    }

    const waterSource = await WaterSource.findById(waterSourceId || log.waterSource._id);
    if (!waterSource) {
      return res.status(404).json({ success: false, message: 'Water source not found' });
    }

    // Keep a copy of original parameters for comparison
    const originalParameters = {
      ph: log.parameters.ph,
      turbidity: log.parameters.turbidity,
      tds: log.parameters.tds,
      nitrates: log.parameters.nitrates,
      fluoride: log.parameters.fluoride,
      dissolvedOxygen: log.parameters.dissolvedOxygen,
      eColiPresent: log.parameters.eColiPresent,
      remarks: log.remarks
    };

    // Calculate new WQI
    const updatedParams = {
      ph: ph !== undefined ? ph : log.parameters.ph,
      turbidity: turbidity !== undefined ? turbidity : log.parameters.turbidity,
      tds: tds !== undefined ? tds : log.parameters.tds,
      nitrates: nitrates !== undefined ? nitrates : log.parameters.nitrates,
      fluoride: fluoride !== undefined ? fluoride : log.parameters.fluoride,
      eColiPresent: eColiPresent !== undefined ? eColiPresent : log.parameters.eColiPresent
    };

    const { score, status } = calculateWQI(updatedParams);

    // Apply updates
    log.waterSource = waterSource._id;
    log.villageName = waterSource.villageName;
    log.parameters.ph = updatedParams.ph;
    log.parameters.turbidity = updatedParams.turbidity;
    log.parameters.tds = updatedParams.tds;
    log.parameters.nitrates = updatedParams.nitrates;
    log.parameters.fluoride = updatedParams.fluoride;
    if (dissolvedOxygen !== undefined) log.parameters.dissolvedOxygen = dissolvedOxygen;
    log.parameters.eColiPresent = updatedParams.eColiPresent;
    if (remarks !== undefined) log.remarks = remarks;
    log.calculatedWQI = score;
    log.qualityStatus = status;

    const updatedLog = await log.save();

    // Recalculate and update WaterSource status if needed
    if (status === 'Critical' || status === 'Unsafe') {
      await WaterSource.findByIdAndUpdate(waterSource._id, { status: 'contaminated' });
    }

    // Create Audit Log
    const AuditLog = require('../models/AuditLog');
    
    // Construct description of changes
    const changesList = [];
    if (originalParameters.ph !== updatedLog.parameters.ph) {
      changesList.push(`pH (${originalParameters.ph} -> ${updatedLog.parameters.ph})`);
    }
    if (originalParameters.turbidity !== updatedLog.parameters.turbidity) {
      changesList.push(`Turbidity (${originalParameters.turbidity} -> ${updatedLog.parameters.turbidity})`);
    }
    if (originalParameters.tds !== updatedLog.parameters.tds) {
      changesList.push(`TDS (${originalParameters.tds} -> ${updatedLog.parameters.tds})`);
    }
    if (originalParameters.nitrates !== updatedLog.parameters.nitrates) {
      changesList.push(`Nitrates (${originalParameters.nitrates} -> ${updatedLog.parameters.nitrates})`);
    }
    if (originalParameters.fluoride !== updatedLog.parameters.fluoride) {
      changesList.push(`Fluoride (${originalParameters.fluoride} -> ${updatedLog.parameters.fluoride})`);
    }
    if (originalParameters.dissolvedOxygen !== updatedLog.parameters.dissolvedOxygen) {
      changesList.push(`DO (${originalParameters.dissolvedOxygen} -> ${updatedLog.parameters.dissolvedOxygen})`);
    }
    if (originalParameters.eColiPresent !== updatedLog.parameters.eColiPresent) {
      changesList.push(`E.Coli (${originalParameters.eColiPresent ? 'Detected' : 'Absent'} -> ${updatedLog.parameters.eColiPresent ? 'Detected' : 'Absent'})`);
    }
    if (originalParameters.remarks !== updatedLog.remarks) {
      changesList.push(`Remarks changed`);
    }

    const description = changesList.length > 0
      ? `Edited fields: ${changesList.join(', ')}`
      : 'Edited record (no fields modified)';

    await AuditLog.create({
      action: 'EDIT',
      performedBy: req.user._id,
      targetType: 'WaterTestLog',
      targetId: log._id,
      villageName: waterSource.villageName,
      waterSourceName: waterSource.name,
      changes: {
        before: originalParameters,
        after: {
          ph: updatedLog.parameters.ph,
          turbidity: updatedLog.parameters.turbidity,
          tds: updatedLog.parameters.tds,
          nitrates: updatedLog.parameters.nitrates,
          fluoride: updatedLog.parameters.fluoride,
          dissolvedOxygen: updatedLog.parameters.dissolvedOxygen,
          eColiPresent: updatedLog.parameters.eColiPresent,
          remarks: updatedLog.remarks
        }
      },
      description
    });

    res.status(200).json({
      success: true,
      data: updatedLog
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a water quality test log
// @route   DELETE /api/v1/logs/:id
// @access  Private (Admin)
exports.deleteWaterLog = async (req, res, next) => {
  try {
    const log = await WaterTestLog.findById(req.params.id).populate('waterSource');
    if (!log) {
      return res.status(404).json({ success: false, message: 'Log record not found' });
    }

    const originalParameters = {
      ph: log.parameters.ph,
      turbidity: log.parameters.turbidity,
      tds: log.parameters.tds,
      nitrates: log.parameters.nitrates,
      fluoride: log.parameters.fluoride,
      dissolvedOxygen: log.parameters.dissolvedOxygen,
      eColiPresent: log.parameters.eColiPresent,
      remarks: log.remarks,
      calculatedWQI: log.calculatedWQI,
      qualityStatus: log.qualityStatus
    };

    const villageName = log.villageName;
    const waterSourceName = log.waterSource?.name || 'Unknown Source';

    await log.deleteOne();

    // Create Audit Log
    const AuditLog = require('../models/AuditLog');
    await AuditLog.create({
      action: 'DELETE',
      performedBy: req.user._id,
      targetType: 'WaterTestLog',
      targetId: req.params.id,
      villageName,
      waterSourceName,
      changes: {
        before: originalParameters,
        after: null
      },
      description: `Deleted water quality entry (WQI: ${originalParameters.calculatedWQI}, Status: ${originalParameters.qualityStatus})`
    });

    res.status(200).json({
      success: true,
      message: 'Water quality test record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
