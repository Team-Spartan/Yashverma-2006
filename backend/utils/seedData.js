/**
 * Default Seed Data for JalDrishti Rural Water Quality Monitoring System
 */

const sampleVillages = [
  { id: "v1", name: "Rampur", district: "Varanasi", state: "Uttar Pradesh", population: 3400, totalSources: 14, safeSources: 12, activeAlerts: 1 },
  { id: "v2", name: "Shivpur", district: "Varanasi", state: "Uttar Pradesh", population: 2800, totalSources: 10, safeSources: 7, activeAlerts: 2 },
  { id: "v3", name: "Sundarpur", district: "Mirzapur", state: "Uttar Pradesh", population: 4100, totalSources: 18, safeSources: 16, activeAlerts: 0 },
  { id: "v4", name: "Devgarh", district: "Sonbhadra", state: "Uttar Pradesh", population: 1900, totalSources: 8, safeSources: 4, activeAlerts: 3 },
  { id: "v5", name: "Chandpur", district: "Varanasi", state: "Uttar Pradesh", population: 3100, totalSources: 12, safeSources: 11, activeAlerts: 0 }
];

const sampleUsers = [
  {
    id: "u1",
    name: "Yash Sharma",
    email: "yash.leader@jaldrishti.org",
    role: "admin",
    village: "Rampur",
    district: "Varanasi",
    phone: "+91 98765 43210",
    registeredDate: "2026-07-01"
  },
  {
    id: "u2",
    name: "Ankit Kumar",
    email: "ankit.worker@jaldrishti.org",
    role: "health_worker",
    village: "Rampur",
    district: "Varanasi",
    phone: "+91 98123 45678",
    registeredDate: "2026-07-08"
  },
  {
    id: "u3",
    name: "Nitish Singh",
    email: "nitish.worker@jaldrishti.org",
    role: "health_worker",
    village: "Shivpur",
    district: "Varanasi",
    phone: "+91 97111 22334",
    registeredDate: "2026-07-15"
  },
  {
    id: "u4",
    name: "Rohit Verma",
    email: "rohit.citizen@jaldrishti.org",
    role: "community_member",
    village: "Devgarh",
    district: "Sonbhadra",
    phone: "+91 95999 88776",
    registeredDate: "2026-07-20"
  },
  {
    id: "u5",
    name: "Pooja Devi",
    email: "pooja.asha@jaldrishti.org",
    role: "health_worker",
    village: "Sundarpur",
    district: "Mirzapur",
    phone: "+91 98333 44556",
    registeredDate: "2026-07-24"
  },
  {
    id: "u6",
    name: "Sanjay Patel",
    email: "sanjay.admin@jaldrishti.org",
    role: "admin",
    village: "Chandpur",
    district: "Varanasi",
    phone: "+91 94150 12345",
    registeredDate: "2026-07-27"
  }
];

