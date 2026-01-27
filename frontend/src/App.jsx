import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import InboundPage from './pages/InboundPage';
import OutboundPage from './pages/OutboundPage';
import PartnerPage from './pages/PartnerPage';
import ProductPage from './pages/ProductPage';
import CategoryPage from './pages/CategoryPage';
import LocationManagementPage from './pages/LocationManagementPage';
import CreateStaffPage from './pages/CreateStaffPage';

import Sidebar from './components/Sidebar';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={
            <div className="app-container">
              <Sidebar />
              <main className="main-content">
                <ProtectedRoute>
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/inventory" element={<InventoryPage />} />
                    <Route path="/inbound" element={<InboundPage />} />
                    <Route path="/outbound" element={<OutboundPage />} />
                    <Route path="/partners" element={<PartnerPage />} />
                    <Route path="/products" element={<ProtectedRoute requiredRole="admin"><ProductPage /></ProtectedRoute>} />
                    <Route path="/categories" element={<ProtectedRoute requiredRole="admin"><CategoryPage /></ProtectedRoute>} />
                    <Route path="/locations" element={<ProtectedRoute requiredRole="admin"><LocationManagementPage /></ProtectedRoute>} />
                    <Route path="/create-staff" element={<ProtectedRoute requiredRole="admin"><CreateStaffPage /></ProtectedRoute>} />
                  </Routes>
                </ProtectedRoute>
              </main>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
