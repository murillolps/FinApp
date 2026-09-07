import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { getMe, updateMe } from '../controllers/userController.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export const userRoutes = Router();

userRoutes.get('/me', requireAuth, asyncHandler(getMe));
userRoutes.patch('/me', requireAuth, asyncHandler(updateMe));
