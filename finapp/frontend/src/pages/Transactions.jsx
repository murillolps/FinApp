import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import NavBar from '../components/NavBar.jsx';
import TransactionForm from '../components/TransactionForm.jsx';

const TYPE_LABEL = { income: 'Entrada', expense: 'Saída' };

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

function Transactions() {
  const [month, setMonth] = useState(currentMonth());
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formDefaultType, setFormDefaultType] = useState('expense');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data));
  }, []);

  function loadTransactions() {
    const params = { month };
    if (typeFilter) params.type = typeFilter;
    if (categoryFilter) params.categoryId = categoryFilter;
    api.get('/transactions', { params }).then(({ data }) => {
      setTransactions(data.transactions);
      setSummary(data.summary);
    });
  }

  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, typeFilter, categoryFilter]);

  const categoryFilterOptions = typeFilter
    ? categories.filter((category) => category.type === typeFilter)
    : categories;

  function openCreate(type) {
    setEditingTransaction(null);
    setFormDefaultType(type);
    setShowForm(true);
  }

  function openEdit(transaction) {
    setEditingTransaction(transaction);
    setFormDefaultType(transaction.type);
    setShowForm(true);
  }

  function handleSaved() {
    setShowForm(false);
    loadTransactions();
  }

  async function handleDelete(transaction) {
    if (!window.confirm('Excluir esta transação?')) return;
    await api.delete(`/transactions/${transaction.id}`);
    loadTransactions();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-1">Transações do Mês</h1>
        <p className="text-slate-500 mb-6">A tabela equivalente à sua planilha.</p>

        <div className="bg-white rounded-3xl shadow-lg p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMonth((m) => shiftMonth(m, -1))}
              className="rounded-xl border border-slate-300 px-3 py-2"
            >
              ‹
            </button>
            <span className="font-semibold w-40 text-center">{formatMonthLabel(month)}</span>
            <button
              onClick={() => setMonth((m) => shiftMonth(m, 1))}
              className="rounded-xl border border-slate-300 px-3 py-2"
            >
              ›
            </button>

            <select
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value);
                setCategoryFilter('');
              }}
              className="rounded-xl border border-slate-300 px-3 py-2"
            >
              <option value="">Tipo: todos</option>
              <option value="income">Entradas</option>
              <option value="expense">Saídas</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2"
            >
              <option value="">Todas as categorias</option>
              {categoryFilterOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => openCreate('income')}
              className="rounded-2xl bg-green-600 text-white px-4 py-2"
            >
              + Nova entrada
            </button>
            <button
              onClick={() => openCreate('expense')}
              className="rounded-2xl bg-red-600 text-white px-4 py-2"
            >
              + Nova saída
            </button>
          </div>
        </div>

        {summary && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-3xl shadow-lg p-4 text-center">
              <p className="text-sm text-slate-500">Entradas do mês</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(summary.totalIncome)}
              </p>
            </div>
            <div className="bg-white rounded-3xl shadow-lg p-4 text-center">
              <p className="text-sm text-slate-500">Saídas do mês</p>
              <p className="text-lg font-bold text-red-600">
                {formatCurrency(summary.totalExpense)}
              </p>
            </div>
            <div className="bg-white rounded-3xl shadow-lg p-4 text-center">
              <p className="text-sm text-slate-500">Saldo final</p>
              <p
                className={`text-lg font-bold ${balanceColorClass(
                  summary.endBalance,
                  summary.avgMonthlyIncome,
                )}`}
              >
                {formatCurrency(summary.endBalance)}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-slate-600 text-sm">
              <tr>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3 text-right">Entrada</th>
                <th className="px-4 py-3 text-right">Saída</th>
                <th className="px-4 py-3 text-right">Saldo</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{formatDayMonth(transaction.occurredOn)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        transaction.type === 'income'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {TYPE_LABEL[transaction.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="mr-2">{transaction.category.icon}</span>
                    {transaction.category.name}
                  </td>
                  <td className="px-4 py-3">{transaction.description}</td>
                  <td className="px-4 py-3 text-right">
                    {transaction.type === 'income' ? formatCurrency(transaction.amount) : ''}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {transaction.type === 'expense' ? formatCurrency(transaction.amount) : ''}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-semibold ${balanceColorClass(
                      transaction.balance,
                      summary?.avgMonthlyIncome || 0,
                    )}`}
                  >
                    {formatCurrency(transaction.balance)}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => openEdit(transaction)}
                      className="text-sm rounded-xl border border-slate-300 px-3 py-1"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(transaction)}
                      className="text-sm rounded-xl border border-red-300 text-red-700 px-3 py-1"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
                    Nenhuma transação neste mês.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <TransactionForm
          transaction={editingTransaction}
          categories={categories}
          defaultType={formDefaultType}
          defaultDate={month === currentMonth() ? undefined : `${month}-01`}
          onClose={() => setShowForm(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

export default Transactions;
