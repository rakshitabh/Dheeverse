const jwt = require('jsonwebtoken');
const User = require('./models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Generate JWT token
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// Verify JWT token middleware
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      // Fallback to x-user-id header for backward compatibility
      const userId = req.headers['x-user-id'];
      if (userId) {
        req.userId = userId;
        return next();
      }
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expired' });
    }
    return res.status(500).json({ error: 'Authentication error' });
  }
}

// Optional: Verify user exists
async function verifyUser(req, res, next) {
  try {
    const { connectToDatabase } = require('./mongodb');
    await connectToDatabase();
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'User verification failed' });
  }
}

module.exports = {
  generateToken,
  authenticateToken,
  verifyUser,
  JWT_SECRET,
};



