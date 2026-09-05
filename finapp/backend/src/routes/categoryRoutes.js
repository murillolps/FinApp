import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  listCategories,
  createCategory,
  updateCategory,
  archiveCategory,
} from '../controllers/categoryController.js';

export const categoryRoutes = Router();

categoryRoutes.use(requireAuth);
categoryRoutes.get('/', asyncHandler(listCategories));
categoryRoutes.post('/', asyncHandler(createCategory));
categoryRoutes.put('/:id', asyncHandler(updateCategory));
categoryRoutes.patch('/:id/archive', asyncHandler(archiveCategory));
