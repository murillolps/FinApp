import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { getDashboard } from '../controllers/dashboardController.js';

export const dashboardRoutes = Router();

dashboardRoutes.use(requireAuth);
dashboardRoutes.get('/', asyncHandler(getDashboard));
