// Bring in action types.
import {
  GET_PROFILE,
  GET_PROFILES,
  GET_REPOS,
  UPDATE_PROFILE,
  CLEAR_PROFILE,
  PROFILE_ERROR,
} from '../actions/types';

const initialState = {
  // Currently accessed profile. Either own or other user.
  profile: null,
  // List of profiles to display on list page.
  profiles: [],
  // Github repos.
  repos: [],
  // Same as auth; turns false after getting repsonse.
  loading: true,
  // Contains any errors to be used via Alerts.
  error: {},
};

export default function (state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_PROFILE:
    case UPDATE_PROFILE:
      return {
        ...state,
        profile: payload,
        loading: false,
      };
    case GET_PROFILES:
      return {
        ...state,
        profiles: payload,
        loading: false,
      };
    case CLEAR_PROFILE:
      return {
        ...state,
        profile: null,
        repos: [],
        loading: false,
      };
    case GET_REPOS:
      return {
        ...state,
        repos: payload,
        loading: false,
      };
    case PROFILE_ERROR:
      return {
        ...state,
        error: payload,
        loading: false,
        profile: null,
      };
    default:
      return state;
  }
}
