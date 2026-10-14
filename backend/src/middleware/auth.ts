import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import prisma from '../config/database';
import logger from '../utils/logger';

// Extend Express Request type
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'RENTER' | 'OWNER' | 'ADMIN';
  };
}

// JWT Payload interface
interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

// Authenticate middleware - verify JWT token
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.',
      });
      return;
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

    // Check if user exists and is verified
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found.',
      });
      return;
    }

    if (user.status !== 'VERIFIED') {
      res.status(403).json({
        success: false,
        error: 'Account not verified. Please complete verification.',
      });
      return;
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as 'RENTER' | 'OWNER' | 'ADMIN',
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid JWT token', { error: error.message });
      res.status(401).json({
        success: false,
        error: 'Invalid token.',
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Expired JWT token');
      res.status(401).json({
        success: false,
        error: 'Token expired. Please login again.',
      });
      return;
    }

    logger.error('Authentication error', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error.',
    });
  }
};

// Authorize middleware - check user role
export const authorize = (roles: ('RENTER' | 'OWNER' | 'ADMIN')[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Unauthorized access attempt', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        path: req.path,
      });

      res.status(403).json({
        success: false,
        error: 'Access denied. Insufficient permissions.',
      });
      return;
    }

    next();
  };
};

// Optional authenticate - doesn't block if no token
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (user && user.status === 'VERIFIED') {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role as 'RENTER' | 'OWNER' | 'ADMIN',
      };
    }

    next();
  } catch (error) {
    // Don't block request if token is invalid for optional auth
    next();
  }
};

// Generate JWT token
export const generateToken = (userId: string, email: string, role: string): string => {
  return jwt.sign(
    {
      userId,
      email,
      role,
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiresIn as any,
    }
  );
};

// Generate refresh token
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    {
      userId,
      type: 'refresh',
    },
    config.jwt.refreshSecret,
    {
      expiresIn: config.jwt.refreshExpiresIn as any,
    }
  );
};

// Verify refresh token
export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
};
