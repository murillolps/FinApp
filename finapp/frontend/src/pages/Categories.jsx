import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import NavBar from '../components/NavBar.jsx';
import CategoryForm from '../components/CategoryForm.jsx';

const TYPE_LABEL = { income: 'Entrada', expense: 'Saída' };

function Categories() {
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState('all');
  const [editingCategory, setEditingCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);

  function loadCategories() {
    const params = filter === 'all' ? {} : { type: filter };
    api.get('/categories', { params }).then(({ data }) => setCategories(data));
  }

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  function openCreate() {
    setEditingCategory(null);
    setShowForm(true);
  }

  function openEdit(category) {
    setEditingCategory(category);
    setShowForm(true);
  }

  function handleSaved() {
    setShowForm(false);
    loadCategories();
  }

  async function handleArchive(category) {
    if (!window.confirm(`Arquivar a categoria "${category.name}"?`)) return;
    await api.patch(`/categories/${category.id}/archive`);
    loadCategories();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Categorias</h1>
          <button
            onClick={openCreate}
            className="rounded-2xl bg-slate-900 text-white px-4 py-2"
          >
            + Nova categoria
          </button>
        </div>

        <div className="mb-4">
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-2"
          >
            <option value="all">Todas</option>
            <option value="income">Entradas</option>
            <option value="expense">Saídas</option>
          </select>
        </div>

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-slate-600 text-sm">
              <tr>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Cor</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        category.type === 'income'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {TYPE_LABEL[category.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-block w-5 h-3 rounded"
                      style={{ backgroundColor: category.color }}
                    />
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => openEdit(category)}
                      className="text-sm rounded-xl border border-slate-300 px-3 py-1"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleArchive(category)}
                      className="text-sm rounded-xl border border-red-300 text-red-700 px-3 py-1"
                    >
                      Arquivar
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                    Nenhuma categoria encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <CategoryForm
          category={editingCategory}
          onClose={() => setShowForm(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

export default Categories;
