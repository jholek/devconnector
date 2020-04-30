const mongoose = require('mongoose');
require('dotenv').config();

const db = process.env.MONGO_URI;

// Creating a variable so server.js can use what gets returned from the async function.
// Gets a Promise returned when using the mongoose connect call. Using async/await to handle it.
const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      // Need these or you will get deprecation errors.
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log('MongoDB Connected.');
  } catch (err) {
    // Console.error
    console.error(err.message);
    // Exits the process with failure if this async call doesnt work.
    process.exit(1);
  }
};

module.exports = connectDB;
