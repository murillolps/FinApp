import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import NavBar from '../components/NavBar.jsx';
import RecurrenceForm from '../components/RecurrenceForm.jsx';

const TYPE_LABEL = { income: 'Entrada', expense: 'Saída' };
const FREQUENCY_LABEL = { monthly: 'Mensal', weekly: 'Semanal', yearly: 'Anual' };

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

function Recurrences() {
  const [recurrences, setRecurrences] = useState([]);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('all');
  const [editingRecurrence, setEditingRecurrence] = useState(null);
  const [showForm, setShowForm] = useState(false);

  function loadRecurrences() {
    api.get('/recurrences', { params: { status } }).then(({ data }) => setRecurrences(data));
  }

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data));
  }, []);

  useEffect(() => {
    loadRecurrences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  function openCreate() {
    setEditingRecurrence(null);
    setShowForm(true);
  }

  function openEdit(recurrence) {
    setEditingRecurrence(recurrence);
    setShowForm(true);
  }

  function handleSaved() {
    setShowForm(false);
    loadRecurrences();
  }

  async function handleToggle(recurrence) {
    await api.patch(`/recurrences/${recurrence.id}/toggle`);
    loadRecurrences();
  }

  async function handleDelete(recurrence) {
    if (!window.confirm(`Excluir a recorrência "${recurrence.description}"?`)) return;
    await api.delete(`/recurrences/${recurrence.id}`);
    loadRecurrences();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Recorrências</h1>
          <button onClick={openCreate} className="rounded-2xl bg-slate-900 text-white px-4 py-2">
            + Nova recorrência
          </button>
        </div>

        <div className="mb-4">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-2"
          >
            <option value="all">Todas</option>
            <option value="active">Ativas</option>
            <option value="paused">Pausadas</option>
          </select>
        </div>

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-slate-600 text-sm">
              <tr>
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3">Frequência</th>
                <th className="px-4 py-3">Início</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {recurrences.map((recurrence) => (
                <tr key={recurrence.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{recurrence.description}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        recurrence.type === 'income'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {TYPE_LABEL[recurrence.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="mr-2">{recurrence.category.icon}</span>
                    {recurrence.category.name}
                  </td>
                  <td className="px-4 py-3 text-right">{formatCurrency(recurrence.amount)}</td>
                  <td className="px-4 py-3">
                    {FREQUENCY_LABEL[recurrence.frequency]} · dia {recurrence.dayOfMonth}
                  </td>
                  <td className="px-4 py-3">{formatDate(recurrence.startDate)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        recurrence.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {recurrence.active ? 'Ativa' : 'Pausada'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => openEdit(recurrence)}
                      className="text-sm rounded-xl border border-slate-300 px-3 py-1"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleToggle(recurrence)}
                      className="text-sm rounded-xl border border-slate-300 px-3 py-1"
                    >
                      {recurrence.active ? 'Pausar' : 'Reativar'}
                    </button>
                    <button
                      onClick={() => handleDelete(recurrence)}
                      className="text-sm rounded-xl border border-red-300 text-red-700 px-3 py-1"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {recurrences.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
                    Nenhuma recorrência encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <RecurrenceForm
          recurrence={editingRecurrence}
          categories={categories}
          onClose={() => setShowForm(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

export default Recurrences;