const sampleLogs = [
  // Rampur logs
  {
    id: "log-101",
    village: "Rampur",
    district: "Varanasi",
    sourceName: "Central Panchayat Handpump #1",
    sourceType: "Handpump",
    pH: 7.4,
    tds: 320,
    turbidity: 1.2,
    fluoride: 0.8,
    nitrate: 18,
    bacterialCount: 0,
    dissolvedOxygen: 6.8,
    safetyStatus: "Safe",
    wqiScore: 92,
    testedBy: "Ankit Kumar",
    testedDate: "2026-07-24",
    notes: "Routine monthly check. Parameter values strictly within safe BIS limits."
  },
  {
    id: "log-102",
    village: "Rampur",
    district: "Varanasi",
    sourceName: "East School Tap Line",
    sourceType: "Tap Water",
    pH: 7.2,
    tds: 410,
    turbidity: 2.1,
    fluoride: 0.9,
    nitrate: 22,
    bacterialCount: 0,
    dissolvedOxygen: 6.5,
    safetyStatus: "Safe",
    wqiScore: 88,
    testedBy: "Ankit Kumar",
    testedDate: "2026-07-15",
    notes: "Minor turbidity after rainwater inflow, chlorination working fine."
  },
  {
    id: "log-103",
    village: "Rampur",
    district: "Varanasi",
    sourceName: "South Market Tube Well",
    sourceType: "TubeWell",
    pH: 6.3,
    tds: 620,
    turbidity: 4.8,
    fluoride: 1.4,
    nitrate: 38,
    bacterialCount: 3,
    dissolvedOxygen: 5.2,
    safetyStatus: "Warning",
    wqiScore: 61,
    testedBy: "Ankit Kumar",
    testedDate: "2026-06-20",
    notes: "Slight acidity and bacterial presence. Advised boiling before drinking."
  },

  // Shivpur logs
  {
    id: "log-201",
    village: "Shivpur",
    district: "Varanasi",
    sourceName: "Primary Health Center Borewell",
    sourceType: "TubeWell",
    pH: 6.8,
    tds: 580,
    turbidity: 3.5,
    fluoride: 1.6,
    nitrate: 42,
    bacterialCount: 2,
    dissolvedOxygen: 5.5,
    safetyStatus: "Warning",
    wqiScore: 64,
    testedBy: "Nitish Singh",
    testedDate: "2026-07-20",
    notes: "Elevated fluoride detected. Fluoride removal filter maintenance requested."
  },
  {
    id: "log-202",
    village: "Shivpur",
    district: "Varanasi",
    sourceName: "North Basti Community Well",
    sourceType: "Well",
    pH: 8.8,
    tds: 1100,
    turbidity: 8.5,
    fluoride: 2.1,
    nitrate: 58,
    bacterialCount: 14,
    dissolvedOxygen: 4.1,
    safetyStatus: "Hazardous",
    wqiScore: 35,
    testedBy: "Nitish Singh",
    testedDate: "2026-07-10",
    notes: "High bacterial load and high nitrate due to agricultural runoff. Source sealed!"
  },

  // Devgarh logs
  {
    id: "log-301",
    village: "Devgarh",
    district: "Sonbhadra",
    sourceName: "Tribal Hamlet Deep Borewell",
    sourceType: "Handpump",
    pH: 8.9,
    tds: 1450,
    turbidity: 6.2,
    fluoride: 2.8,
    nitrate: 65,
    bacterialCount: 8,
    dissolvedOxygen: 3.9,
    safetyStatus: "Hazardous",
    wqiScore: 28,
    testedBy: "Yash Sharma",
    testedDate: "2026-07-22",
    notes: "Severe fluoride contamination (>2.8 mg/L). Fluorosis cases reported nearby."
  },
  {
    id: "log-302",
    village: "Devgarh",
    district: "Sonbhadra",
    sourceName: "West Pond Filtration Point",
    sourceType: "Pond",
    pH: 6.2,
    tds: 890,
    turbidity: 7.1,
    fluoride: 1.3,
    nitrate: 52,
    bacterialCount: 19,
    dissolvedOxygen: 3.5,
    safetyStatus: "Hazardous",
    wqiScore: 32,
    testedBy: "Yash Sharma",
    testedDate: "2026-06-28",
    notes: "Heavy algal bloom and high E.Coli presence. Warning poster attached."
  },

  // Sundarpur logs
  {
    id: "log-401",
    village: "Sundarpur",
    district: "Mirzapur",
    sourceName: "Jal Jeevan Mission Solar Pump",
    sourceType: "Tap Water",
    pH: 7.5,
    tds: 280,
    turbidity: 0.8,
    fluoride: 0.7,
    nitrate: 14,
    bacterialCount: 0,
    dissolvedOxygen: 7.1,
    safetyStatus: "Safe",
    wqiScore: 96,
    testedBy: "Ankit Kumar",
    testedDate: "2026-07-25",
    notes: "Excellent water clarity. All automated sensor values optimal."
  },
  {
    id: "log-402",
    village: "Sundarpur",
    district: "Mirzapur",
    sourceName: "Anganwadi Water Storage Tank",
    sourceType: "Tap Water",
    pH: 7.3,
    tds: 310,
    turbidity: 1.0,
    fluoride: 0.6,
    nitrate: 16,
    bacterialCount: 0,
    dissolvedOxygen: 6.9,
    safetyStatus: "Safe",
    wqiScore: 94,
    testedBy: "Ankit Kumar",
    testedDate: "2026-07-02",
    notes: "Clean drinking water tank verified for preschool children."
  },

  // Chandpur logs
  {
    id: "log-501",
    village: "Chandpur",
    district: "Varanasi",
    sourceName: "Main Village Square Handpump",
    sourceType: "Handpump",
    pH: 7.1,
    tds: 390,
    turbidity: 1.4,
    fluoride: 0.8,
    nitrate: 24,
    bacterialCount: 0,
    dissolvedOxygen: 6.4,
    safetyStatus: "Safe",
    wqiScore: 90,
    testedBy: "Nitish Singh",
    testedDate: "2026-07-18",
    notes: "Regular testing conducted. Pump body well-maintained."
  }
];

