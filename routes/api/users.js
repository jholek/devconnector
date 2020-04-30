const express = require('express');
// Must bring in this method in order to handle routes in their own folder.
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Used to validate fields when they are submitted.
const { check, validationResult } = require('express-validator');
// Bringing in the user model.
const User = require('../../models/User');
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET;

// @route    POST api/users
// @desc     Register User
// @access   Public - provides access without token
router.post(
  '/',
  [
    // Using express-validator to make checks on the information submitted via POST.
    // Syntax is first the field, then custom error response.
    // For some reason requires not() before isEmpty() for the name field.
    check('name', 'Name is required.').not().isEmpty(),
    check('email', 'Please include a valid email.').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters.',
    ).isLength({ min: 6 }),
  ],
  // Making function async in order to use async / await for embedded logic.
  async (req, res) => {
    // Creating a variable for any errors that are logged using express-validator
    const errors = validationResult(req);
    // If there are any errors, it will return a 400 error and pass over the array of errors.
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Destructuring req.body for the fields that will be used.
    const { name, email, password } = req.body;

    try {
      // --- Check if User Exists ---
      let user = await User.findOne({ email });

      if (user) {
        // Returns 400 error and error message structured the same way as express-validator for consistency.
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists.' }] });
      }

      // --- Get Gravatar ---
      const avatar = gravatar.url(email, {
        s: '200', // Size
        r: 'pg', // No X rated images
        d: 'mm', // default image
      });

      // --- Create Local User Store ---
      // Creates a new user instance but does not save it to the DB until the method is added.
      user = new User({
        name,
        email,
        avatar,
        password,
      });

      // --- Encrypt Password ---
      // Defines how secure the salt is for the password hash.
      const salt = await bcrypt.genSalt(10);
      // Passes submitted password into bcrypt to create a hash and update the user store.
      user.password = await bcrypt.hash(password, salt);
      // Saves newly submitted user to DB.
      await user.save();

      // --- Return JWT ---

      const payload = {
        user: {
          id: user.id,
        },
      };

      // Signing the token by passing in the payload, secret, expiry time, and
      // producing a callback to throw an error if there is a problem,
      // else gives the token to the client.
      jwt.sign(payload, jwtSecret, { expiresIn: 360000 }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch (err) {
      // Logs error in console, and returns 500 error to user if async req fails.
      console.error(err.message);
      res.status(500).send('Server error');
    }
  },
);

// Need to export router
module.exports = router;
