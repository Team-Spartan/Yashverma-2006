import { Request, Response, NextFunction } from 'express';
import { userService } from '../services';
import { ApiResponse } from '../utils/apiResponse';
import { Role } from '../types';
import { PaginationInput } from '../validators/user';

export class UserController {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getProfile(req.user!.userId);
      return ApiResponse.success(res, 'Profile retrieved', user);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateProfile(req.user!.userId, req.body);
      return ApiResponse.success(res, 'Profile updated', user);
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      await userService.changePassword(req.user!.userId, req.body);
      return ApiResponse.success(res, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      await userService.deleteAccount(req.user!.userId);
      return ApiResponse.noContent(res);
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const role = req.query.role as Role | undefined;
      const result = await userService.getAllUsers(req.query as unknown as PaginationInput, {
        role,
      });
      return ApiResponse.paginated(res, result.data, result.meta, 'Users retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUserById(req.params.id);
      return ApiResponse.success(res, 'User retrieved', user);
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateUserRole(req.params.id, req.body.role);
      return ApiResponse.success(res, 'User role updated', user);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      await userService.deleteUser(req.params.id);
      return ApiResponse.noContent(res);
    } catch (error) {
      next(error);
    }
  }

  async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return ApiResponse.success(res, 'No file uploaded');
      }
      const avatarUrl = `/uploads/${req.file.filename}`;
      const user = await userService.updateProfile(req.user!.userId, { avatar: avatarUrl });
      return ApiResponse.success(res, 'Avatar uploaded', user);
    } catch (error) {
      next(error);
    }
  }

  async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await userService.getStats();
      return ApiResponse.success(res, 'Stats retrieved', stats);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
