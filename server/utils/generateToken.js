const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token for authentication.
 * @param {string} id - User's MongoDB ObjectId
 * @param {string} role - User's role ('customer' | 'admin')
 * @returns {string} Signed JWT token
 */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

module.exports = generateToken;
