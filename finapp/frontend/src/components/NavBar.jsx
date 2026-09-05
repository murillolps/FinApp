import { Link, useNavigate } from 'react-router-dom';

function NavBar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="font-bold text-slate-900">FinApp</span>
        <Link to="/dashboard" className="text-slate-600 hover:text-slate-900">
          Dashboard
        </Link>
        <Link to="/transactions" className="text-slate-600 hover:text-slate-900">
          Lançamentos
        </Link>
        <Link to="/categories" className="text-slate-600 hover:text-slate-900">
          Categorias
        </Link>
      </div>
      <button onClick={handleLogout} className="text-sm text-slate-600 hover:text-slate-900">
        Sair
      </button>
    </nav>
  );
}

export default NavBar;
