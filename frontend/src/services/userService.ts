import { User } from '@prisma/client';
import { Role } from '../types';
import bcrypt from 'bcrypt';
import { userRepository } from '../repositories/userRepository';
import { ApiError } from '../utils/apiError';
import { UpdateProfileInput, PaginationInput, ChangePasswordInput } from '../validators/user';
import { PaginatedResult } from '../utils/pagination';

class UserService {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return this.sanitizeUser(user);
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const updated = await userRepository.update(userId, input);
    return this.sanitizeUser(updated);
  }

  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isPasswordValid = await bcrypt.compare(input.currentPassword, user.password);
    if (!isPasswordValid) {
      throw ApiError.badRequest('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(input.newPassword, 12);
    await userRepository.update(userId, { password: hashedPassword });
  }

  async deleteAccount(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    await userRepository.delete(userId);
  }

  async getAllUsers(
    pagination: PaginationInput,
    filters: { role?: Role } = {},
  ): Promise<PaginatedResult<User>> {
    return userRepository.findAll(pagination, filters);
  }

  async getUserById(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return this.sanitizeUser(user);
  }

  async updateUserRole(userId: string, role: Role) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    const updated = await userRepository.update(userId, { role });
    return this.sanitizeUser(updated);
  }

  async deleteUser(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    await userRepository.delete(userId);
  }

  async getStats() {
    const totalUsers = await userRepository.count();
    return { totalUsers };
  }

  private sanitizeUser(user: Record<string, unknown>) {
    const { password, refreshToken, verifyToken, resetToken, resetTokenExp, ...rest } = user;
    return rest;
  }
}

export const userService = new UserService();
