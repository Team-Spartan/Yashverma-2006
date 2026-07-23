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
      // Basic JWT expiration check if JWT contains exp
      const payload = JSON.parse(atob(token.split('.')[1]));
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
        authService.clearSession();
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch {
      return null;
    }
  }
};
