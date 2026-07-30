const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { calculateWQI } = require('./utils/wqiCalculator');
const { sampleVillages, sampleUsers, sampleLogs, sampleIssues, sampleTrends } = require('./utils/seedData');
const { JWT_SECRET, authenticateToken, requireRole } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

// In-Memory Database collections (pre-seeded for out-of-the-box operation)
let users = [...sampleUsers];
let waterLogs = [...sampleLogs];
let issueReports = [...sampleIssues];
let villages = [...sampleVillages];

// Helper to generate IDs
const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// Notifications storage
let notifications = [];

// Helper to create notification
const createNotification = (userId, issueId, issueTitle, oldStatus, newStatus, customMessage) => {
  const notification = {
    id: generateId('notif'),
    userId,
    issueId,
    issueTitle,
    oldStatus: oldStatus || '',
    newStatus: newStatus || '',
    message: customMessage || `Issue "${issueTitle}" status changed from ${oldStatus} to ${newStatus}`,
    read: false,
    createdAt: new Date().toISOString()
  };
  notifications.unshift(notification);
  return notification;
};

// -------------------------------------------------------------
// 1. AUTHENTICATION ENDPOINTS
// -------------------------------------------------------------

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  if (user.password && !bcrypt.compareSync(password || '', user.password)) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  if (!user.password) {
    const hashedPassword = bcrypt.hashSync(password || 'password123', 10);
    user.password = hashedPassword;
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role, village: user.village },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { password: _, ...userWithoutPassword } = user;

  return res.json({
    success: true,
    token,
    user: userWithoutPassword
  });
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role, village, district, phone } = req.body;

  // Validate required fields
  const errors = {};
  if (!name || name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }
  if (!email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Invalid email format';
  }
  if (!password || password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  if (!role) {
    errors.role = 'Role is required';
  } else if (!['admin', 'health_worker', 'community_member'].includes(role)) {
    errors.role = 'Invalid role selected';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: 'User with this email already exists' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = {
    id: generateId('usr'),
    name: name.trim(),
    email: email.toLowerCase(),
    password: hashedPassword,
    role: role || 'health_worker',
    village: village || 'Rampur',
    district: district || 'Varanasi',
    phone: phone || '+91 99999 88888',
    registeredDate: new Date().toISOString().split('T')[0]
  };

  users.push(newUser);

  const token = jwt.sign(
    { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, village: newUser.village },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { password: _, ...userWithoutPassword } = newUser;

  return res.status(201).json({
    success: true,
    message: 'Registration successful',
    token,
    user: userWithoutPassword
  });
});

// Get Current User Profile
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

// -------------------------------------------------------------
// 2. WATER QUALITY LOGS (CRUD)
// -------------------------------------------------------------

// GET all logs (with village & safetyStatus filters)
app.get('/api/water-logs', (req, res) => {
  const { village, safetyStatus, search } = req.query;
  let filtered = [...waterLogs];

  if (village && village !== 'All') {
    filtered = filtered.filter(l => l.village.toLowerCase() === village.toLowerCase());
  }
  if (safetyStatus && safetyStatus !== 'All') {
    filtered = filtered.filter(l => l.safetyStatus.toLowerCase() === safetyStatus.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(l =>
      l.sourceName.toLowerCase().includes(q) ||
      l.village.toLowerCase().includes(q) ||
      l.testedBy.toLowerCase().includes(q)
    );
  }

  // Sort latest first
  filtered.sort((a, b) => new Date(b.testedDate) - new Date(a.testedDate));

  res.json({
    success: true,
    count: filtered.length,
    data: filtered
  });
});

// GET single log by ID
app.get('/api/water-logs/:id', (req, res) => {
  const log = waterLogs.find(l => l.id === req.params.id);
  if (!log) {
    return res.status(404).json({ success: false, message: 'Water test log not found' });
  }
  res.json({ success: true, data: log });
});

// POST Create new Water Quality Log
app.post('/api/water-logs', authenticateToken, (req, res) => {
  const {
    village,
    district,
    sourceName,
    sourceType,
    pH,
    tds,
    turbidity,
    fluoride,
    nitrate,
    bacterialCount,
    dissolvedOxygen,
    testedBy,
    testedDate,
    notes
  } = req.body;

  if (!sourceName || pH === undefined || tds === undefined) {
    return res.status(400).json({ success: false, message: 'Source name, pH, and TDS are required' });
  }

  // Calculate WQI and Safety Status automatically using BIS standards
  const evaluation = calculateWQI({
    pH: parseFloat(pH),
    tds: parseFloat(tds),
    turbidity: parseFloat(turbidity || 0),
    fluoride: parseFloat(fluoride || 0),
    nitrate: parseFloat(nitrate || 0),
    bacterialCount: parseInt(bacterialCount || 0)
  });

  const newLog = {
    id: generateId('log'),
    village: village || req.user.village || 'Rampur',
    district: district || 'Varanasi',
    sourceName,
    sourceType: sourceType || 'Handpump',
    pH: parseFloat(pH),
    tds: parseFloat(tds),
    turbidity: parseFloat(turbidity || 0),
    fluoride: parseFloat(fluoride || 0),
    nitrate: parseFloat(nitrate || 0),
    bacterialCount: parseInt(bacterialCount || 0),
    dissolvedOxygen: parseFloat(dissolvedOxygen || 6.5),
    safetyStatus: evaluation.safetyStatus,
    wqiScore: evaluation.wqiScore,
    testedBy: testedBy || req.user.name || 'Health Worker',
    testedDate: testedDate || new Date().toISOString().split('T')[0],
    notes: notes || evaluation.summary
  };

  waterLogs.unshift(newLog);

  // Update village summary counters
  const v = villages.find(vil => vil.name.toLowerCase() === newLog.village.toLowerCase());
  if (v) {
    if (newLog.safetyStatus === 'Hazardous') v.activeAlerts += 1;
  }

  // Notify admins if hazardous water detected
  if (newLog.safetyStatus === 'Hazardous' || newLog.safetyStatus === 'Warning') {
    users.filter(u => u.role === 'admin').forEach(admin => {
      createNotification(
        admin.id,
        null,
        `${newLog.sourceName} (${newLog.village})`,
        null,
        newLog.safetyStatus,
        `Alert: ${newLog.sourceName} in ${newLog.village} tested ${newLog.safetyStatus}. WQI Score: ${newLog.wqiScore}/100. Action may be required.`
      );
    });
  }

  res.status(201).json({
    success: true,
    message: 'Water test log created successfully',
    data: newLog,
    evaluation
  });
});

// PUT Update Water Log
app.put('/api/water-logs/:id', authenticateToken, (req, res) => {
  const index = waterLogs.findIndex(l => l.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Water test log not found' });
  }

  const existing = waterLogs[index];
  const updatedData = { ...existing, ...req.body };

  // Recalculate WQI
  const evaluation = calculateWQI({
    pH: parseFloat(updatedData.pH),
    tds: parseFloat(updatedData.tds),
    turbidity: parseFloat(updatedData.turbidity),
    fluoride: parseFloat(updatedData.fluoride),
    nitrate: parseFloat(updatedData.nitrate),
    bacterialCount: parseInt(updatedData.bacterialCount)
  });

  updatedData.wqiScore = evaluation.wqiScore;
  updatedData.safetyStatus = evaluation.safetyStatus;

  waterLogs[index] = updatedData;

  res.json({
    success: true,
    message: 'Water test log updated successfully',
    data: updatedData
  });
});

// DELETE Water Log
app.delete('/api/water-logs/:id', authenticateToken, (req, res) => {
  const initialLen = waterLogs.length;
  waterLogs = waterLogs.filter(l => l.id !== req.params.id);

  if (waterLogs.length === initialLen) {
    return res.status(404).json({ success: false, message: 'Water test log not found' });
  }

  res.json({ success: true, message: 'Water test log deleted successfully' });
});

// -------------------------------------------------------------
// 3. ISSUE REPORTING (CRUD)
// -------------------------------------------------------------

// GET All Issues (with pagination)
app.get('/api/issues', (req, res) => {
  const { village, status, severity, page = '1', limit = '6' } = req.query;
  let filtered = [...issueReports];

  if (village && village !== 'All') {
    filtered = filtered.filter(i => i.village.toLowerCase() === village.toLowerCase());
  }
  if (status && status !== 'All') {
    filtered = filtered.filter(i => i.status.toLowerCase() === status.toLowerCase());
  }
  if (severity && severity !== 'All') {
    filtered = filtered.filter(i => i.severity.toLowerCase() === severity.toLowerCase());
  }

  filtered.sort((a, b) => new Date(b.reportedDate) - new Date(a.reportedDate));

  const totalCount = filtered.length;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.max(1, Math.min(50, parseInt(limit)));
  const totalPages = Math.ceil(totalCount / limitNum);
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedData = filtered.slice(startIndex, startIndex + limitNum);

  res.json({
    success: true,
    count: paginatedData.length,
    totalCount,
    page: pageNum,
    limit: limitNum,
    totalPages,
    data: paginatedData
  });
});

// POST Create Issue Report
app.post('/api/issues', authenticateToken, (req, res) => {
  const { title, description, village, district, locationDetails, issueType, severity } = req.body;
  if (!title || !description) {
    return res.status(400).json({ success: false, message: 'Title and description are required' });
  }

  const newIssue = {
    id: generateId('issue'),
    title,
    description,
    village: village || req.user.village || 'Rampur',
    district: district || 'Varanasi',
    locationDetails: locationDetails || 'Main Village Center',
    issueType: issueType || 'Contamination',
    severity: severity || 'Medium',
    status: 'Pending',
    reportedBy: req.user.name || 'Community Resident',
    reportedDate: new Date().toISOString().split('T')[0],
    assignedTo: 'Gram Panchayat Officer',
    actionNotes: 'Incident logged. Waiting for authority triage.'
  };

  issueReports.unshift(newIssue);

  createNotification(
    req.user.id,
    newIssue.id,
    newIssue.title,
    null,
    'Pending',
    `Issue "${newIssue.title}" reported successfully in ${newIssue.village}. Status set to Pending.`
  );

  res.status(201).json({
    success: true,
    message: 'Water contamination issue reported successfully',
    data: newIssue
  });
});

// PUT Update Issue Status / Assignee (Admin & Health Worker)
app.put('/api/issues/:id', authenticateToken, (req, res) => {
  const index = issueReports.findIndex(i => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Issue report not found' });
  }

  const { status, assignedTo, actionNotes, severity } = req.body;
  const existing = issueReports[index];
  const oldStatus = existing.status;

  if (status) existing.status = status;
  if (assignedTo) existing.assignedTo = assignedTo;
  if (actionNotes) existing.actionNotes = actionNotes;
  if (severity) existing.severity = severity;

  if (status === 'Resolved') {
    existing.resolvedDate = new Date().toISOString().split('T')[0];
  }

  issueReports[index] = existing;

  // Trigger notification on status change
  if (status && status !== oldStatus) {
    const reporter = users.find(u => u.name === existing.reportedBy);
    const userId = reporter ? reporter.id : req.user.id;
    createNotification(userId, existing.id, existing.title, oldStatus, status);
  }

  // Trigger notification on assignment change (notify assignee)
  if (assignedTo && assignedTo !== existing.assignedTo) {
    const assigneeUser = users.find(u => u.name === assignedTo);
    if (assigneeUser) {
      createNotification(
        assigneeUser.id,
        existing.id,
        existing.title,
        null,
        existing.status,
        `Issue "${existing.title}" assigned to you (${assignedTo}). Current status: ${existing.status}.`
      );
    }
  }

  res.json({
    success: true,
    message: 'Issue report status updated',
    data: existing,
    notification: status && status !== oldStatus ? { triggered: true } : { triggered: false }
  });
});

// DELETE Issue Report
app.delete('/api/issues/:id', authenticateToken, (req, res) => {
  const initialLen = issueReports.length;
  issueReports = issueReports.filter(i => i.id !== req.params.id);

  if (issueReports.length === initialLen) {
    return res.status(404).json({ success: false, message: 'Issue report not found' });
  }

  res.json({ success: true, message: 'Issue report deleted' });
});

// -------------------------------------------------------------
// 4. NOTIFICATIONS
// -------------------------------------------------------------

// GET Notifications for current user
app.get('/api/notifications', authenticateToken, (req, res) => {
  const { unreadOnly } = req.query;
  let filtered = notifications.filter(n => n.userId === req.user.id);

  if (unreadOnly === 'true') {
    filtered = filtered.filter(n => !n.read);
  }

  res.json({
    success: true,
    count: filtered.length,
    data: filtered
  });
});

// PUT Mark notification as read
app.put('/api/notifications/:id/read', authenticateToken, (req, res) => {
  const notif = notifications.find(n => n.id === req.params.id);
  if (!notif) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }
  notif.read = true;
  res.json({ success: true, message: 'Notification marked as read', data: notif });
});

// PUT Mark all notifications as read (user-scoped)
app.put('/api/notifications/read-all', authenticateToken, (req, res) => {
  let count = 0;
  notifications.forEach(n => {
    if (n.userId === req.user.id && !n.read) {
      n.read = true;
      count++;
    }
  });
  res.json({ success: true, message: `${count} notifications marked as read`, count });
});

// DELETE Remove a notification
app.delete('/api/notifications/:id', authenticateToken, (req, res) => {
  const index = notifications.findIndex(n => n.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }
  const removed = notifications.splice(index, 1)[0];
  res.json({ success: true, message: 'Notification removed', data: removed });
});

// -------------------------------------------------------------
// 5. VILLAGES & DASHBOARD STATS
// -------------------------------------------------------------

// GET Villages
app.get('/api/villages', (req, res) => {
  res.json({ success: true, count: villages.length, data: villages });
});

// GET Dashboard Metrics Summary
app.get('/api/stats/dashboard', (req, res) => {
  const totalLogs = waterLogs.length;
  const safeCount = waterLogs.filter(l => l.safetyStatus === 'Safe').length;
  const warningCount = waterLogs.filter(l => l.safetyStatus === 'Warning').length;
  const hazardousCount = waterLogs.filter(l => l.safetyStatus === 'Hazardous').length;
  const safePercentage = totalLogs > 0 ? Math.round((safeCount / totalLogs) * 100) : 0;

  const totalIssues = issueReports.length;
  const pendingIssues = issueReports.filter(i => i.status === 'Pending' || i.status === 'Under Review').length;
  const criticalIssues = issueReports.filter(i => i.severity === 'Critical' && i.status !== 'Resolved').length;

  const avgWQI = totalLogs > 0 ? Math.round(waterLogs.reduce((acc, l) => acc + (l.wqiScore || 75), 0) / totalLogs) : 80;

  res.json({
    success: true,
    data: {
      totalLogs,
      safeCount,
      warningCount,
      hazardousCount,
      safePercentage,
      totalIssues,
      pendingIssues,
      criticalIssues,
      avgWQI,
      villagesCount: villages.length
    }
  });
});

// GET Users List (Admin)
app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    count: users.length,
    data: users
  });
});

