import axios from 'axios';

const API_URL = '/api/profile';

// Configure axios to include credentials (cookies)
axios.defaults.withCredentials = true;

// Configure axios to handle CSRF tokens from Flask-JWT-Extended
// Flask-JWT-Extended sets a 'csrf_access_token' cookie which we must send as 'X-CSRF-TOKEN' header
axios.defaults.xsrfCookieName = 'csrf_access_token';
axios.defaults.xsrfHeaderName = 'X-CSRF-TOKEN';

const getProfile = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network error');
  }
};

const updateProfile = async (profileData) => {
  try {
    // Axios will now automatically include the X-CSRF-TOKEN header if the cookie exists
    const response = await axios.post(API_URL, profileData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export default {
  getProfile,
  updateProfile,
};
