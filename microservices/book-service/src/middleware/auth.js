import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'no token provided' });

    // validate token with auth service
    const response = await axios.get(`${process.env.AUTH_SERVICE_URL}/api/auth/validate`, {
      headers: { Authorization: token }
    });

    req.user = response.data.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'authentication failed' });
  }
};

export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'access denied' });
    }
    next();
  };
};