// GET System Activity Stats for Admin Dashboard Charts (raw dump)
app.get('/api/stats/activity', (req, res) => {
  res.json({
    success: true,
    data: {
      usersList: users,
      waterLogs: waterLogs,
      issueReports: issueReports,
      totalUsers: users.length,
      totalLogs: waterLogs.length,
      totalIssues: issueReports.length
    }
  });
});

// GET Aggregated Activity Stats for Chart.js (grouped by day/week with range filter)
// Query params: range=7days|30days|allTime  granularity=daily|weekly
app.get('/api/admin/activity-stats', (req, res) => {
  const { range = '30days', granularity = 'daily' } = req.query;

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  let daysToInclude = 30;
  if (range === '7days') daysToInclude = 7;
  if (range === 'allTime') daysToInclude = 90;

  const dateMap = {};
  const dateLabels = [];

  for (let i = daysToInclude - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dateMap[dateStr] = { signups: 0, logs: 0, issues: 0 };
    dateLabels.push(dateStr);
  }

  // Aggregate User Signups (by registeredDate)
  users.forEach(u => {
    const regDate = u.registeredDate || '';
    const cleanDate = regDate.split('T')[0];
    if (dateMap[cleanDate]) dateMap[cleanDate].signups += 1;
  });

  // Aggregate Water Quality Entries (by testedDate)
  waterLogs.forEach(l => {
    const tDate = l.testedDate || '';
    const cleanDate = tDate.split('T')[0];
    if (dateMap[cleanDate]) dateMap[cleanDate].logs += 1;
  });

  // Aggregate Issue Reports (by reportedDate)
  issueReports.forEach(is => {
    const rDate = is.reportedDate || '';
    const cleanDate = rDate.split('T')[0];
    if (dateMap[cleanDate]) dateMap[cleanDate].issues += 1;
  });

  // Format display labels (e.g., "Jul 15")
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formattedLabels = dateLabels.map(d => {
    const parts = d.split('-');
    const mIdx = parseInt(parts[1], 10) - 1;
    return `${monthNames[mIdx]} ${parseInt(parts[2], 10)}`;
  });

  const signupsData = dateLabels.map(d => dateMap[d].signups);
  const logsData = dateLabels.map(d => dateMap[d].logs);
  const issuesData = dateLabels.map(d => dateMap[d].issues);

  let signups;
  let submissions;

  if (granularity === 'weekly') {
    const weeklySignups = [];
    const weeklySubmissions = [];

    for (let i = 0; i < dateLabels.length; i += 7) {
      const chunkLabels = formattedLabels.slice(i, i + 7);
      if (chunkLabels.length > 0) {
        const label = chunkLabels.length > 1
          ? `${chunkLabels[0]} - ${chunkLabels[chunkLabels.length - 1]}`
          : chunkLabels[0];
        weeklySignups.push({ label, value: signupsData.slice(i, i + 7).reduce((a, b) => a + b, 0) });
        const subVal = logsData.slice(i, i + 7).reduce((a, b) => a + b, 0) + issuesData.slice(i, i + 7).reduce((a, b) => a + b, 0);
        weeklySubmissions.push({ label, value: subVal });
      }
    }
    signups = weeklySignups;
    submissions = weeklySubmissions;
  } else {
    signups = formattedLabels.map((l, i) => ({ label: l, value: signupsData[i] }));
    submissions = formattedLabels.map((l, i) => ({ label: l, value: logsData[i] + issuesData[i] }));
  }

  // Role distribution
  const roleCounts = {};
  users.forEach(u => {
    const r = u.role || 'viewer';
    roleCounts[r] = (roleCounts[r] || 0) + 1;
  });
  const roleDistribution = Object.entries(roleCounts).map(([label, value]) => ({ label, value }));

  const totalSubmissions = submissions.reduce((s, d) => s + d.value, 0);
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
  const activeUsers = users.filter(u => {
    const regDate = u.registeredDate ? new Date(u.registeredDate) : null;
    return regDate && regDate >= oneMonthAgo;
  }).length;

  const issuesResolved = issueReports.filter(i => i.status === 'Resolved').length;

  const result = {
    signups,
    submissions,
    roleDistribution,
    totalUsers: users.length,
    totalSubmissions,
    activeUsers,
    issuesResolved
  };

  res.json({ success: true, data: result });
});

// GET Trends Data for Chart.js
app.get('/api/stats/trends', (req, res) => {
  res.json({
    success: true,
    data: sampleTrends
  });
});

// POST Data Reset / Re-seed
app.post('/api/seed', (req, res) => {
  users = [...sampleUsers];
  waterLogs = [...sampleLogs];
  issueReports = [...sampleIssues];
  villages = [...sampleVillages];
  res.json({ success: true, message: 'Database reset to initial JalDrishti dataset.' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    service: 'JalDrishti Water Quality Monitoring API',
    status: 'Healthy',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` JalDrishti Rural Water Quality API Server Ready`);
  console.log(` Running on port: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
