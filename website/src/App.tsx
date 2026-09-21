import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';

// Placeholder pages
const MarketplacePage = () => <div className="text-2xl font-bold">Marketplace Moderation</div>;
const RecyclePage = () => <div className="text-2xl font-bold">Donate & Recycle</div>;
const HelpPage = () => <div className="text-2xl font-bold">Help Nearby</div>;
const NoticesPage = () => <div className="text-2xl font-bold">Notices Management</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="marketplace" element={<MarketplacePage />} />
          <Route path="recycle" element={<RecyclePage />} />
          <Route path="help" element={<HelpPage />} />
          <Route path="notices" element={<NoticesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
