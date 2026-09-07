import { useState } from 'react';
import { api } from '../lib/api.js';

const WEEKDAY_LABELS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

function RecurrenceForm({ recurrence, categories, onClose, onSaved }) {
  const isEditing = Boolean(recurrence);
  const [form, setForm] = useState({
    type: recurrence?.type || 'expense',
    amount: recurrence ? String(recurrence.amount) : '',
    description: recurrence?.description || '',
    categoryId: recurrence?.categoryId || '',
    frequency: recurrence?.frequency || 'monthly',
    dayOfMonth: recurrence ? String(recurrence.dayOfMonth) : '1',
    startDate: recurrence?.startDate || todayISO(),
    endDate: recurrence?.endDate || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const categoryOptions = categories.filter((category) => category.type === form.type);
  const options =
    recurrence &&
    recurrence.type === form.type &&
    !categoryOptions.some((category) => category.id === recurrence.categoryId)
      ? [...categoryOptions, { ...recurrence.category, type: recurrence.type }]
      : categoryOptions;

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleTypeSelect(type) {
    setForm((prev) => (prev.type === type ? prev : { ...prev, type, categoryId: '' }));
  }

  function handleFrequencyChange(event) {
    const frequency = event.target.value;
    setForm((prev) => ({
      ...prev,
      frequency,
      dayOfMonth: frequency === 'weekly' ? '1' : prev.dayOfMonth,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const payload = {
      type: form.type,
      amount: Number(form.amount),
      description: form.description,
      categoryId: form.categoryId,
      frequency: form.frequency,
      dayOfMonth: Number(form.dayOfMonth),
      startDate: form.startDate,
      endDate: form.endDate || null,
    };
    try {
      if (isEditing) {
        await api.put(`/recurrences/${recurrence.id}`, payload);
      } else {
        await api.post('/recurrences', payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Não foi possível salvar a recorrência.');
    } finally {
      setLoading(false);
    }
  }

  const dayMax = form.frequency === 'weekly' ? 7 : 31;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white rounded-3xl shadow-lg p-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {isEditing ? 'Editar recorrência' : 'Nova recorrência'}
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
            name="description"
            placeholder="Descrição (ex.: Salário, Internet)"
            value={form.description}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-2"
            required
          />

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

          <div className="grid grid-cols-2 gap-3">
            <select
              name="frequency"
              value={form.frequency}
              onChange={handleFrequencyChange}
              className="rounded-xl border border-slate-300 px-4 py-2"
            >
              <option value="monthly">Mensal</option>
              <option value="weekly">Semanal</option>
              <option value="yearly">Anual</option>
            </select>

            {form.frequency === 'weekly' ? (
              <select
                name="dayOfMonth"
                value={form.dayOfMonth}
                onChange={handleChange}
                className="rounded-xl border border-slate-300 px-4 py-2"
              >
                {WEEKDAY_LABELS.map((label, index) => (
                  <option key={label} value={index + 1}>
                    {label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name="dayOfMonth"
                type="number"
                min="1"
                max={dayMax}
                placeholder="Dia do mês"
                value={form.dayOfMonth}
                onChange={handleChange}
                className="rounded-xl border border-slate-300 px-4 py-2"
                required
              />
            )}
          </div>
          {form.frequency === 'yearly' && (
            <p className="text-xs text-slate-500">
              A recorrência anual repete no mês da data de início, no dia informado.
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-600" htmlFor="recurrence-start">
                Início
              </label>
              <input
                id="recurrence-start"
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-2"
                required
              />
            </div>
            <div>
              <label className="text-sm text-slate-600" htmlFor="recurrence-end">
                Término (opcional)
              </label>
              <input
                id="recurrence-end"
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-2"
              />
            </div>
          </div>

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

export default RecurrenceForm;
