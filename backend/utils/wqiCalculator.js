/**
 * Water Quality Index (WQI) Calculator & Parameter Health Evaluator
 * Based on Bureau of Indian Standards (BIS IS 10500:2012)
 */

function calculateWQI(params) {
  const { pH = 7.2, tds = 300, turbidity = 1.5, fluoride = 0.8, nitrate = 20, bacterialCount = 0 } = params;

  let penalty = 0;
  const issues = [];

  // pH Evaluation (Ideal: 6.5 - 8.5)
  if (pH < 6.5) {
    const diff = 6.5 - pH;
    penalty += diff * 15;
    issues.push(`Acidic water (pH ${pH}). Risk of pipe corrosion and metal leaching.`);
  } else if (pH > 8.5) {
    const diff = pH - 8.5;
    penalty += diff * 15;
    issues.push(`Alkaline water (pH ${pH}). May cause bitter taste and skin irritation.`);
  }

  // TDS Evaluation (Ideal: < 500 ppm, Max Permissible: 2000 ppm)
  if (tds > 2000) {
    penalty += 35;
    issues.push(`Critical TDS (${tds} mg/L). Highly mineralized/saline water.`);
  } else if (tds > 500) {
    penalty += ((tds - 500) / 1500) * 20;
    issues.push(`Elevated TDS (${tds} mg/L). High total dissolved solids.`);
  }

  // Turbidity Evaluation (Ideal: < 1 NTU, Max Permissible: 5 NTU)
  if (turbidity > 5) {
    penalty += Math.min(30, (turbidity - 5) * 4 + 15);
    issues.push(`High Turbidity (${turbidity} NTU). Cloudy water; high pathogen risk.`);
  } else if (turbidity > 1) {
    penalty += (turbidity - 1) * 2.5;
  }

  // Fluoride Evaluation (Ideal: 0.6 - 1.2 mg/L, Max Permissible: 1.5 mg/L)
  if (fluoride > 1.5) {
    penalty += (fluoride - 1.5) * 25 + 15;
    issues.push(`High Fluoride (${fluoride} mg/L). Risk of Fluorosis (dental/skeletal).`);
  } else if (fluoride < 0.5) {
    penalty += 3; // Slight penalty for lack of dental protection
  }

  // Nitrate Evaluation (Max Limit: 45 mg/L)
  if (nitrate > 45) {
    penalty += (nitrate - 45) * 0.8 + 15;
    issues.push(`High Nitrate (${nitrate} mg/L). Risk of Blue Baby Syndrome (Methemoglobinemia).`);
  }

  // Bacterial Evaluation (Max Limit: 0 CFU/100ml)
  if (bacterialCount > 0) {
    penalty += Math.min(40, bacterialCount * 5 + 20);
    issues.push(`Bacterial Contamination Detected (${bacterialCount} CFU/100ml). Cholera/Typhoid risk.`);
  }

  // WQI Score computation (100 = Perfect, 0 = Extremely Contaminated)
  const score = Math.max(0, Math.min(100, Math.round(100 - penalty)));

  let safetyStatus = 'Safe';
  if (score < 50 || bacterialCount > 5 || fluoride > 2.0 || nitrate > 70) {
    safetyStatus = 'Hazardous';
  } else if (score < 75 || issues.length > 0) {
    safetyStatus = 'Warning';
  }

  return {
    wqiScore: score,
    safetyStatus,
    issues,
    summary: issues.length === 0 ? 'Water parameters are within BIS IS 10500 safe drinking limits.' : issues.join(' ')
  };
}

module.exports = { calculateWQI };
