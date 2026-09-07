import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { api } from '../lib/api.js';
import NavBar from '../components/NavBar.jsx';
import TransactionForm from '../components/TransactionForm.jsx';

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

function formatDayMonth(dateStr) {
  const [, m, d] = dateStr.split('-');
  return `${d}/${m}`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function balanceColorClass(balance, avgMonthlyIncome) {
  if (balance <= 0) return 'text-red-600';
  if (balance > 0.3 * avgMonthlyIncome) return 'text-green-600';
  return 'text-amber-600';
}

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [month, setMonth] = useState(currentMonth());
  const [dashboard, setDashboard] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formDefaultType, setFormDefaultType] = useState('expense');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/me')
      .then(({ data }) => setUser(data))
      .catch(() => navigate('/login'));
    api.get('/categories').then(({ data }) => setCategories(data));
  }, [navigate]);

  function loadDashboard() {
    setLoading(true);
    api
      .get('/dashboard', { params: { month } })
      .then(({ data }) => {
        setDashboard(data);
        setError('');
      })
      .catch(() => setError('Não foi possível carregar o dashboard. Tente novamente.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  function openQuickAction(type) {
    setFormDefaultType(type);
    setShowForm(true);
  }

  function handleSaved() {
    setShowForm(false);
    loadDashboard();
  }

  const firstProjectedIndex = dashboard
    ? dashboard.balanceEvolution.findIndex((point) => point.projected)
    : -1;

  const chartData = dashboard
    ? dashboard.balanceEvolution.map((point, index) => ({
        date: formatDayMonth(point.date),
        real: point.projected ? null : point.balance,
        projected:
          point.projected || index === firstProjectedIndex - 1 ? point.balance : null,
      }))
    : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-3xl shadow-lg p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Olá, {user ? user.name : '...'} 👋</p>
            <p className="text-lg font-bold">{formatMonthLabel(month)}</p>
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => setMonth((m) => shiftMonth(m, -1))}
              className="rounded-xl border border-slate-300 px-3 py-2"
            >
              ‹ Mês anterior
            </button>
            <button
              onClick={() => setMonth(currentMonth())}
              className="rounded-xl border border-slate-300 px-3 py-2"
            >
              Hoje
            </button>
            <button
              onClick={() => setMonth((m) => shiftMonth(m, 1))}
              className="rounded-xl border border-slate-300 px-3 py-2"
            >
              Próximo mês ›
            </button>
          </div>
        </div>

        {loading && !dashboard && (
          <p className="text-center text-slate-400 py-10">Carregando...</p>
        )}
        {!loading && error && (
          <p className="text-center text-red-600 py-10">{error}</p>
        )}

        {dashboard && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-white rounded-3xl shadow-lg p-4">
                <p className="text-sm text-slate-500">Saldo atual</p>
                <p
                  className={`text-xl font-bold ${balanceColorClass(
                    dashboard.currentBalance,
                    dashboard.avgMonthlyIncome,
                  )}`}
                >
                  {formatCurrency(dashboard.currentBalance)}
                </p>
              </div>
              <div className="bg-white rounded-3xl shadow-lg p-4">
                <p className="text-sm text-slate-500">Saldo antes da última entrada</p>
                <p className="text-xl font-bold text-slate-800">
                  {formatCurrency(dashboard.balanceBeforeLastIncome)}
                </p>
              </div>
              <div className="bg-white rounded-3xl shadow-lg p-4">
                <p className="text-sm text-slate-500">Projeção fim do mês</p>
                <p
                  className={`text-xl font-bold ${balanceColorClass(
                    dashboard.projectedMonthEnd,
                    dashboard.avgMonthlyIncome,
                  )}`}
                >
                  {formatCurrency(dashboard.projectedMonthEnd)}
                </p>
              </div>
              <div className="bg-white rounded-3xl shadow-lg p-4">
                <p className="text-sm text-slate-500">Gasto no mês</p>
                <p className="text-xl font-bold text-red-600">
                  {formatCurrency(dashboard.monthSpent)}
                </p>
                <p className="text-xs text-slate-400">em {dashboard.monthSpentCount} lançamentos</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-3xl shadow-lg p-4">
                <h3 className="font-semibold mb-2">Evolução do saldo no mês</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} width={70} tickFormatter={formatCurrency} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Line
                      type="monotone"
                      dataKey="real"
                      stroke="#4a5a8a"
                      strokeWidth={2}
                      dot={false}
                      connectNulls={false}
                      name="Realizado"
                    />
                    <Line
                      type="monotone"
                      dataKey="projected"
                      stroke="#c7a04a"
                      strokeWidth={2}
                      strokeDasharray="5 4"
                      dot={false}
                      connectNulls
                      name="Projetado"
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex gap-4 text-xs text-slate-500 mt-2">
                  <span>
                    <span className="inline-block w-3 h-1 bg-[#4a5a8a] mr-1 align-middle" />
                    Realizado
                  </span>
                  <span>
                    <span className="inline-block w-3 h-1 bg-[#c7a04a] mr-1 align-middle" />
                    Projetado
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-lg p-4">
                <h3 className="font-semibold mb-2">Próximas recorrências</h3>
                <table className="w-full text-left text-sm">
                  <thead className="text-slate-500">
                    <tr>
                      <th className="py-1">Quando</th>
                      <th className="py-1">Item</th>
                      <th className="py-1 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.upcomingRecurrences.map((item) => (
                      <tr key={item.id} className="border-t border-slate-100">
                        <td className="py-2">{formatDayMonth(item.occurredOn)}</td>
                        <td className="py-2">{item.description}</td>
                        <td
                          className={`py-2 text-right ${
                            item.type === 'income' ? 'text-green-600' : 'text-slate-800'
                          }`}
                        >
                          {item.type === 'income' ? '+ ' : ''}
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                    {dashboard.upcomingRecurrences.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-4 text-center text-slate-400">
                          Nenhuma recorrência prevista para este mês.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-4 flex items-center justify-between flex-wrap gap-3">
              <h3 className="font-semibold">Ações rápidas</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => openQuickAction('income')}
                  className="rounded-2xl bg-green-600 text-white px-4 py-2"
                >
                  + Entrada
                </button>
                <button
                  onClick={() => openQuickAction('expense')}
                  className="rounded-2xl bg-red-600 text-white px-4 py-2"
                >
                  − Saída
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showForm && (
        <TransactionForm
          transaction={null}
          categories={categories}
          defaultType={formDefaultType}
          onClose={() => setShowForm(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

export default Dashboard;
