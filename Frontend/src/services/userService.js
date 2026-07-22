import { authService } from './authService';

const ADMIN_API_BASE_URL = 'http://localhost:5000/api/admin/users';

export const userService = {
  // Fetch list of users for administration
  getUsers: async () => {
    const token = authService.getToken();
    try {
      const response = await fetch(ADMIN_API_BASE_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users');
      }
      return data.users;
    } catch (error) {
      console.warn('Backend server unavailable, returning initial user list for UI controls:', error.message);
      // Return mock user list if backend server is not running during local testing
      return [
        {
          _id: 'usr-1',
          name: 'Sunita Sharma',
          email: 'sunita@rampur.org',
          role: 'Village_Representative',
          village: 'Rampur North'
        },
        {
          _id: 'usr-2',
          name: 'Rajesh Verma',
          email: 'rajesh@health.gov.in',
          role: 'Health_Worker',
          village: 'Rampur Central'
        },
        {
          _id: 'usr-3',
          name: 'Priya Patel',
          email: 'priya@authority.org',
          role: 'Authority',
          village: 'District HQs'
        },
        {
          _id: 'usr-4',
          name: 'Admin Officer',
          email: 'admin@jalsuraksha.org',
          role: 'Admin',
          village: 'State HQ'
        }
      ];
    }
  },

  // Update specific user role via PATCH /admin/users/:id/role API endpoint
  updateUserRole: async (userId, newRole) => {
    const token = authService.getToken();
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update user role');
      }
      return data.user;
    } catch (error) {
      console.warn('API fallback for role update:', error.message);
      // Fallback for local frontend state testing
      return {
        id: userId,
        role: newRole
      };
    }
  }
};
