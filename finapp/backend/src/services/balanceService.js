import { pool } from '../lib/db.js';

function monthRange(month) {
  const [year, mon] = month.split('-').map(Number);
  const start = `${month}-01`;
  const end =
    mon === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(mon + 1).padStart(2, '0')}-01`;
  return { start, end };
}

export async function getBalanceBeforeMonth(userId, month) {
  const { start } = monthRange(month);
  const [[user]] = await pool.query('SELECT initial_balance FROM users WHERE id = ?', [userId]);
  const [[sums]] = await pool.query(
    `SELECT
       COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
       COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
     FROM transactions WHERE user_id = ? AND occurred_on < ?`,
    [userId, start],
  );
  return Number(user.initial_balance) + Number(sums.income) - Number(sums.expense);
}

export async function getMonthTransactionsWithBalance(userId, month) {
  const { start, end } = monthRange(month);
  const balanceBefore = await getBalanceBeforeMonth(userId, month);

  const [rows] = await pool.query(
    `SELECT t.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE t.user_id = ? AND t.occurred_on >= ? AND t.occurred_on < ?
     ORDER BY t.occurred_on ASC, t.created_at ASC, t.id ASC`,
    [userId, start, end],
  );

  let running = balanceBefore;
  const transactions = rows.map((row) => {
    running += row.type === 'income' ? Number(row.amount) : -Number(row.amount);
    return { ...row, balance: running };
  });

  return { balanceBefore, transactions };
}

export async function getAverageMonthlyIncome(userId) {
  const [rows] = await pool.query(
    `SELECT DATE_FORMAT(occurred_on, '%Y-%m') AS month, SUM(amount) AS total
     FROM transactions WHERE user_id = ? AND type = 'income'
     GROUP BY month`,
    [userId],
  );
  if (rows.length === 0) return 0;
  const total = rows.reduce((sum, row) => sum + Number(row.total), 0);
  return total / rows.length;
}
