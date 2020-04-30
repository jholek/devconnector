// Import required packages including Redux, Devtools extension, thunk as middlware.
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
// Use a grouped Reducer so you dont have to import everything individually.
// Don't need to specify index.js as Webpack will automatically find it by
// just declaring the folder name.
import rootReducer from './reducers';

// All initial state will be in the reducers. Start as an empty object here.
const initialState = {};
// Declare any middleware used. Currently, only thunk.
const middleware = [thunk];
// Create the store by using redux method passing in reducers, initial state and
// any middleware. Use devtools middleware method to bring in thunk via spread operator.
const store = createStore(
  rootReducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware)),
);

export default store;
