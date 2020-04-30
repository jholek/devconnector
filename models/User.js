const mongoose = require('mongoose');

// Creating a schema for User
// Required means that there must be an input value in order to write to DB.
// Unique will check for uniqueness against the existing values for that field.
// Default sets the default value for this field.
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    reqired: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('user', UserSchema);
module.exports = User;
