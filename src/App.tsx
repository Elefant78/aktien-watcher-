import { Routes, Route, Link } from 'react-router-dom';
import WatchlistPage from './pages/WatchlistPage';
import StockDetailPage from './pages/StockDetailPage';

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <Link to="/" className="logo">
          <span>Aktien</span>
          <span className="logo-accent">Watcher</span>
        </Link>
      </header>
      <main className="main">
        <Routes>
          <Route path="/" element={<WatchlistPage />} />
          <Route path="/stock/:symbol" element={<StockDetailPage />} />
        </Routes>
      </main>
    </div>
  );
}
