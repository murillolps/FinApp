import { z } from 'zod';
import {
  getInitialBalance,
  getBalanceAsOf,
  getTransactionsUpTo,
  getMonthRealTransactions,
  getMonthCombinedTransactions,
  getAverageMonthlyIncome,
} from '../services/balanceService.js';
import { getProjectedTransactions } from '../services/projectionService.js';

const querySchema = z.object({ month: z.string().regex(/^\d{4}-\d{2}$/) });

const round2 = (value) => Math.round(value * 100) / 100;

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

function monthBounds(month) {
  const [year, mon] = month.split('-').map(Number);
  const lastDay = new Date(year, mon, 0).getDate();
  return {
    start: `${month}-01`,
    end: `${month}-${String(lastDay).padStart(2, '0')}`,
  };
}

export async function getDashboard(req, res) {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Parâmetros inválidos.' });
  }
  const { month } = parsed.data;
  const { userId } = req;

  const today = todayISO();
  const { start: monthStart, end: monthEnd } = monthBounds(month);

  // "Hoje" só existe de fato dentro do mês corrente: meses passados usam o
  // saldo no fim do período; meses futuros ainda não têm nada realizado.
  let asOfDate = monthStart;
  if (month === today.slice(0, 7)) asOfDate = today;
  else if (monthStart < today) asOfDate = monthEnd;

  const currentBalance = await getBalanceAsOf(userId, asOfDate);

  const initialBalance = await getInitialBalance(userId);
  const upToTransactions = await getTransactionsUpTo(userId, asOfDate);
  let running = initialBalance;
  let balanceBeforeLastIncome = initialBalance;
  for (const row of upToTransactions) {
    if (row.type === 'income') {
      balanceBeforeLastIncome = running;
    }
    running += row.type === 'income' ? Number(row.amount) : -Number(row.amount);
  }

  const monthRealRows = await getMonthRealTransactions(userId, month);
  let monthSpent = 0;
  let monthSpentCount = 0;
  for (const row of monthRealRows) {
    if (row.type === 'expense') {
      monthSpent += Number(row.amount);
      monthSpentCount += 1;
    }
  }

  const { balanceBefore, rows: evolutionRows } = await getMonthCombinedTransactions(
    userId,
    month,
  );
  const projectedMonthEnd =
    evolutionRows.length > 0 ? evolutionRows[evolutionRows.length - 1].balance : balanceBefore;

  const balanceEvolution = evolutionRows.map((row) => ({
    date: row.occurred_on,
    balance: round2(row.balance),
    projected: Boolean(row.projected),
  }));

  const projectedRows = await getProjectedTransactions(userId, month);
  const upcomingRecurrences = projectedRows
    .sort((a, b) => (a.occurred_on < b.occurred_on ? -1 : 1))
    .slice(0, 5)
    .map((row) => ({
      id: row.id,
      recurrenceId: row.recurrence_id,
      description: row.description,
      occurredOn: row.occurred_on,
      type: row.type,
      amount: Number(row.amount),
    }));

  const avgMonthlyIncome = await getAverageMonthlyIncome(userId);

  res.json({
    currentBalance: round2(currentBalance),
    balanceBeforeLastIncome: round2(balanceBeforeLastIncome),
    projectedMonthEnd: round2(projectedMonthEnd),
    monthSpent: round2(monthSpent),
    monthSpentCount,
    avgMonthlyIncome: round2(avgMonthlyIncome),
    balanceEvolution,
    upcomingRecurrences,
  });
}
