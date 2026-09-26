import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import OnboardingModal from '../components/OnboardingModal.jsx';
import PasswordInput from '../components/PasswordInput.jsx';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (form.password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      localStorage.setItem('token', data.token);
      setShowOnboarding(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Não foi possível criar a conta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Criar conta</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Nome"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-2"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="E-mail"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-2"
            required
          />
          <PasswordInput
            name="password"
            placeholder="Senha (mín. 6 caracteres)"
            value={form.password}
            onChange={handleChange}
            minLength={6}
            autoComplete="new-password"
          />
          <PasswordInput
            name="confirmPassword"
            placeholder="Confirmar senha"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={6}
            autoComplete="new-password"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-slate-900 text-white px-4 py-3"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>
      </div>
      {showOnboarding && (
        <OnboardingModal onComplete={() => navigate('/dashboard')} />
      )}
    </div>
  );
}

export default Register;
