// Bring in action types.
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  ACCOUNT_DELETED,
} from '../actions/types';

// Create initial State Object
const initialState = {
  // Getting token from local storage
  token: localStorage.getItem('token'),
  // Conditially change Navbar and other Authentication required items
  isAuthenticated: null,
  // Checking that data has been retrived from DB
  loading: true,
  // Filled when user makes connection with DB
  user: null,
};

export default function (state = initialState, action) {
  // Destructure the action to pull out the main keys.
  const { type, payload } = action;
  // Define what happens for each type.
  switch (type) {
    case USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: payload,
      };
    case REGISTER_SUCCESS:
    case LOGIN_SUCCESS:
      // Setting local storage. First argument is what key to set, second is the value.
      localStorage.removeItem('token');
      localStorage.setItem('token', payload.token);
      // Returning state with updated values.
      return {
        ...state,
        ...payload,
        isAuthenticated: true,
        loading: false,
        token: payload.token,
      };
    // Multiple cases doing the same thing.
    // Any invalid token needs to be removed from localStorage.
    case REGISTER_FAIL:
    case AUTH_ERROR:
    case LOGIN_FAIL:
    case LOGOUT:
    case ACCOUNT_DELETED:
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
      };
    default:
      return state;
  }
}
