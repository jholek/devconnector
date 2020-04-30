import axios from 'axios';
import { setAlert } from './alert';

import {
  GET_PROFILE,
  GET_PROFILES,
  GET_REPOS,
  UPDATE_PROFILE,
  CLEAR_PROFILE,
  PROFILE_ERROR,
  ACCOUNT_DELETED,
} from './types';

// --- Get Current users profiles. ---
export const getCurrentProfile = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/profile/me');

    dispatch({
      type: GET_PROFILE,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: CLEAR_PROFILE,
    });

    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

// --- GET ALL PROFILES ---
export const getProfiles = () => async (dispatch) => {
  // Will prevent flashing of user profile contained in the state before rendering all profiles.
  dispatch({ type: CLEAR_PROFILE });
  try {
    const res = await axios.get('/api/profile');

    dispatch({
      type: GET_PROFILES,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

// --- GET PROFILE BY ID ---
export const getProfileById = (userId) => async (dispatch) => {
  try {
    const res = await axios.get(`/api/profile/user/${userId}`);

    dispatch({
      type: GET_PROFILE,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

// --- GET GITHUB REPOS ---
export const getGithubRepos = (username) => async (dispatch) => {
  // Will prevent flashing of user profile contained in the state before rendering all profiles.
  dispatch({ type: CLEAR_PROFILE });
  try {
    const res = await axios.get(`/api/profile/github/${username}`);

    dispatch({
      type: GET_REPOS,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

// --- Create or update Profile ---
// history object used to redirect to client side route
// New variable to determine if this is a create or update function
export const createProfile = (formData, history, edit = false) => async (
  dispatch,
) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const res = await axios.post('/api/profile', formData, config);

    // Gets updated profile data and returns it.
    dispatch({
      type: GET_PROFILE,
      payload: res.data,
    });

    // Sends feedback to the user, conditionally on if it is a create
    // or update operation.
    dispatch(setAlert(edit ? 'Profile Updated' : 'Profile Created', 'success'));

    // If this is a create operation, redirects user to dashboard.
    // Otherwise stays on the newly updated profile.
    // Uses the history.push method to redirect.
    if (!edit) {
      history.push('/dashboard');
    }
  } catch (err) {
    // Handling the validation errors as alerts.
    const errors = err.response.data.errors;
    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
    }

    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

// --- ADD EXPERIENCE ACTION ---
export const addExperience = (formData, history) => async (dispatch) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const res = await axios.put('/api/profile/experience', formData, config);

    dispatch({
      type: UPDATE_PROFILE,
      payload: res.data,
    });

    dispatch(setAlert('Experience Added', 'success'));
    history.push('/dashboard');
  } catch (err) {
    const errors = err.response.data.errors;
    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
    }

    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

// --- ADD EDUCATION ACTION ---
export const addEducation = (formData, history) => async (dispatch) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const res = await axios.put('/api/profile/education', formData, config);

    dispatch({
      type: UPDATE_PROFILE,
      payload: res.data,
    });

    dispatch(setAlert('Education Added', 'success'));
    history.push('/dashboard');
  } catch (err) {
    const errors = err.response.data.errors;
    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
    }

    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

// --- DELETE EXPERIENCE ---
export const deleteExperience = (id) => async (dispatch) => {
  try {
    const res = await axios.delete(`api/profile/experience/${id}`);

    dispatch({
      type: UPDATE_PROFILE,
      payload: res.data,
    });

    dispatch(setAlert('Experience Removed.', 'success'));
  } catch (err) {
    const errors = err.response.data.errors;
    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
    }

    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

// --- DELETE EDUCATION ---
export const deleteEducation = (id) => async (dispatch) => {
  try {
    const res = await axios.delete(`api/profile/education/${id}`);

    dispatch({
      type: UPDATE_PROFILE,
      payload: res.data,
    });

    dispatch(setAlert('Education Removed.', 'success'));
  } catch (err) {
    const errors = err.response.data.errors;
    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
    }

    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

// --- DELETE ACCOUNT & PROFILE ---
export const deleteAccount = () => async (dispatch) => {
  if (window.confirm('Are you sure? This can NOT be undone!')) {
    try {
      await axios.delete(`api/profile`);

      dispatch({
        type: CLEAR_PROFILE,
      });

      dispatch({
        type: ACCOUNT_DELETED,
      });

      dispatch(setAlert('Your account has been permanently deleted.'));
    } catch (err) {
      const errors = err.response.data.errors;
      if (errors) {
        errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
      }

      dispatch({
        type: PROFILE_ERROR,
        payload: { msg: err.response.statusText, status: err.response.status },
      });
    }
  }
};
