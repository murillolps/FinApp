import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/transactions', label: 'Lançamentos' },
  { to: '/categories', label: 'Categorias' },
  { to: '/recurrences', label: 'Recorrências' },
  { to: '/reports', label: 'Relatórios' },
];

function NavBar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <nav className="bg-white border-b border-slate-200 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-slate-900">FinApp</span>
          <div className="hidden md:flex items-center gap-6">
            {LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="text-slate-600 hover:text-slate-900">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="hidden md:inline text-sm text-slate-600 hover:text-slate-900"
        >
          Sair
        </button>

        <button
          onClick={() => setOpen((value) => !value)}
          className="md:hidden text-slate-600 border border-slate-300 rounded-lg px-3 py-1"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && (
        <div className="md:hidden mt-3 flex flex-col gap-3 pb-1">
          {LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="text-slate-600 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="text-left text-sm text-slate-600 hover:text-slate-900"
          >
            Sair
          </button>
        </div>
      )}
    </nav>
  );
}

export default NavBar;
