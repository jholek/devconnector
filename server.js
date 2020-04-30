/* eslint-disable no-console */
/* eslint-disable comma-dangle */
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
require('dotenv').config();

// --- Init Express ---
const app = express();
// --- Init MongoDB Atlas ---
// Connection via the async function defined in config/db.js
connectDB();

// --- Init Middleware ---
// This is where bodyparser used to be and is now part of express.
// Allows for the use of req.body
app.use(
  express.json({
    extended: false,
  }),
);

// --- Define Routes ---
// The /api/users syntax is used to define the home route within the local users.js file.
// Full Folder these are added into are defined in the require() call.
// It basically means / = /api/users. so you can use /register instead of /api/users/register.
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  // Serve the index.html file from the build folder
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Setting Express port to connect on either one specified in .env or 5000.
const PORT = process.env.PORT || 5000;

// Need to use backticks (`) instead of quotes (') if we are injecting variables into strings.
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
