import { combineReducers } from 'redux';
import alert from './alert';
import auth from './auth';
import profile from './profile';
import post from './post';
// Bring in all other reducer files here, so that we only need to bring in
// rootReducer into the Store and Component files.
export default combineReducers({
  alert,
  auth,
  profile,
  post,
});
