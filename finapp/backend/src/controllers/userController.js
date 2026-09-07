import { z } from 'zod';
import { pool } from '../lib/db.js';

const updateMeSchema = z.object({
  initialBalance: z.number(),
});

function toUserResponse(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    initialBalance: user.initial_balance,
  };
}

export async function getMe(req, res) {
  const [rows] = await pool.query(
    'SELECT id, name, email, initial_balance FROM users WHERE id = ?',
    [req.userId],
  );
  res.json(toUserResponse(rows[0]));
}

export async function updateMe(req, res) {
  const parsed = updateMeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Dados inválidos.' });
  }

  await pool.query('UPDATE users SET initial_balance = ? WHERE id = ?', [
    parsed.data.initialBalance,
    req.userId,
  ]);

  const [rows] = await pool.query(
    'SELECT id, name, email, initial_balance FROM users WHERE id = ?',
    [req.userId],
  );
  res.json(toUserResponse(rows[0]));
}
