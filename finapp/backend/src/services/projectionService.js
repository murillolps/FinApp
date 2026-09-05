import { pool } from '../lib/db.js';

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function toISODate(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function withinRange(dateISO, startDate, endDate) {
  if (dateISO < startDate) return false;
  if (endDate && dateISO > endDate) return false;
  return true;
}

// day_of_month tem significado por frequência:
// - monthly: dia do mês (1-31, ajustado para o último dia caso o mês seja menor)
// - weekly: dia da semana ISO (1=segunda ... 7=domingo)
// - yearly: dia do mês, dentro do mês da data de início
function occurrenceDatesForMonth(recurrence, month) {
  const [year, mon] = month.split('-').map(Number);
  const dates = [];

  if (recurrence.frequency === 'monthly') {
    const day = Math.min(recurrence.day_of_month, daysInMonth(year, mon));
    const dateISO = toISODate(year, mon, day);
    if (withinRange(dateISO, recurrence.start_date, recurrence.end_date)) dates.push(dateISO);
  } else if (recurrence.frequency === 'weekly') {
    const total = daysInMonth(year, mon);
    for (let day = 1; day <= total; day += 1) {
      const jsWeekday = new Date(year, mon - 1, day).getDay();
      const isoWeekday = jsWeekday === 0 ? 7 : jsWeekday;
      if (isoWeekday === recurrence.day_of_month) {
        const dateISO = toISODate(year, mon, day);
        if (withinRange(dateISO, recurrence.start_date, recurrence.end_date)) dates.push(dateISO);
      }
    }
  } else if (recurrence.frequency === 'yearly') {
    const startMonth = Number(recurrence.start_date.slice(5, 7));
    if (startMonth === mon) {
      const day = Math.min(recurrence.day_of_month, daysInMonth(year, mon));
      const dateISO = toISODate(year, mon, day);
      if (withinRange(dateISO, recurrence.start_date, recurrence.end_date)) dates.push(dateISO);
    }
  }

  return dates;
}

export async function getProjectedTransactions(userId, month) {
  const [recurrences] = await pool.query(
    `SELECT r.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
     FROM recurrences r
     JOIN categories c ON c.id = r.category_id
     WHERE r.user_id = ? AND r.active = TRUE`,
    [userId],
  );
  if (recurrences.length === 0) return [];

  const [realized] = await pool.query(
    `SELECT recurrence_id, occurred_on FROM transactions
     WHERE user_id = ? AND recurrence_id IS NOT NULL`,
    [userId],
  );
  const realizedSet = new Set(realized.map((row) => `${row.recurrence_id}|${row.occurred_on}`));

  const projected = [];
  for (const recurrence of recurrences) {
    for (const occurredOn of occurrenceDatesForMonth(recurrence, month)) {
      if (realizedSet.has(`${recurrence.id}|${occurredOn}`)) continue;
      projected.push({
        id: `projected-${recurrence.id}-${occurredOn}`,
        category_id: recurrence.category_id,
        recurrence_id: recurrence.id,
        type: recurrence.type,
        amount: Number(recurrence.amount),
        occurred_on: occurredOn,
        description: recurrence.description,
        category_name: recurrence.category_name,
        category_color: recurrence.category_color,
        category_icon: recurrence.category_icon,
        projected: true,
      });
    }
  }

  return projected;
}
