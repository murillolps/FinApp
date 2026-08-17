import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { pool } from '../lib/db.js';
import { seedCategories } from '../lib/seedCategories.js';

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function toUserResponse(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    initialBalance: user.initial_balance,
  };
}

export async function register(req, res) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Dados inválidos.' });
  }
  const { email, name, password } = parsed.data;

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    return res.status(409).json({ error: 'E-mail já cadastrado.' });
  }

  const id = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(password, 10);

  await pool.query(
    'INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)',
    [id, email, name, passwordHash],
  );
  await seedCategories(id);

  res.status(201).json({
    user: toUserResponse({ id, name, email, initial_balance: 0 }),
    token: signToken(id),
  });
}

export async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Dados inválidos.' });
  }
  const { email, password } = parsed.data;

  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
  }

  res.json({ user: toUserResponse(user), token: signToken(user.id) });
}
