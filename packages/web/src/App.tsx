import { Outlet } from 'react-router-dom';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">provaProgetto</h1>
          <p className="text-sm text-gray-500">I miei viaggi e ristoranti in trasferta</p>
        </div>
      </header>
      <main className="max-w-5xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
