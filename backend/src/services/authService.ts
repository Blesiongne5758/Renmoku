import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { generateToken, generateRefreshToken } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

interface RegisterInput {
  email: string;
  password: string;
  phone: string;
  role: 'RENTER' | 'OWNER' | 'ADMIN';
  // For individual renters
  fullName?: string;
  ktpNumber?: string;
  simNumber?: string;
  address?: string;
  // For corporate renters
  companyName?: string;
  nib?: string;
  npwp?: string;
  picName?: string;
  // For owners
  businessName?: string;
  bankAccount?: string;
  bankName?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    phone?: string;
  };
}

class AuthService {
  // Register new user
  async register(input: RegisterInput): Promise<AuthResponse> {
    try {
      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new AppError('Email already registered', 409);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(input.password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: input.email,
          password: hashedPassword,
          phone: input.phone,
          role: input.role,
          status: 'PENDING',
        },
      });

      // Create role-specific profile
      if (input.role === 'RENTER') {
        if (input.fullName && input.ktpNumber && input.simNumber) {
          // Individual renter
          await prisma.renterIndividual.create({
            data: {
              userId: user.id,
              fullName: input.fullName,
              ktpNumber: input.ktpNumber,
              simNumber: input.simNumber,
              address: input.address || '',
              ktpScan: '',
              simScan: '',
              kkScan: '',
            },
          });
        } else if (input.companyName && input.nib && input.npwp) {
          // Corporate renter
          await prisma.renterCorporate.create({
            data: {
              userId: user.id,
              companyName: input.companyName,
              nib: input.nib,
              npwp: input.npwp,
              picName: input.picName || '',
              picKtp: '',
              picSim: '',
              nibDocument: '',
              akta: '',
              npwpDocument: '',
              picKtpScan: '',
              picSimScan: '',
            },
          });
        }
      } else if (input.role === 'OWNER') {
        await prisma.fleetOwner.create({
          data: {
            userId: user.id,
            businessName: input.businessName || '',
            bankAccount: input.bankAccount || '',
            bankName: input.bankName || '',
          },
        });
      }

      // Generate tokens
      const token = generateToken(user.id, user.email, user.role);
      const refreshToken = generateRefreshToken(user.id);

      logger.info('User registered successfully', { userId: user.id, role: user.role });

      // Get user name
      let userName = user.email;
      if (input.role === 'RENTER' && input.fullName) {
        userName = input.fullName;
      } else if (input.role === 'OWNER' && input.businessName) {
        userName = input.businessName;
      }

      return {
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: userName,
          role: user.role,
          status: user.status,
          phone: user.phone,
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Registration error', error);
      throw new AppError('Registration failed', 500);
    }
  }

  // Login user
  async login(input: LoginInput): Promise<AuthResponse> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email: input.email },
        include: {
          renterIndividual: true,
          renterCorporate: true,
          fleetOwner: true,
        },
      });

      if (!user) {
        throw new AppError('Invalid credentials', 401);
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(input.password, user.password);

      if (!isValidPassword) {
        throw new AppError('Invalid credentials', 401);
      }

      // Check if user is verified
      if (user.status !== 'VERIFIED') {
        throw new AppError('Account not verified. Please complete verification.', 403);
      }

      // Generate tokens
      const token = generateToken(user.id, user.email, user.role);
      const refreshToken = generateRefreshToken(user.id);

      logger.info('User logged in successfully', { userId: user.id });

      // Get user name
      let userName = user.email;
      if (user.renterIndividual) {
        userName = user.renterIndividual.fullName;
      } else if (user.renterCorporate) {
        userName = user.renterCorporate.companyName;
      } else if (user.fleetOwner) {
        userName = user.fleetOwner.businessName;
      }

      return {
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: userName,
          role: user.role,
          status: user.status,
          phone: user.phone,
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Login error', error);
      throw new AppError('Login failed', 500);
    }
  }

  // Get current user
  async getCurrentUser(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          renterIndividual: true,
          renterCorporate: true,
          fleetOwner: true,
        },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Get user name
      let userName = user.email;
      if (user.renterIndividual) {
        userName = user.renterIndividual.fullName;
      } else if (user.renterCorporate) {
        userName = user.renterCorporate.companyName;
      } else if (user.fleetOwner) {
        userName = user.fleetOwner.businessName;
      }

      return {
        id: user.id,
        email: user.email,
        name: userName,
        role: user.role,
        status: user.status,
        phone: user.phone,
        createdAt: user.createdAt,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Get current user error', error);
      throw new AppError('Failed to get user', 500);
    }
  }

  // Refresh token
  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    try {
      const { verifyRefreshToken } = await import('../middleware/auth');
      const decoded = verifyRefreshToken(refreshToken);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || user.status !== 'VERIFIED') {
        throw new AppError('Invalid refresh token', 401);
      }

      const newToken = generateToken(user.id, user.email, user.role);
      const newRefreshToken = generateRefreshToken(user.id);

      return {
        token: newToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Refresh token error', error);
      throw new AppError('Failed to refresh token', 500);
    }
  }
}

export default new AuthService();
