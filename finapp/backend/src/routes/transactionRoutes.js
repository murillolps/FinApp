import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactionController.js';

export const transactionRoutes = Router();

transactionRoutes.use(requireAuth);
transactionRoutes.get('/', asyncHandler(listTransactions));
transactionRoutes.post('/', asyncHandler(createTransaction));
transactionRoutes.put('/:id', asyncHandler(updateTransaction));
transactionRoutes.delete('/:id', asyncHandler(deleteTransaction));
