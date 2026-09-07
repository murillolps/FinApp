import { useState } from 'react';
import { api } from '../lib/api.js';

function OnboardingModal({ onComplete }) {
  const [initialBalance, setInitialBalance] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.patch('/me', { initialBalance: Number(initialBalance) || 0 });
      onComplete();
    } catch {
      setError('Não foi possível salvar o saldo inicial. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white rounded-3xl shadow-lg p-8">
        <h2 className="text-xl font-bold mb-2">Bem-vindo(a)!</h2>
        <p className="text-slate-600 mb-4">
          Para começar, informe quanto você tem hoje (conta + carteira). É só o ponto de
          partida — dá pra ajustar depois.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="number"
            step="0.01"
            inputMode="decimal"
            placeholder="Saldo inicial (R$)"
            value={initialBalance}
            onChange={(event) => setInitialBalance(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-2"
            autoFocus
            required
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-slate-900 text-white px-4 py-3"
          >
            {loading ? 'Salvando...' : 'Confirmar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default OnboardingModal;
