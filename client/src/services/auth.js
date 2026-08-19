import axios from 'axios';

// Ensure cookies are sent with cross-site and same-site requests
axios.defaults.withCredentials = true;

// Get token from localStorage
export const getToken = () => localStorage.getItem('token');

// Set token & user to localStorage
export const setAuthData = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

// Remove token & user from localStorage
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const logoutAPI = async () => {
  try {
    await axios.post('/api/users/logout');
  } catch (e) {
    // Ignore error
  } finally {
    clearAuthData();
  }
};

// Get stored user profile
export const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
};

// Update stored user without changing token
export const updateStoredUser = (user) => {
  try {
    const current = getStoredUser() || {};
    const updated = { ...current, ...user };
    localStorage.setItem('user', JSON.stringify(updated));
    return updated;
  } catch (e) {
    return user;
  }
};

// Axios instance with default Auth header
export const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// API calls
export const loginAPI = async (email, password) => {
  try {
    const response = await axios.post('/api/users/login', { email, password });
    if (response.data.success && response.data.token) {
      setAuthData(response.data.token, response.data.user);
    }
    return response.data;
  } catch (err) {
    if (err.response && err.response.data) {
      return err.response.data;
    }
    throw err;
  }
};

export const registerAPI = async (name, email, password, role) => {
  const response = await axios.post('/api/users/register', { name, email, password, role });
  return response.data;
};

export const verifyEmailAPI = async ({ token, otp, email }) => {
  const response = await axios.post('/api/users/verify-email', { token, otp, email });
  return response.data;
};

export const resendVerificationAPI = async (email) => {
  const response = await axios.post('/api/users/resend-verification', { email });
  return response.data;
};

export const updateProfileAPI = async ({ name, age, location, gender }) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.put('/api/users/profile', { name, age, location, gender }, { headers });
    if (response.data.success && response.data.user) {
      updateStoredUser(response.data.user);
    }
    return response.data;
  } catch (err) {
    if (err.response?.status === 401) {
      clearAuthData();
    }
    if (err.response?.data) {
      return err.response.data;
    }
    throw err;
  }
};

export const updatePasswordAPI = async ({ currentPassword, newPassword }) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.put('/api/users/password', { currentPassword, newPassword }, { headers });
    return response.data;
  } catch (err) {
    if (err.response?.status === 401) {
      clearAuthData();
    }
    if (err.response?.data) {
      return err.response.data;
    }
    throw err;
  }
};

export const sendContactAPI = async ({ name, email, subject, message }) => {
  try {
    const response = await axios.post('/api/users/contact', { name, email, subject, message });
    return response.data;
  } catch (err) {
    if (err.response?.data) {
      return err.response.data;
    }
    throw err;
  }
};

export const fetchMeAPI = async () => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) return null;
    const response = await axios.get('/api/users/me', { headers });
    return response.data;
  } catch (err) {
    if (err.response?.status === 401) {
      clearAuthData();
    }
    return null;
  }
};

// Admin API calls
export const fetchAllUsersAPI = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get('/api/users', { headers });
    return response.data;
  } catch (err) {
    if (err.response?.status === 401) {
      clearAuthData();
    }
    throw err;
  }
};

export const fetchAdminStatsAPI = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get('/api/users/admin/stats', { headers });
    return response.data;
  } catch (err) {
    if (err.response?.status === 401) {
      clearAuthData();
    }
    throw err;
  }
};

export const updateUserRoleAPI = async (userId, role) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.put(`/api/users/${userId}/role`, { role }, { headers });
    return response.data;
  } catch (err) {
    if (err.response?.status === 401) {
      clearAuthData();
    }
    throw err;
  }
};

export const toggleBanUserAPI = async (userId, isBanned) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.put(`/api/users/${userId}/ban`, { isBanned }, { headers });
    return response.data;
  } catch (err) {
    if (err.response?.status === 401) {
      clearAuthData();
    }
    throw err;
  }
};

export const deleteUserAPI = async (userId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.delete(`/api/users/${userId}`, { headers });
    return response.data;
  } catch (err) {
    if (err.response?.status === 401) {
      clearAuthData();
    }
    throw err;
  }
};

export const adminCreateUserAPI = async ({ name, email, password, role, isVerified }) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post('/api/users/admin/create', { name, email, password, role, isVerified }, { headers });
    return response.data;
  } catch (err) {
    if (err.response?.status === 401) {
      clearAuthData();
    }
    throw err;
  }
};

export const adminUpdatePasswordAPI = async (userId, password) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.put(`/api/users/${userId}/password`, { password }, { headers });
    return response.data;
  } catch (err) {
    if (err.response?.status === 401) {
      clearAuthData();
    }
    throw err;
  }
};