const sampleIssues = [
  {
    id: "issue-1",
    title: "Sewer Line Leakage Near North Basti Well",
    description: "Domestic waste water seepage detected near community open well. Water color turned yellowish-brown.",
    village: "Shivpur",
    district: "Varanasi",
    locationDetails: "North Ward 3, opposite Primary School",
    issueType: "Contamination",
    severity: "Critical",
    status: "In Progress",
    reportedBy: "Nitish Singh",
    reportedDate: "2026-07-21",
    assignedTo: "Jal Nigam Assistant Engineer",
    actionNotes: "Repair crew dispatched with repair pipe clamps and chlorination tablets."
  },
  {
    id: "issue-2",
    title: "Handpump Handle Broken & Valve Leaking",
    description: "Main village square handpump cylinder broken. Water gushing into nearby muddy puddle.",
    village: "Devgarh",
    district: "Sonbhadra",
    locationDetails: "Main Market Intersection",
    issueType: "Pump Failure",
    severity: "High",
    status: "Pending",
    reportedBy: "Rohit Verma",
    reportedDate: "2026-07-23",
    assignedTo: "Block Development Officer",
    actionNotes: "Awaiting mechanic replacement part allocation."
  },
  {
    id: "issue-3",
    title: "High Fluoride Contamination Alert in Deep Borewell",
    description: "Test results show Fluoride at 2.8 mg/L. Multiple elders complaining of joint stiffness.",
    village: "Devgarh",
    district: "Sonbhadra",
    locationDetails: "Tribal Settlement Sector 2",
    issueType: "Contamination",
    severity: "Critical",
    status: "Under Review",
    reportedBy: "Yash Sharma",
    reportedDate: "2026-07-22",
    assignedTo: "District Health Officer & Jal Shakti Abhiyan",
    actionNotes: "Proposal submitted for installing RO-based Community Water Purification Plant."
  },
  {
    id: "issue-4",
    title: "Pipeline Burst on Main Supply Feeder",
    description: "Main feeder line damaged during road widening project. Clean water being wasted.",
    village: "Rampur",
    district: "Varanasi",
    locationDetails: "GT Road Junction near Feeder Valve #4",
    issueType: "Pipe Leakage",
    severity: "Medium",
    status: "Resolved",
    reportedBy: "Ankit Kumar",
    reportedDate: "2026-07-10",
    assignedTo: "Panchayat Secretary",
    actionNotes: "Pipe section welded and sealed on July 12. Water flow restored with normal pressure.",
    resolvedDate: "2026-07-12"
  },
  {
    id: "issue-5",
    title: "Fertilizer Runoff entering Pond Source",
    description: "Monsoon agricultural runoff draining direct into local pond causing sudden turbidity spike.",
    village: "Shivpur",
    district: "Varanasi",
    locationDetails: "East Farm Boundary Drain",
    issueType: "Chemical Runoff",
    severity: "High",
    status: "Pending",
    reportedBy: "Nitish Singh",
    reportedDate: "2026-07-26",
    assignedTo: "Gram Panchayat Environment Committee",
    actionNotes: "Constructing temporary soil bund to divert farm runoff away from water reservoir."
  }
];

const sampleTrends = {
  monthlyData: [
    { month: "Jan 2026", safeLogs: 24, warningLogs: 5, hazardousLogs: 2, avgpH: 7.3, avgTDS: 340, totalIssues: 4 },
    { month: "Feb 2026", safeLogs: 26, warningLogs: 4, hazardousLogs: 2, avgpH: 7.4, avgTDS: 355, totalIssues: 3 },
    { month: "Mar 2026", safeLogs: 22, warningLogs: 6, hazardousLogs: 3, avgpH: 7.2, avgTDS: 390, totalIssues: 6 },
    { month: "Apr 2026", safeLogs: 20, warningLogs: 8, hazardousLogs: 4, avgpH: 7.1, avgTDS: 420, totalIssues: 8 },
    { month: "May 2026", safeLogs: 18, warningLogs: 9, hazardousLogs: 5, avgpH: 6.9, avgTDS: 460, totalIssues: 11 },
    { month: "Jun 2026", safeLogs: 19, warningLogs: 11, hazardousLogs: 6, avgpH: 6.8, avgTDS: 495, totalIssues: 14 },
    { month: "Jul 2026", safeLogs: 28, warningLogs: 8, hazardousLogs: 5, avgpH: 7.2, avgTDS: 430, totalIssues: 9 }
  ]
};

module.exports = {
  sampleVillages,
  sampleUsers,
  sampleLogs,
  sampleIssues,
  sampleTrends
};
