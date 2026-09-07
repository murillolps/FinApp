import crypto from 'node:crypto';
import { pool } from './db.js';

const SEED_CATEGORIES = [
  { name: 'Salário', type: 'income', color: '#5a8a5a', icon: '💼' },
  { name: 'Alimentação', type: 'expense', color: '#b35a5a', icon: '🍔' },
  { name: 'Casa', type: 'expense', color: '#c7b07a', icon: '🏠' },
  { name: 'Transporte', type: 'expense', color: '#4a5a8a', icon: '🚗' },
  { name: 'Lazer', type: 'expense', color: '#8a9acb', icon: '🎬' },
  { name: 'Saúde', type: 'expense', color: '#6a8a8a', icon: '💊' },
  { name: 'Outros', type: 'expense', color: '#9a9aa5', icon: '📦' },
];

export async function seedCategories(userId) {
  const values = SEED_CATEGORIES.map((category) => [
    crypto.randomUUID(),
    userId,
    category.name,
    category.type,
    category.color,
    category.icon,
  ]);

  await pool.query(
    'INSERT INTO categories (id, user_id, name, type, color, icon) VALUES ?',
    [values],
  );
}
