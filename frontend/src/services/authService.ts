import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { userRepository } from '../repositories/userRepository';
import { generateTokens, verifyRefreshToken, TokenPayload } from '../utils/token';
import { ApiError } from '../utils/apiError';
import { RegisterInput, LoginInput } from '../validators/auth';
import { emailService } from './emailService';
import { logger } from '../utils/logger';

class AuthService {
  async register(input: RegisterInput) {
    const existingUser = await userRepository.findByEmail(input.email);
    if (existingUser) {
      throw ApiError.conflict('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(input.password, 12);
    const verifyToken = uuidv4();

    const user = await userRepository.create({
      email: input.email,
      password: hashedPassword,
      firstName: input.firstName,
      lastName: input.lastName,
      verifyToken,
    });

    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const tokens = generateTokens(tokenPayload);

    await userRepository.updateRefreshToken(user.id, tokens.refreshToken);

    try {
      await emailService.sendVerificationEmail(user.email, verifyToken);
    } catch (err) {
      logger.warn({ err }, 'Failed to send verification email');
    }

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const tokens = generateTokens(tokenPayload);

    await userRepository.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async logout(userId: string) {
    await userRepository.updateRefreshToken(userId, null);
  }

  async refreshToken(token: string) {
    let payload: TokenPayload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const user = await userRepository.findById(payload.userId);
    if (!user || user.refreshToken !== token) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const tokens = generateTokens(tokenPayload);

    await userRepository.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async forgotPassword(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return;
    }

    const resetToken = uuidv4();
    const resetTokenExp = new Date(Date.now() + 60 * 60 * 1000);

    await userRepository.update(user.id, { resetToken, resetTokenExp });

    try {
      await emailService.sendResetPasswordEmail(user.email, resetToken);
    } catch (err) {
      logger.warn({ err }, 'Failed to send reset password email');
    }
  }

  async resetPassword(token: string, password: string) {
    const user = await userRepository.findByResetToken(token);
    if (!user) {
      throw ApiError.badRequest('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await userRepository.update(user.id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExp: null,
      refreshToken: null,
    });
  }

  async verifyEmail(token: string) {
    const user = await userRepository.findByVerifyToken(token);
    if (!user) {
      throw ApiError.badRequest('Invalid verification token');
    }

    await userRepository.update(user.id, {
      isVerified: true,
      verifyToken: null,
    });
  }

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return this.sanitizeUser(user);
  }

  private sanitizeUser(user: Record<string, unknown>) {
    const { password, refreshToken, verifyToken, resetToken, resetTokenExp, ...rest } = user;
    return rest;
  }
}

export const authService = new AuthService();
