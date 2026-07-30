import { Router } from 'express';
import { authController } from '../controllers';
import { validate, authenticate, authLimiter } from '../middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);
router.post(
  '/forgot-password',
  authLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.get('/verify-email', authController.verifyEmail);
router.get('/profile', authenticate, authController.getProfile);

export default router;
