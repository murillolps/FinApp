import { useState } from 'react';
import { api } from '../lib/api.js';

const DEFAULT_COLOR = '#5a8a5a';
const DEFAULT_ICON = '📦';

function CategoryForm({ category, onClose, onSaved }) {
  const isEditing = Boolean(category);
  const [form, setForm] = useState({
    name: category?.name || '',
    type: category?.type || 'expense',
    color: category?.color || DEFAULT_COLOR,
    icon: category?.icon || DEFAULT_ICON,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/categories/${category.id}`, {
          name: form.name,
          color: form.color,
          icon: form.icon,
        });
      } else {
        await api.post('/categories', form);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Não foi possível salvar a categoria.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white rounded-3xl shadow-lg p-8">
        <h2 className="text-xl font-bold mb-4">
          {isEditing ? 'Editar categoria' : 'Nova categoria'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Nome"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-2"
            required
          />
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            disabled={isEditing}
            className="w-full rounded-xl border border-slate-300 px-4 py-2 disabled:bg-slate-100 disabled:text-slate-500"
          >
            <option value="expense">Saída</option>
            <option value="income">Entrada</option>
          </select>
          <div className="flex items-center gap-3">
            <label htmlFor="category-color" className="text-sm text-slate-600">
              Cor
            </label>
            <input
              id="category-color"
              name="color"
              type="color"
              value={form.color}
              onChange={handleChange}
              className="h-10 w-16 rounded border border-slate-300"
            />
          </div>
          <input
            name="icon"
            placeholder="Ícone (emoji)"
            value={form.icon}
            onChange={handleChange}
            maxLength={4}
            className="w-full rounded-xl border border-slate-300 px-4 py-2"
            required
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

export default CategoryForm;
