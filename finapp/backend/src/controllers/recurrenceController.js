import crypto from 'node:crypto';
import { z } from 'zod';
import { pool } from '../lib/db.js';

const recurrenceSchema = z
  .object({
    categoryId: z.string().min(1),
    type: z.enum(['income', 'expense']),
    amount: z.coerce.number().positive(),
    description: z.string().min(1).max(255),
    frequency: z.enum(['monthly', 'weekly', 'yearly']),
    dayOfMonth: z.coerce.number().int().min(1).max(31),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .nullable(),
  })
  .refine((data) => data.frequency !== 'weekly' || data.dayOfMonth <= 7, {
    message: 'Dia da semana deve ser entre 1 e 7.',
    path: ['dayOfMonth'],
  });

const statusSchema = z.enum(['active', 'paused', 'all']).optional();

function toRecurrenceResponse(row) {
  return {
    id: row.id,
    categoryId: row.category_id,
    type: row.type,
    amount: Number(row.amount),
    description: row.description,
    frequency: row.frequency,
    dayOfMonth: row.day_of_month,
    startDate: row.start_date,
    endDate: row.end_date,
    active: Boolean(row.active),
    category: {
      id: row.category_id,
      name: row.category_name,
      color: row.category_color,
      icon: row.category_icon,
    },
  };
}

async function findOwnedRecurrence(id, userId) {
  const [rows] = await pool.query(
    `SELECT r.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
     FROM recurrences r
     JOIN categories c ON c.id = r.category_id
     WHERE r.id = ? AND r.user_id = ?`,
    [id, userId],
  );
  return rows[0];
}

async function findOwnedCategory(id, userId) {
  const [rows] = await pool.query(
    'SELECT * FROM categories WHERE id = ? AND user_id = ?',
    [id, userId],
  );
  return rows[0];
}

export async function listRecurrences(req, res) {
  const parsedStatus = statusSchema.safeParse(req.query.status);
  if (!parsedStatus.success) {
    return res.status(400).json({ error: 'Parâmetro status inválido.' });
  }
  const status = parsedStatus.data || 'all';

  let query = `SELECT r.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
    FROM recurrences r
    JOIN categories c ON c.id = r.category_id
    WHERE r.user_id = ?`;
  const params = [req.userId];

  if (status === 'active') query += ' AND r.active = TRUE';
  else if (status === 'paused') query += ' AND r.active = FALSE';
  query += ' ORDER BY r.description';

  const [rows] = await pool.query(query, params);
  res.json(rows.map(toRecurrenceResponse));
}

export async function createRecurrence(req, res) {
  const parsed = recurrenceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Dados inválidos.' });
  }
  const { categoryId, type, amount, description, frequency, dayOfMonth, startDate, endDate } =
    parsed.data;

  const category = await findOwnedCategory(categoryId, req.userId);
  if (!category || category.type !== type) {
    return res.status(400).json({ error: 'Categoria inválida para o tipo selecionado.' });
  }
  if (category.archived) {
    return res
      .status(400)
      .json({ error: 'Categoria arquivada não pode ser usada em novas recorrências.' });
  }

  const id = crypto.randomUUID();
  await pool.query(
    `INSERT INTO recurrences (id, user_id, category_id, type, amount, description, frequency, day_of_month, start_date, end_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      req.userId,
      categoryId,
      type,
      amount,
      description,
      frequency,
      dayOfMonth,
      startDate,
      endDate || null,
    ],
  );

  res.status(201).json(
    toRecurrenceResponse({
      id,
      category_id: categoryId,
      type,
      amount,
      description,
      frequency,
      day_of_month: dayOfMonth,
      start_date: startDate,
      end_date: endDate || null,
      active: true,
      category_name: category.name,
      category_color: category.color,
      category_icon: category.icon,
    }),
  );
}

export async function updateRecurrence(req, res) {
  const parsed = recurrenceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Dados inválidos.' });
  }

  const recurrence = await findOwnedRecurrence(req.params.id, req.userId);
  if (!recurrence) {
    return res.status(404).json({ error: 'Recorrência não encontrada.' });
  }

  const { categoryId, type, amount, description, frequency, dayOfMonth, startDate, endDate } =
    parsed.data;

  const category = await findOwnedCategory(categoryId, req.userId);
  if (!category || category.type !== type) {
    return res.status(400).json({ error: 'Categoria inválida para o tipo selecionado.' });
  }
  if (category.archived && categoryId !== recurrence.category_id) {
    return res
      .status(400)
      .json({ error: 'Categoria arquivada não pode ser usada em novas recorrências.' });
  }

  await pool.query(
    `UPDATE recurrences
     SET category_id = ?, type = ?, amount = ?, description = ?, frequency = ?, day_of_month = ?, start_date = ?, end_date = ?
     WHERE id = ?`,
    [
      categoryId,
      type,
      amount,
      description,
      frequency,
      dayOfMonth,
      startDate,
      endDate || null,
      recurrence.id,
    ],
  );

  res.json(
    toRecurrenceResponse({
      ...recurrence,
      category_id: categoryId,
      type,
      amount,
      description,
      frequency,
      day_of_month: dayOfMonth,
      start_date: startDate,
      end_date: endDate || null,
      category_name: category.name,
      category_color: category.color,
      category_icon: category.icon,
    }),
  );
}

export async function toggleRecurrence(req, res) {
  const recurrence = await findOwnedRecurrence(req.params.id, req.userId);
  if (!recurrence) {
    return res.status(404).json({ error: 'Recorrência não encontrada.' });
  }

  const active = !recurrence.active;
  await pool.query('UPDATE recurrences SET active = ? WHERE id = ?', [active, recurrence.id]);

  res.json(toRecurrenceResponse({ ...recurrence, active }));
}

export async function deleteRecurrence(req, res) {
  const recurrence = await findOwnedRecurrence(req.params.id, req.userId);
  if (!recurrence) {
    return res.status(404).json({ error: 'Recorrência não encontrada.' });
  }

  await pool.query('DELETE FROM recurrences WHERE id = ?', [recurrence.id]);
  res.status(204).send();
}
