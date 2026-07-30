import { Request, Response, NextFunction } from 'express';
import { authService } from '../services';
import { RegisterInput, LoginInput, RefreshTokenInput } from '../validators/auth';
import { ApiResponse } from '../utils/apiResponse';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body as RegisterInput);
      return ApiResponse.created(res, 'Registration successful', result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body as LoginInput);
      return ApiResponse.success(res, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.logout(req.user!.userId);
      return ApiResponse.success(res, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const tokens = await authService.refreshToken((req.body as RefreshTokenInput).refreshToken);
      return ApiResponse.success(res, 'Token refreshed', tokens);
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.forgotPassword(req.body.email);
      return ApiResponse.success(res, 'Password reset email sent');
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.resetPassword(req.body.token, req.body.password);
      return ApiResponse.success(res, 'Password reset successful');
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.verifyEmail(req.query.token as string);
      return ApiResponse.success(res, 'Email verified successfully');
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getProfile(req.user!.userId);
      return ApiResponse.success(res, 'Profile retrieved', user);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
