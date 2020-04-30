import { SET_ALERT, REMOVE_ALERT } from '../actions/types';

// Declare initial states of alerts.
const initialState = [];
// Reducer function to export takes in the initial state and an action.
// Action contains a mandatory action type, and the payload.
export default function (state = initialState, action) {
  // Destructuring
  const { type, payload } = action;
  // Define how all action types are handled, and what is returned.
  switch (type) {
    case SET_ALERT:
      // State is immutable, so need to take in the current state before changing it.
      return [...state, payload];
    case REMOVE_ALERT:
      // Filters through state object, removing the alert id that matches the payload.
      return state.filter((alert) => alert.id !== payload);
    // Needs a default case that just returns state if neither case is met.
    default:
      return state;
  }
}
