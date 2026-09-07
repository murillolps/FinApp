import { useState } from 'react';
import { api } from '../lib/api.js';

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

function TransactionForm({ transaction, categories, defaultType, defaultDate, onClose, onSaved }) {
  const isEditing = Boolean(transaction);
  const [form, setForm] = useState({
    type: transaction?.type || defaultType || 'expense',
    amount: transaction ? String(transaction.amount) : '',
    occurredOn: transaction?.occurredOn || defaultDate || todayISO(),
    categoryId: transaction?.categoryId || '',
    description: transaction?.description || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const categoryOptions = categories.filter((category) => category.type === form.type);
  const options =
    transaction &&
    transaction.type === form.type &&
    !categoryOptions.some((category) => category.id === transaction.categoryId)
      ? [...categoryOptions, { ...transaction.category, type: transaction.type }]
      : categoryOptions;

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleTypeSelect(type) {
    setForm((prev) => (prev.type === type ? prev : { ...prev, type, categoryId: '' }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const payload = {
      type: form.type,
      amount: Number(form.amount),
      occurredOn: form.occurredOn,
      categoryId: form.categoryId,
      description: form.description || null,
    };
    try {
      if (isEditing) {
        await api.put(`/transactions/${transaction.id}`, payload);
      } else {
        await api.post('/transactions', payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Não foi possível salvar a transação.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white rounded-3xl shadow-lg p-8">
        <h2 className="text-xl font-bold mb-4">
          {isEditing ? 'Editar transação' : 'Nova transação'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleTypeSelect('income')}
              className={`flex-1 rounded-xl px-4 py-2 border ${
                form.type === 'income'
                  ? 'bg-green-600 text-white border-green-600'
                  : 'border-slate-300 text-slate-600'
              }`}
            >
              ↑ Entrada
            </button>
            <button
              type="button"
              onClick={() => handleTypeSelect('expense')}
              className={`flex-1 rounded-xl px-4 py-2 border ${
                form.type === 'expense'
                  ? 'bg-red-600 text-white border-red-600'
                  : 'border-slate-300 text-slate-600'
              }`}
            >
              ↓ Saída
            </button>
          </div>

          <input
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Valor"
            value={form.amount}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-2"
            required
          />

          <input
            name="occurredOn"
            type="date"
            value={form.occurredOn}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-2"
            required
          />

          <select
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-2"
            required
          >
            <option value="" disabled>
              Selecione a categoria
            </option>
            {options.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
          {options.length === 0 && (
            <p className="text-sm text-slate-500">
              Nenhuma categoria de {form.type === 'income' ? 'entrada' : 'saída'} cadastrada.
            </p>
          )}

          <input
            name="description"
            placeholder="Descrição (opcional)"
            value={form.description}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-2"
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-2xl border border-slate-300 text-slate-900 px-4 py-3"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-slate-900 text-white px-4 py-3"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransactionForm;
