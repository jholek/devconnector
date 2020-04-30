// -- TOKEN TO HTTP HEADER HELPER FUNCTION ---

import axios from 'axios';

// Function to check if token exists, and if so adds to page header.
// If it doesn't exist, it will delete the token header.
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }
};

export default setAuthToken;
