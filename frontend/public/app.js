// Nexus API Control Center Frontend Application
document.addEventListener('DOMContentLoaded', () => {
  // State Store
  const state = {
    accessToken: localStorage.getItem('nexus_access_token') || '',
    refreshToken: localStorage.getItem('nexus_refresh_token') || '',
    user: JSON.parse(localStorage.getItem('nexus_user_data') || 'null'),
    autoRefreshInterval: null,
    usersList: [],
  };

  // DOM Elements - Tabs
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabPages = document.querySelectorAll('.tab-page');

  // DOM Elements - Health & Metrics
  const dbStatusBadge = document.getElementById('db-status-badge');
  const dbStatusText = document.getElementById('db-status-text');
  const redisStatusBadge = document.getElementById('redis-status-badge');
  const redisStatusText = document.getElementById('redis-status-text');
  const uptimeValue = document.getElementById('uptime-value');
  const lastUpdatedText = document.getElementById('last-updated-text');
  const memoryPercent = document.getElementById('memory-percent');
  const memoryUsageText = document.getElementById('memory-usage-text');
  const memoryBar = document.getElementById('memory-bar');
  const envModeText = document.getElementById('env-mode-text');
  const cpuCoresText = document.getElementById('cpu-cores-text');
  const cpuModelText = document.getElementById('cpu-model-text');
  const autoRefreshToggle = document.getElementById('auto-refresh-toggle');
  const btnRefreshHealth = document.getElementById('btn-refresh-health');
  const apiStatusBadge = document.getElementById('api-status-badge');

  // DOM Elements - Auth & Profile
  const authTabLogin = document.getElementById('auth-tab-login');
  const authTabRegister = document.getElementById('auth-tab-register');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');
  const btnQuickAdmin = document.getElementById('btn-quick-admin');
  const btnQuickUser = document.getElementById('btn-quick-user');
  const unauthStateBox = document.getElementById('unauth-state-box');
  const authStateBox = document.getElementById('auth-state-box');
  const userAvatarCircle = document.getElementById('user-avatar-circle');
  const userDisplayName = document.getElementById('user-display-name');
  const userDisplayEmail = document.getElementById('user-display-email');
  const userRoleBadge = document.getElementById('user-role-badge');
  const userVerifiedBadge = document.getElementById('user-verified-badge');
  const tokenCodeText = document.getElementById('token-code-text');
  const btnCopyToken = document.getElementById('btn-copy-token');
  const btnLogout = document.getElementById('btn-logout');
  const avatarFileInput = document.getElementById('avatar-file-input');
  const btnUploadAvatar = document.getElementById('btn-upload-avatar');

  // DOM Elements - Users
  const usersTableBody = document.getElementById('users-table-body');
  const userCountBadge = document.getElementById('user-count-badge');
  const userSearchInput = document.getElementById('user-search-input');
  const btnFetchUsers = document.getElementById('btn-fetch-users');

  // DOM Elements - Playground
  const reqMethod = document.getElementById('req-method');
  const reqUrl = document.getElementById('req-url');
  const reqHeaders = document.getElementById('req-headers');
  const reqBody = document.getElementById('req-body');
  const btnSendReq = document.getElementById('btn-send-req');
  const resStatusBadge = document.getElementById('res-status-badge');
  const resTimeText = document.getElementById('res-time-text');
  const resBodyCode = document.getElementById('res-body-code');
  const presetBtns = document.querySelectorAll('.preset-btn');

  // --- 1. Tab Navigation ---
  navTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab');
      navTabs.forEach((t) => t.classList.remove('active'));
      tabPages.forEach((p) => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPage = document.getElementById(targetId);
      if (targetPage) targetPage.classList.add('active');

      if (targetId === 'tab-users') {
        fetchUsersList();
      }
    });
  });

  // --- 2. System Health Monitoring ---
  async function checkSystemHealth() {
    const startTime = performance.now();
    try {
      const res = await fetch('/api/health');
      const latency = Math.round(performance.now() - startTime);
      const json = await res.json();

      if (json && json.data) {
        const d = json.data;

        // API Indicator
        apiStatusBadge.className = 'status-indicator-badge';
        apiStatusBadge.innerHTML = `<span class="status-dot pulsing"></span> API Connected (${latency}ms)`;

        // DB Status
        const dbStatus = d.checks?.database || 'unknown';
        dbStatusBadge.className = `badge ${dbStatus === 'healthy' ? 'badge-success' : 'badge-danger'}`;
        dbStatusBadge.textContent = dbStatus.toUpperCase();
        dbStatusText.textContent = dbStatus === 'healthy' ? 'Operational' : 'Degraded';

        // Redis Status
        const redisStatus = d.checks?.redis || 'unknown';
        redisStatusBadge.className = `badge ${redisStatus === 'healthy' ? 'badge-success' : 'badge-danger'}`;
        redisStatusBadge.textContent = redisStatus.toUpperCase();
        redisStatusText.textContent = redisStatus === 'healthy' ? 'Operational' : 'Degraded';

        // Uptime & Memory
        const uptimeSec = Math.floor(d.uptime || 0);
        const hrs = Math.floor(uptimeSec / 3600);
        const mins = Math.floor((uptimeSec % 3600) / 60);
        const secs = uptimeSec % 60;
        uptimeValue.textContent = `${hrs > 0 ? hrs + 'h ' : ''}${mins}m ${secs}s`;
        lastUpdatedText.textContent = `Last check: ${new Date().toLocaleTimeString()}`;

        if (d.memory) {
          const usedMb = Math.round((d.memory.total - d.memory.free) / (1024 * 1024));
          const totalMb = Math.round(d.memory.total / (1024 * 1024));
          const percent = parseFloat(d.memory.usage) || 0;

          memoryPercent.textContent = `${percent}%`;
          memoryUsageText.textContent = `${usedMb} MB / ${totalMb} MB`;
          memoryBar.style.width = `${percent}%`;
        }

        // Detailed telemetry
        if (d.environment) envModeText.textContent = d.environment;
        if (d.cpu) {
          cpuCoresText.textContent = `${d.cpu.cores} Cores`;
          cpuModelText.textContent = d.cpu.model;
        }
      }
    } catch (err) {
      apiStatusBadge.className = 'status-indicator-badge badge-danger';
      apiStatusBadge.innerHTML = `<span class="status-dot"></span> Offline`;
      dbStatusBadge.className = 'badge badge-danger';
      dbStatusBadge.textContent = 'OFFLINE';
      redisStatusBadge.className = 'badge badge-danger';
      redisStatusBadge.textContent = 'OFFLINE';
    }
  }

  // Initial Health Check & Interval
  checkSystemHealth();
  state.autoRefreshInterval = setInterval(checkSystemHealth, 5000);

  autoRefreshToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
      checkSystemHealth();
      state.autoRefreshInterval = setInterval(checkSystemHealth, 5000);
      showToast('Auto refresh enabled', 'info');
    } else {
      clearInterval(state.autoRefreshInterval);
      showToast('Auto refresh paused', 'info');
    }
  });

  btnRefreshHealth.addEventListener('click', () => {
    const icon = document.getElementById('refresh-icon');
    if (icon) icon.style.transform = 'rotate(360deg)';
    checkSystemHealth().then(() => {
      setTimeout(() => { if (icon) icon.style.transform = 'rotate(0deg)'; }, 400);
      showToast('System health refreshed', 'success');
    });
  });

  // --- 3. Authentication & Profile ---
  authTabLogin.addEventListener('click', () => {
    authTabLogin.classList.add('active');
    authTabRegister.classList.remove('active');
    formLogin.classList.remove('hidden');
    formRegister.classList.add('hidden');
  });

  authTabRegister.addEventListener('click', () => {
    authTabRegister.classList.add('active');
    authTabLogin.classList.remove('active');
    formRegister.classList.remove('hidden');
    formLogin.classList.add('hidden');
  });

  // Quick Demo Logins
  btnQuickAdmin.addEventListener('click', () => {
    document.getElementById('login-email').value = 'admin@example.com';
    document.getElementById('login-password').value = 'Admin@123';
    showToast('Filled Admin credentials', 'info');
  });

  btnQuickUser.addEventListener('click', () => {
    document.getElementById('login-email').value = 'user@example.com';
    document.getElementById('login-password').value = 'User@123';
    showToast('Filled Standard User credentials', 'info');
  });

  // Login Form Submit
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        state.accessToken = json.data.accessToken;
        state.refreshToken = json.data.refreshToken;
        state.user = json.data.user;

        localStorage.setItem('nexus_access_token', state.accessToken);
        localStorage.setItem('nexus_refresh_token', state.refreshToken);
        localStorage.setItem('nexus_user_data', JSON.stringify(state.user));

        renderAuthState();
        showToast('Login successful! Welcome back.', 'success');
      } else {
        showToast(json.message || 'Login failed. Invalid credentials.', 'error');
      }
    } catch (err) {
      showToast('Network error while logging in.', 'error');
    }
  });

  // Register Form Submit
  formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();
    const firstName = document.getElementById('reg-firstname').value;
    const lastName = document.getElementById('reg-lastname').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        state.accessToken = json.data.accessToken;
        state.refreshToken = json.data.refreshToken;
        state.user = json.data.user;

        localStorage.setItem('nexus_access_token', state.accessToken);
        localStorage.setItem('nexus_refresh_token', state.refreshToken);
        localStorage.setItem('nexus_user_data', JSON.stringify(state.user));

        renderAuthState();
        showToast('Account registered and logged in!', 'success');
      } else {
        showToast(json.message || 'Registration failed.', 'error');
      }
    } catch (err) {
      showToast('Network error during registration.', 'error');
    }
  });

  // Render Session State
  function renderAuthState() {
    if (state.accessToken && state.user) {
      unauthStateBox.classList.add('hidden');
      authStateBox.classList.remove('hidden');
      btnLogout.classList.remove('hidden');

      const u = state.user;
      userDisplayName.textContent = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email;
      userDisplayEmail.textContent = u.email;
      userAvatarCircle.textContent = (u.firstName?.[0] || u.email[0]).toUpperCase();

      userRoleBadge.textContent = u.role || 'USER';
      userRoleBadge.className = `badge ${u.role === 'ADMIN' ? 'badge-purple' : 'badge-info'}`;
      userVerifiedBadge.textContent = u.isVerified ? 'Verified' : 'Unverified';
      userVerifiedBadge.className = `badge ${u.isVerified ? 'badge-success' : 'badge-warning'}`;

      tokenCodeText.textContent = state.accessToken;
    } else {
      unauthStateBox.classList.remove('hidden');
      authStateBox.classList.add('hidden');
      btnLogout.classList.add('hidden');
    }
  }

  // Logout Handler
  btnLogout.addEventListener('click', () => {
    state.accessToken = '';
    state.refreshToken = '';
    state.user = null;
    localStorage.removeItem('nexus_access_token');
    localStorage.removeItem('nexus_refresh_token');
    localStorage.removeItem('nexus_user_data');
    renderAuthState();
    showToast('Signed out successfully', 'info');
  });

  // Copy Token
  btnCopyToken.addEventListener('click', () => {
    if (state.accessToken) {
      navigator.clipboard.writeText(state.accessToken);
      showToast('Access token copied to clipboard!', 'success');
    }
  });

  // Avatar Upload
  btnUploadAvatar.addEventListener('click', async () => {
    if (!state.accessToken) {
      showToast('Please sign in first to upload an avatar', 'error');
      return;
    }
    const file = avatarFileInput.files[0];
    if (!file) {
      showToast('Please select an image file first', 'info');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await fetch('/api/users/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${state.accessToken}` },
        body: formData,
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('Avatar uploaded successfully!', 'success');
      } else {
        showToast(json.message || 'Avatar upload failed', 'error');
      }
    } catch (err) {
      showToast('Error uploading avatar', 'error');
    }
  });

  // Auto Render Auth on Load
  renderAuthState();

  // --- 4. User Directory & Management ---
  async function fetchUsersList() {
    usersTableBody.innerHTML = `<tr><td colspan="6" class="table-empty">Loading users...</td></tr>`;

    try {
      const headers = {};
      if (state.accessToken) {
        headers['Authorization'] = `Bearer ${state.accessToken}`;
      }

      const res = await fetch('/api/users?page=1&limit=50', { headers });
      const json = await res.json();

      if (res.ok && json.success && Array.isArray(json.data)) {
        state.usersList = json.data;
        renderUsersTable(state.usersList);
      } else {
        usersTableBody.innerHTML = `
          <tr>
            <td colspan="6" class="table-empty">
              ${json.message || 'Unable to fetch users. Admin access required.'}
            </td>
          </tr>`;
        userCountBadge.textContent = '0 Users';
      }
    } catch (err) {
      usersTableBody.innerHTML = `<tr><td colspan="6" class="table-empty">Error connecting to users endpoint.</td></tr>`;
    }
  }

  function renderUsersTable(users) {
    if (!users || users.length === 0) {
      usersTableBody.innerHTML = `<tr><td colspan="6" class="table-empty">No users found.</td></tr>`;
      userCountBadge.textContent = '0 Users';
      return;
    }

    userCountBadge.textContent = `${users.length} Users Total`;

    usersTableBody.innerHTML = users
      .map((u) => {
        const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'N/A';
        const dateStr = u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A';
        const isSelf = state.user && state.user.id === u.id;

        return `
          <tr>
            <td>
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div class="avatar-circle" style="width: 34px; height: 34px; font-size: 0.9rem;">${(u.firstName?.[0] || u.email[0]).toUpperCase()}</div>
                <div>
                  <div style="font-weight: 600;">${fullName} ${isSelf ? '<span class="badge badge-info" style="font-size:0.65rem;">You</span>' : ''}</div>
                  <div style="font-size: 0.75rem; color: var(--text-dim);">${u.id}</div>
                </div>
              </div>
            </td>
            <td>${u.email}</td>
            <td><span class="badge ${u.role === 'ADMIN' ? 'badge-purple' : 'badge-info'}">${u.role}</span></td>
            <td><span class="badge ${u.isVerified ? 'badge-success' : 'badge-warning'}">${u.isVerified ? 'Yes' : 'No'}</span></td>
            <td>${dateStr}</td>
            <td>
              <div style="display: flex; gap: 0.4rem;">
                <button class="btn btn-secondary btn-xs btn-toggle-role" data-id="${u.id}" data-role="${u.role}">
                  Change Role
                </button>
                <button class="btn btn-danger btn-xs btn-delete-user" data-id="${u.id}">
                  Delete
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');

    // Attach Event Listeners to actions
    document.querySelectorAll('.btn-toggle-role').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const currentRole = btn.getAttribute('data-role');
        const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
        updateUserRole(id, newRole);
      });
    });

    document.querySelectorAll('.btn-delete-user').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this user?')) {
          deleteUser(id);
        }
      });
    });
  }

  async function updateUserRole(userId, newRole) {
    if (!state.accessToken) {
      showToast('Admin token required', 'error');
      return;
    }
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.accessToken}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast(`Role updated to ${newRole}`, 'success');
        fetchUsersList();
      } else {
        showToast(json.message || 'Failed to update role', 'error');
      }
    } catch (err) {
      showToast('Error updating user role', 'error');
    }
  }

  async function deleteUser(userId) {
    if (!state.accessToken) {
      showToast('Admin token required', 'error');
      return;
    }
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${state.accessToken}` },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('User deleted successfully', 'success');
        fetchUsersList();
      } else {
        showToast(json.message || 'Failed to delete user', 'error');
      }
    } catch (err) {
      showToast('Error deleting user', 'error');
    }
  }

  // User Search Filtering
  userSearchInput.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = state.usersList.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q),
    );
    renderUsersTable(filtered);
  });

  btnFetchUsers.addEventListener('click', fetchUsersList);

  // --- 5. Interactive API Playground ---
  btnSendReq.addEventListener('click', async () => {
    const method = reqMethod.value;
    const url = reqUrl.value.trim();
    let headers = {};
    let body = undefined;

    try {
      if (reqHeaders.value.trim()) {
        headers = JSON.parse(reqHeaders.value);
      }
    } catch (e) {
      showToast('Invalid JSON in Headers textarea', 'error');
      return;
    }

    if (method !== 'GET' && reqBody.value.trim()) {
      try {
        body = reqBody.value;
        JSON.parse(body); // Validate JSON
      } catch (e) {
        showToast('Invalid JSON in Request Body textarea', 'error');
        return;
      }
    }

    // Attach token automatically if logged in and not already provided
    if (state.accessToken && !headers['Authorization'] && !headers['authorization']) {
      headers['Authorization'] = `Bearer ${state.accessToken}`;
      reqHeaders.value = JSON.stringify(headers, null, 2);
    }

    resStatusBadge.className = 'badge badge-neutral';
    resStatusBadge.textContent = 'Sending...';
    resBodyCode.textContent = 'Executing request...';

    const t0 = performance.now();
    try {
      const res = await fetch(url, {
        method,
        headers,
        body: method !== 'GET' ? body : undefined,
      });
      const duration = Math.round(performance.now() - t0);
      resTimeText.textContent = `${duration} ms`;

      const status = res.status;
      resStatusBadge.textContent = `${status} ${res.statusText}`;
      if (status >= 200 && status < 300) {
        resStatusBadge.className = 'badge badge-success';
      } else if (status >= 400 && status < 500) {
        resStatusBadge.className = 'badge badge-warning';
      } else {
        resStatusBadge.className = 'badge badge-danger';
      }

      let jsonRes;
      try {
        jsonRes = await res.json();
        resBodyCode.textContent = JSON.stringify(jsonRes, null, 2);
      } catch {
        const txt = await res.text();
        resBodyCode.textContent = txt || '// Empty response body';
      }
    } catch (err) {
      resStatusBadge.className = 'badge badge-danger';
      resStatusBadge.textContent = 'FAILED';
      resBodyCode.textContent = `Error: ${err.message}`;
    }
  });

  // Presets
  presetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const method = btn.getAttribute('data-method');
      const url = btn.getAttribute('data-url');
      const body = btn.getAttribute('data-body');

      reqMethod.value = method;
      reqUrl.value = url;
      if (body) {
        reqBody.value = JSON.stringify(JSON.parse(body), null, 2);
      } else {
        reqBody.value = '';
      }
      showToast(`Loaded preset ${method} ${url}`, 'info');
    });
  });

  // Toast Notification Function
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    } else {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `${iconSvg} <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
});
