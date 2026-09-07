import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  getByCategoryReport,
  getMonthlyBalanceReport,
  getIncomeVsExpenseReport,
} from '../controllers/reportController.js';

export const reportRoutes = Router();

reportRoutes.use(requireAuth);
reportRoutes.get('/by-category', asyncHandler(getByCategoryReport));
reportRoutes.get('/monthly-balance', asyncHandler(getMonthlyBalanceReport));
reportRoutes.get('/income-vs-expense', asyncHandler(getIncomeVsExpenseReport));
