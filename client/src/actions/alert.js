import { v4 as uuidv4 } from 'uuid';
import { SET_ALERT, REMOVE_ALERT } from './types';

// Using thunk to enable multiple alerts. Need to learn more about thunk.
export const setAlert = (msg, alertType, timeout = 5000) => (dispatch) => {
  // Using UUID to generate IDs for Alerts.
  const id = uuidv4();
  // Dispatches the action associated with the set type, to be handled by reducer.
  dispatch({
    type: SET_ALERT,
    payload: {
      msg,
      alertType,
      id,
    },
  });

  // Automatically removes the alert after 5000 ms.
  setTimeout(() => dispatch({ type: REMOVE_ALERT, payload: id }), timeout);
};
