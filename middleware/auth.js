const jwt = require('jsonwebtoken');
require('dotenv').config();

// A middleware function is a function that has access to req, res objects and 'next' which runs once the logic is complete
// in order to move to next piece of middleware.
module.exports = function (req, res, next) {
  // Get Token from Header (since we have access to request)
  const token = req.header('x-auth-token');
  const jwtSecret = process.env.JWT_SECRET;

  // Check if no Token, and return error if there isnt one.
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token by using jwt.verify by passing in the token and secret.
  // Succeeds if the token can be verified.
  // Binds this decoded object that contains the user id to req.user
  try {
    const decoded = jwt.verify(token, jwtSecret);
    // Once token auth is successful, this can be used to access protected routes.
    req.user = decoded.user;
    // Moves to next middleware.
    next();
  } catch (err) {
    // Throws error if the request fails due to an invalid token.
    res.status(401).json({ msg: 'Token is not valid.' });
  }
};
