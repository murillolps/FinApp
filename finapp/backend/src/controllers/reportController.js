import { z } from 'zod';
import { pool } from '../lib/db.js';
import { getBalanceAsOf, getMonthLastDay } from '../services/balanceService.js';

const byCategoryQuerySchema = z.object({ month: z.string().regex(/^\d{4}-\d{2}$/) });
const monthsQuerySchema = z.object({
  months: z.coerce.number().int().min(1).max(24).optional(),
});

const round2 = (value) => Math.round(value * 100) / 100;

function lastMonths(count) {
  const now = new Date();
  const months = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
}

function monthRangeBounds(month) {
  const [year, mon] = month.split('-').map(Number);
  const start = `${month}-01`;
  const end =
    mon === 12 ? `${year + 1}-01-01` : `${year}-${String(mon + 1).padStart(2, '0')}-01`;
  return { start, end };
}

export async function getByCategoryReport(req, res) {
  const parsed = byCategoryQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Parâmetros inválidos.' });
  }
  const { start, end } = monthRangeBounds(parsed.data.month);

  const [rows] = await pool.query(
    `SELECT c.name AS category_name, c.color AS color, SUM(t.amount) AS total
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE t.user_id = ? AND t.type = 'expense' AND t.occurred_on >= ? AND t.occurred_on < ?
     GROUP BY c.id, c.name, c.color
     ORDER BY total DESC`,
    [req.userId, start, end],
  );

  res.json(
    rows.map((row) => ({
      categoryName: row.category_name,
      color: row.color,
      total: round2(Number(row.total)),
    })),
  );
}

export async function getMonthlyBalanceReport(req, res) {
  const parsed = monthsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Parâmetros inválidos.' });
  }
  const months = lastMonths(parsed.data.months || 6);

  const balances = await Promise.all(
    months.map(async (month) => ({
      month,
      balance: round2(await getBalanceAsOf(req.userId, getMonthLastDay(month))),
    })),
  );

  res.json(balances);
}

export async function getIncomeVsExpenseReport(req, res) {
  const parsed = monthsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Parâmetros inválidos.' });
  }
  const months = lastMonths(parsed.data.months || 6);
  const start = `${months[0]}-01`;
  const { end } = monthRangeBounds(months[months.length - 1]);

  const [rows] = await pool.query(
    `SELECT DATE_FORMAT(occurred_on, '%Y-%m') AS month,
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
     FROM transactions
     WHERE user_id = ? AND occurred_on >= ? AND occurred_on < ?
     GROUP BY month`,
    [req.userId, start, end],
  );

  const byMonth = new Map(rows.map((row) => [row.month, row]));
  const result = months.map((month) => {
    const row = byMonth.get(month);
    return {
      month,
      income: round2(row ? Number(row.income) : 0),
      expense: round2(row ? Number(row.expense) : 0),
    };
  });

  res.json(result);
}
