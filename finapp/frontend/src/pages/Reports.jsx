import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { api } from '../lib/api.js';
import NavBar from '../components/NavBar.jsx';

const MONTHS_WINDOW = 6;
const MONTH_ABBR = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function shiftMonth(month, delta) {
  const [year, mon] = month.split('-').map(Number);
  const date = new Date(year, mon - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthLabel(month) {
  const [year, mon] = month.split('-').map(Number);
  const label = new Date(year, mon - 1, 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatMonthShort(month) {
  const [year, mon] = month.split('-').map(Number);
  return `${MONTH_ABBR[mon - 1]}/${String(year).slice(2)}`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function Reports() {
  const [month, setMonth] = useState(currentMonth());
  const [byCategory, setByCategory] = useState([]);
  const [monthlyBalance, setMonthlyBalance] = useState([]);
  const [incomeVsExpense, setIncomeVsExpense] = useState([]);

  useEffect(() => {
    api
      .get('/reports/by-category', { params: { month } })
      .then(({ data }) => setByCategory(data));
  }, [month]);

  useEffect(() => {
    api
      .get('/reports/monthly-balance', { params: { months: MONTHS_WINDOW } })
      .then(({ data }) => setMonthlyBalance(data));
    api
      .get('/reports/income-vs-expense', { params: { months: MONTHS_WINDOW } })
      .then(({ data }) => setIncomeVsExpense(data));
  }, []);

  const categoryTotal = byCategory.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-1">Relatórios</h1>
        <p className="text-slate-500 mb-6">
          Visualizações pra entender padrões: pra onde o dinheiro vai, como está mês a mês.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-3xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Gastos por categoria</h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMonth((m) => shiftMonth(m, -1))}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                >
                  ‹
                </button>
                <span className="text-sm w-28 text-center">{formatMonthLabel(month)}</span>
                <button
                  onClick={() => setMonth((m) => shiftMonth(m, 1))}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                >
                  ›
                </button>
              </div>
            </div>

            {byCategory.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-10">
                Nenhum gasto neste mês.
              </p>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="60%" height={220}>
                  <PieChart>
                    <Pie
                      data={byCategory}
                      dataKey="total"
                      nameKey="categoryName"
                      innerRadius={45}
                      outerRadius={90}
                    >
                      {byCategory.map((entry) => (
                        <Cell key={entry.categoryName} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
                <ul className="flex-1 space-y-1 text-sm">
                  {byCategory.map((item) => (
                    <li key={item.categoryName} className="flex items-center gap-2">
                      <span
                        className="inline-block w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="flex-1">{item.categoryName}</span>
                      <span className="text-slate-500">
                        {categoryTotal > 0 ? Math.round((item.total / categoryTotal) * 100) : 0}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-4">
            <h3 className="font-semibold mb-2">Saldo final mês a mês</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyBalance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tickFormatter={formatMonthShort} tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} width={70} tickFormatter={formatCurrency} />
                <Tooltip
                  labelFormatter={formatMonthShort}
                  formatter={(value) => formatCurrency(value)}
                />
                <Bar dataKey="balance" radius={[4, 4, 0, 0]}>
                  {monthlyBalance.map((entry) => (
                    <Cell key={entry.month} fill={entry.balance > 0 ? '#5a8a5a' : '#b35a5a'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-4">
          <h3 className="font-semibold mb-2">Entrada x Saída (últimos {MONTHS_WINDOW} meses)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={incomeVsExpense}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tickFormatter={formatMonthShort} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} width={70} tickFormatter={formatCurrency} />
              <Tooltip
                labelFormatter={formatMonthShort}
                formatter={(value) => formatCurrency(value)}
              />
              <Bar dataKey="income" name="Entradas" fill="#5a8a5a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Saídas" fill="#b35a5a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 text-xs text-slate-500 mt-2">
            <span>
              <span className="inline-block w-3 h-3 rounded-full bg-[#5a8a5a] mr-1 align-middle" />
              Entradas
            </span>
            <span>
              <span className="inline-block w-3 h-3 rounded-full bg-[#b35a5a] mr-1 align-middle" />
              Saídas
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
