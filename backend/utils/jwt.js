import jwt from 'jsonwebtoken';

// JWT Configuration
const JWT_OPTIONS = {
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  issuer: 'starg-ecommerce',
  audience: 'starg-users'
};

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    JWT_OPTIONS
  );
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: JWT_OPTIONS.issuer,
      audience: JWT_OPTIONS.audience
    });
  } catch (error) {
    return null;
  }
};

