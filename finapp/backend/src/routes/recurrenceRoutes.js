import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  listRecurrences,
  createRecurrence,
  updateRecurrence,
  toggleRecurrence,
  deleteRecurrence,
} from '../controllers/recurrenceController.js';

export const recurrenceRoutes = Router();

recurrenceRoutes.use(requireAuth);
recurrenceRoutes.get('/', asyncHandler(listRecurrences));
recurrenceRoutes.post('/', asyncHandler(createRecurrence));
recurrenceRoutes.put('/:id', asyncHandler(updateRecurrence));
recurrenceRoutes.patch('/:id/toggle', asyncHandler(toggleRecurrence));
recurrenceRoutes.delete('/:id', asyncHandler(deleteRecurrence));
