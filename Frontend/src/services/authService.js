const API_BASE_URL = 'http://localhost:5000/api/auth';

export const authService = {
  // Store token and user data in localStorage
  setSession: (token, user) => {
    localStorage.setItem('jal_suraksha_token', token);
    localStorage.setItem('jal_suraksha_user', JSON.stringify(user));
  },

  // Get token from localStorage
  getToken: () => {
    return localStorage.getItem('jal_suraksha_token');
  },

  // Get user profile from localStorage
  getUser: () => {
    const userStr = localStorage.getItem('jal_suraksha_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  // Clear session from localStorage
  clearSession: () => {
    localStorage.removeItem('jal_suraksha_token');
    localStorage.removeItem('jal_suraksha_user');
  },

  // Check if valid token exists in localStorage
  isAuthenticated: () => {
    const token = localStorage.getItem('jal_suraksha_token');
    if (!token) return false;
    
    try {
      // Base64URL safe decoding of JWT payload
      const base64Url = token.split('.')[1];
      if (!base64Url) return false;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('jal_suraksha_token');
        localStorage.removeItem('jal_suraksha_user');
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  // Authenticate user via API
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed. Please check credentials.');
    }

    if (data.token) {
      authService.setSession(data.token, data.user);
    }

    return data;
  },

  // Verify current session with backend protected route
  verifySession: async () => {
    const token = authService.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          authService.clearSession();
          return null;
        }
      } else {
        const data = await response.json();
        return data.user;
      }

      return authService.getUser();
    } catch {
      // Fallback to cached user profile if server is unavailable locally
      return authService.getUser();
    }
  }
};
