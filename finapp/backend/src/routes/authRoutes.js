import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login } from '../controllers/authController.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export const authRoutes = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Tente novamente em alguns minutos.' },
});

authRoutes.use(authLimiter);
authRoutes.post('/register', asyncHandler(register));
authRoutes.post('/login', asyncHandler(login));
