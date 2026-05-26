import { Route, Routes, Link } from 'react-router-dom';

function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">FinApp</h1>
        <p className="text-slate-600 mb-6">
          MVP em construção. Backend e frontend já estão prontos para rodar.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            to="/login"
            className="rounded-2xl bg-slate-900 text-white px-4 py-3 text-center"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-2xl border border-slate-300 text-slate-900 px-4 py-3 text-center"
          >
            Registrar
          </Link>
        </div>
      </div>
    </main>
  );
}

function Login() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <p className="text-slate-600">Tela de login será implementada nas próximas fases.</p>
      </div>
    </div>
  );
}

function Register() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Registrar</h2>
        <p className="text-slate-600">Tela de cadastro será implementada nas próximas fases.</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;
