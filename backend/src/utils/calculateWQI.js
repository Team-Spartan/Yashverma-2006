/**
 * Calculate Water Quality Index (WQI) based on Indian Standards (BIS 10500)
 * WQI formula calculates weighted score based on pH, Turbidity, TDS, Nitrates, Fluoride, E.Coli
 */
function calculateWQI(params) {
  const { ph, turbidity, tds, nitrates = 0, fluoride = 0, eColiPresent = false } = params;

  let penalty = 0;

  // pH check (Ideal: 6.5 - 8.5)
  if (ph < 6.5 || ph > 8.5) {
    const phDev = Math.abs(ph - 7.5);
    penalty += phDev * 15;
  }

  // Turbidity check (Ideal: < 1 NTU, Max permissible: 5 NTU)
  if (turbidity > 1) {
    penalty += (turbidity - 1) * 8;
  }

  // TDS check (Desirable: < 500, Permissible: < 2000)
  if (tds > 500) {
    penalty += ((tds - 500) / 100) * 5;
  }

  // Nitrates (Limit: 45 mg/L)
  if (nitrates > 45) {
    penalty += (nitrates - 45) * 1.5;
  }

  // Fluoride (Limit: 1.5 mg/L)
  if (fluoride > 1.5) {
    penalty += (fluoride - 1.5) * 20;
  }

  // E. Coli presence instantly downgrades safety
  if (eColiPresent) {
    penalty += 45;
  }

  const score = Math.max(0, Math.round(100 - penalty));

  let status = 'Excellent';
  if (score >= 85) status = 'Excellent';
  else if (score >= 70) status = 'Good';
  else if (score >= 50) status = 'Poor';
  else if (score >= 30) status = 'Unsafe';
  else status = 'Critical';

  return { score, status };
}

module.exports = { calculateWQI };
