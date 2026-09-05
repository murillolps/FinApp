import crypto from 'node:crypto';
import { z } from 'zod';
import { pool } from '../lib/db.js';
import {
  getMonthTransactionsWithBalance,
  getAverageMonthlyIncome,
} from '../services/balanceService.js';

const listQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  type: z.enum(['income', 'expense']).optional(),
  categoryId: z.string().min(1).optional(),
});

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive(),
  occurredOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  categoryId: z.string().min(1),
  description: z.string().max(255).optional().nullable(),
});

const round2 = (value) => Math.round(value * 100) / 100;

function toTransactionResponse(row) {
  return {
    id: row.id,
    type: row.type,
    amount: Number(row.amount),
    occurredOn: row.occurred_on,
    description: row.description,
    categoryId: row.category_id,
    recurrenceId: row.recurrence_id ?? null,
  };
}

function toTransactionRowResponse(row) {
  return {
    id: row.id,
    type: row.type,
    amount: Number(row.amount),
    occurredOn: row.occurred_on,
    description: row.description,
    categoryId: row.category_id,
    category: {
      id: row.category_id,
      name: row.category_name,
      color: row.category_color,
      icon: row.category_icon,
    },
    balance: round2(row.balance),
  };
}

async function findOwnedTransaction(id, userId) {
  const [rows] = await pool.query(
    'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
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

export async function listTransactions(req, res) {
  const parsedQuery = listQuerySchema.safeParse(req.query);
  if (!parsedQuery.success) {
    return res.status(400).json({ error: 'Parâmetros inválidos.' });
  }
  const { month, type, categoryId } = parsedQuery.data;

  const { balanceBefore, transactions } = await getMonthTransactionsWithBalance(
    req.userId,
    month,
  );
  const avgMonthlyIncome = await getAverageMonthlyIncome(req.userId);

  let totalIncome = 0;
  let totalExpense = 0;
  for (const row of transactions) {
    if (row.type === 'income') totalIncome += Number(row.amount);
    else totalExpense += Number(row.amount);
  }
  const endBalance =
    transactions.length > 0 ? transactions[transactions.length - 1].balance : balanceBefore;

  let filtered = transactions;
  if (type) filtered = filtered.filter((row) => row.type === type);
  if (categoryId) filtered = filtered.filter((row) => row.category_id === categoryId);

  res.json({
    transactions: filtered.map(toTransactionRowResponse),
    summary: {
      totalIncome: round2(totalIncome),
      totalExpense: round2(totalExpense),
      endBalance: round2(endBalance),
      avgMonthlyIncome: round2(avgMonthlyIncome),
    },
  });
}

export async function createTransaction(req, res) {
  const parsed = transactionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Dados inválidos.' });
  }
  const { type, amount, occurredOn, categoryId, description } = parsed.data;

  const category = await findOwnedCategory(categoryId, req.userId);
  if (!category || category.type !== type) {
    return res.status(400).json({ error: 'Categoria inválida para o tipo selecionado.' });
  }
  if (category.archived) {
    return res
      .status(400)
      .json({ error: 'Categoria arquivada não pode ser usada em novos lançamentos.' });
  }

  const id = crypto.randomUUID();
  await pool.query(
    'INSERT INTO transactions (id, user_id, category_id, type, amount, occurred_on, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, req.userId, categoryId, type, amount, occurredOn, description || null],
  );

  res.status(201).json(
    toTransactionResponse({
      id,
      category_id: categoryId,
      recurrence_id: null,
      type,
      amount,
      occurred_on: occurredOn,
      description: description || null,
    }),
  );
}

export async function updateTransaction(req, res) {
  const parsed = transactionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Dados inválidos.' });
  }

  const transaction = await findOwnedTransaction(req.params.id, req.userId);
  if (!transaction) {
    return res.status(404).json({ error: 'Transação não encontrada.' });
  }

  const { type, amount, occurredOn, categoryId, description } = parsed.data;

  const category = await findOwnedCategory(categoryId, req.userId);
  if (!category || category.type !== type) {
    return res.status(400).json({ error: 'Categoria inválida para o tipo selecionado.' });
  }
  if (category.archived && categoryId !== transaction.category_id) {
    return res
      .status(400)
      .json({ error: 'Categoria arquivada não pode ser usada em novos lançamentos.' });
  }

  await pool.query(
    'UPDATE transactions SET type = ?, amount = ?, occurred_on = ?, category_id = ?, description = ? WHERE id = ?',
    [type, amount, occurredOn, categoryId, description || null, transaction.id],
  );

  res.json(
    toTransactionResponse({
      ...transaction,
      type,
      amount,
      occurred_on: occurredOn,
      category_id: categoryId,
      description: description || null,
    }),
  );
}

export async function deleteTransaction(req, res) {
  const transaction = await findOwnedTransaction(req.params.id, req.userId);
  if (!transaction) {
    return res.status(404).json({ error: 'Transação não encontrada.' });
  }

  await pool.query('DELETE FROM transactions WHERE id = ?', [transaction.id]);
  res.status(204).send();
}
