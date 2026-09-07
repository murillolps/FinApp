import crypto from 'node:crypto';
import { z } from 'zod';
import { pool } from '../lib/db.js';

const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['income', 'expense']),
  color: z.string().min(1).max(20),
  icon: z.string().min(1).max(10),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().min(1).max(20),
  icon: z.string().min(1).max(10),
});

function toCategoryResponse(category) {
  return {
    id: category.id,
    name: category.name,
    type: category.type,
    color: category.color,
    icon: category.icon,
  };
}

async function findOwnedCategory(id, userId) {
  const [rows] = await pool.query(
    'SELECT * FROM categories WHERE id = ? AND user_id = ?',
    [id, userId],
  );
  return rows[0];
}

export async function listCategories(req, res) {
  const { type } = req.query;
  const params = [req.userId];
  let query = 'SELECT * FROM categories WHERE user_id = ? AND archived = FALSE';

  if (type === 'income' || type === 'expense') {
    query += ' AND type = ?';
    params.push(type);
  }
  query += ' ORDER BY name';

  const [rows] = await pool.query(query, params);
  res.json(rows.map(toCategoryResponse));
}

export async function createCategory(req, res) {
  const parsed = createCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Dados inválidos.' });
  }
  const { name, type, color, icon } = parsed.data;
  const id = crypto.randomUUID();

  await pool.query(
    'INSERT INTO categories (id, user_id, name, type, color, icon) VALUES (?, ?, ?, ?, ?, ?)',
    [id, req.userId, name, type, color, icon],
  );

  res.status(201).json(toCategoryResponse({ id, name, type, color, icon }));
}

export async function updateCategory(req, res) {
  const parsed = updateCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Dados inválidos.' });
  }

  const category = await findOwnedCategory(req.params.id, req.userId);
  if (!category) {
    return res.status(404).json({ error: 'Categoria não encontrada.' });
  }

  const { name, color, icon } = parsed.data;
  await pool.query('UPDATE categories SET name = ?, color = ?, icon = ? WHERE id = ?', [
    name,
    color,
    icon,
    category.id,
  ]);

  res.json(toCategoryResponse({ ...category, name, color, icon }));
}

export async function archiveCategory(req, res) {
  const category = await findOwnedCategory(req.params.id, req.userId);
  if (!category) {
    return res.status(404).json({ error: 'Categoria não encontrada.' });
  }

  await pool.query('UPDATE categories SET archived = TRUE WHERE id = ?', [category.id]);

  res.json(toCategoryResponse(category));
}
