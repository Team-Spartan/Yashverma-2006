import { env } from '../config/env';
import { logger } from '../utils/logger';

class EmailService {
  async sendVerificationEmail(email: string, token: string) {
    const verifyUrl = `http://localhost:${env.PORT}/api/auth/verify-email?token=${token}`;
    logger.info(`Verification email to ${email}: ${verifyUrl}`);
  }

  async sendResetPasswordEmail(email: string, token: string) {
    const resetUrl = `http://localhost:${env.PORT}/api/auth/reset-password?token=${token}`;
    logger.info(`Reset password email to ${email}: ${resetUrl}`);
  }

  async sendEmail(to: string, subject: string, body: string) {
    logger.info(`Email to ${to}: Subject=${subject}, Body=${body}`);
  }
}

export const emailService = new EmailService();
