// Water Quality Parameters Definition & Telemetry Service

export const WATER_PARAMETERS = [
  {
    id: 'ph',
    name: 'pH Level',
    unit: 'pH',
    minSafe: 6.5,
    maxSafe: 8.5,
    description: 'Acidity / Alkalinity level of water source',
    idealRange: '6.5 – 8.5 pH',
    category: 'Chemical Balance'
  },
  {
    id: 'turbidity',
    name: 'Turbidity',
    unit: 'NTU',
    minSafe: 0.0,
    maxSafe: 5.0,
    description: 'Cloudiness / suspended particulate matter',
    idealRange: '0.0 – 5.0 NTU',
    category: 'Physical Quality'
  },
  {
    id: 'do',
    name: 'Dissolved Oxygen (DO)',
    unit: 'mg/L',
    minSafe: 6.5,
    maxSafe: 14.0,
    description: 'Oxygen concentration in water body',
    idealRange: '6.5 – 14.0 mg/L',
    category: 'Biological / Health'
  },
  {
    id: 'tds',
    name: 'Total Dissolved Solids (TDS)',
    unit: 'ppm',
    minSafe: 50,
    maxSafe: 500,
    description: 'Concentration of dissolved mineral salts',
    idealRange: '50 – 500 ppm',
    category: 'Mineral Content'
  },
  {
    id: 'chlorine',
    name: 'Free Chlorine',
    unit: 'mg/L',
    minSafe: 0.2,
    maxSafe: 2.0,
    description: 'Residual disinfectant chemical concentration',
    idealRange: '0.2 – 2.0 mg/L',
    category: 'Disinfection'
  },
  {
    id: 'nitrate',
    name: 'Nitrate Content',
    unit: 'mg/L',
    minSafe: 0.0,
    maxSafe: 10.0,
    description: 'Agricultural runoff & nitrogenous compound level',
    idealRange: '0.0 – 10.0 mg/L',
    category: 'Contamination'
  },
  {
    id: 'temperature',
    name: 'Water Temperature',
    unit: '°C',
    minSafe: 15.0,
    maxSafe: 25.0,
    description: 'Thermal state of water supply source',
    idealRange: '15.0 – 25.0 °C',
    category: 'Physical Parameter'
  }
];

// Helper to generate deterministic sample telemetry readings over the last 90 days
const generateSampleReadings = () => {
  const readings = [];
  const now = Date.now();
  const threeHoursInMs = 3 * 60 * 60 * 1000;
  const totalSteps = 90 * 8; // 90 days, 8 readings per day = 720 samples

  for (let i = 0; i < totalSteps; i++) {
    const timestamp = now - i * threeHoursInMs;

    // Pseudo-random deterministic variations using sine/cosine curves based on step index
    const ph = Number((7.2 + Math.sin(i * 0.15) * 0.85 + Math.cos(i * 0.05) * 0.35).toFixed(2));
    const turbidity = Number((2.1 + Math.sin(i * 0.2) * 1.8 + (i % 17 === 0 ? 3.2 : 0)).toFixed(2));
    const doVal = Number((8.4 + Math.cos(i * 0.12) * 1.9).toFixed(2));
    const tds = Number((280 + Math.sin(i * 0.08) * 110 + (i % 23 === 0 ? 140 : 0)).toFixed(1));
    const chlorine = Number((1.1 + Math.sin(i * 0.25) * 0.65).toFixed(2));
    const nitrate = Number((3.5 + Math.cos(i * 0.18) * 2.8 + (i % 31 === 0 ? 4.5 : 0)).toFixed(2));
    const temperature = Number((20.5 + Math.sin(i * 0.04) * 4.2).toFixed(1));

    readings.push({
      id: `sample-${i}`,
      timestamp,
      createdAt: new Date(timestamp).toISOString(),
      ph,
      turbidity: Math.max(0.1, turbidity),
      do: Math.max(3.0, doVal),
      tds: Math.max(30, tds),
      chlorine: Math.max(0.05, chlorine),
      nitrate: Math.max(0.2, nitrate),
      temperature
    });
  }

  return readings;
};

const cachedReadings = generateSampleReadings();

export const waterQualityService = {
  // Get all sample parameter telemetry readings
  getReadings: () => cachedReadings,

  // Filter readings by selected time range
  filterReadingsByRange: (readings, range, customStartDate, customEndDate) => {
    if (!readings || readings.length === 0) return [];
    const now = Date.now();

    if (range === '24h') {
      const boundary = now - 24 * 60 * 60 * 1000;
      return readings.filter((r) => r.timestamp >= boundary);
    }

    if (range === '7d') {
      const boundary = now - 7 * 24 * 60 * 60 * 1000;
      return readings.filter((r) => r.timestamp >= boundary);
    }

    if (range === '30d') {
      const boundary = now - 30 * 24 * 60 * 60 * 1000;
      return readings.filter((r) => r.timestamp >= boundary);
    }

    if (range === '90d') {
      const boundary = now - 90 * 24 * 60 * 60 * 1000;
      return readings.filter((r) => r.timestamp >= boundary);
    }

    if (range === 'custom') {
      let filtered = [...readings];
      if (customStartDate) {
        const startTs = new Date(customStartDate).getTime();
        filtered = filtered.filter((r) => r.timestamp >= startTs);
      }
      if (customEndDate) {
        const endTs = new Date(customEndDate).setHours(23, 59, 59, 999);
        filtered = filtered.filter((r) => r.timestamp <= endTs);
      }
      return filtered;
    }

    return readings;
  },

  // Calculate Average, Min, and Max statistics for the chosen parameter
  calculateStats: (readings, paramId) => {
    const paramDef = WATER_PARAMETERS.find((p) => p.id === paramId) || WATER_PARAMETERS[0];

    if (!readings || readings.length === 0) {
      return {
        paramDef,
        count: 0,
        avg: 0,
        min: 0,
        max: 0,
        status: 'No Data Available',
        statusClass: 'warning',
        inRangePercentage: 0
      };
    }

    const values = readings
      .map((r) => r[paramId])
      .filter((v) => typeof v === 'number' && !isNaN(v));

    if (values.length === 0) {
      return {
        paramDef,
        count: 0,
        avg: 0,
        min: 0,
        max: 0,
        status: 'No Data Available',
        statusClass: 'warning',
        inRangePercentage: 0
      };
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = Number((sum / values.length).toFixed(2));

    // Calculate percentage of readings within safe standards
    const safeCount = values.filter((v) => v >= paramDef.minSafe && v <= paramDef.maxSafe).length;
    const inRangePercentage = Math.round((safeCount / values.length) * 100);

    // Status evaluation
    let status = 'Optimal / Safe';
    let statusClass = 'success';

    if (avg < paramDef.minSafe || avg > paramDef.maxSafe) {
      status = 'Out of Safe Limits';
      statusClass = 'critical';
    } else if (inRangePercentage < 80) {
      status = 'Fluctuating / Caution';
      statusClass = 'warning';
    }

    return {
      paramDef,
      count: values.length,
      avg,
      min: Number(min.toFixed(2)),
      max: Number(max.toFixed(2)),
      status,
      statusClass,
      inRangePercentage
    };
  }
};
