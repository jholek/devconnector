const express = require('express');

const router = express.Router();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
// Bringing in the middleware created to verify JWT.
const auth = require('../../middleware/auth');

const User = require('../../models/User');
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET;

// @route    GET api/auth
// @desc     Test route
// @access   Public

// add auth to the router.get call in order to have it pass through the verification first.
router.get('/', auth, async (req, res) => {
  try {
    // Accesses the database to find which user is associated with
    // the ID contained in the token payload.
    // .select filters out certain properties. Password is removed for security.
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/auth
// @desc     Authenticate User & Get Token
// @access   Public - provides access without token

router.post(
  '/',
  [
    check('email', 'Please include a valid email.').isEmail(),
    check('password', 'Password is required.').exists(),
  ],

  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Finds the user entered into the form.
      const user = await User.findOne({ email });

      if (!user) {
        res.status(400).json({ errors: [{ msg: 'Invalid Credentials.' }] });
      }

      // Bcrypt checks password for match

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        res.status(400).json({ errors: [{ msg: 'Invalid Credentials.' }] });
      }

      // --- Return JWT ---
      // If user exists, and password matches - send a JWT for Authentication.

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(payload, jwtSecret, { expiresIn: 360000 }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  },
);

module.exports = router;
