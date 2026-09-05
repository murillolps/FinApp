import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import NavBar from '../components/NavBar.jsx';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    api
      .get('/me')
      .then(({ data }) => setUser(data))
      .catch(() => navigate('/login'));
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8 text-center mt-12">
          <h1 className="text-2xl font-bold mb-2">Olá, {user ? user.name : '...'}</h1>
          <p className="text-slate-600 mb-6">
            Dashboard completo será implementado na Fase 6.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
