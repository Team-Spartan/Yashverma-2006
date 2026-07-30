import { Router } from 'express';
import { userController } from '../controllers';
import { validate, authenticate, authorize, upload } from '../middleware';
import { updateProfileSchema, changePasswordSchema, paginationSchema } from '../validators/user';
import { updateUserRoleSchema } from '../validators/user';

const router = Router();

router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, validate(updateProfileSchema), userController.updateProfile);
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  userController.changePassword,
);
router.delete('/profile', authenticate, userController.deleteAccount);
router.post('/avatar', authenticate, upload.single('avatar'), userController.uploadAvatar);

router.get(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate(paginationSchema, 'query'),
  userController.getAllUsers,
);
router.get('/stats', authenticate, authorize('ADMIN'), userController.getStats);
router.get('/:id', authenticate, authorize('ADMIN'), userController.getUserById);
router.put(
  '/:id/role',
  authenticate,
  authorize('ADMIN'),
  validate(updateUserRoleSchema),
  userController.updateUserRole,
);
router.delete('/:id', authenticate, authorize('ADMIN'), userController.deleteUser);

export default router;
