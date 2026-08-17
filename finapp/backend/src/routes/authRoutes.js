import { Router } from 'express';
import { register, login } from '../controllers/authController.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export const authRoutes = Router();

authRoutes.post('/register', asyncHandler(register));
authRoutes.post('/login', asyncHandler(login));
