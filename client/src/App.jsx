import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import SupplierMap from './pages/SupplierMap';
import RFQPage from './pages/RFQPage';
import RFQDetail from './pages/RFQDetail';
import SupplierRFQView from './pages/SupplierRFQView';
import OrdersPage from './pages/OrdersPage';
import OrderTracking from './pages/OrderTracking';

// Guards
import ProtectedRoute from './components/ProtectedRoute';

const ALL_ROLES = ['customer', 'contractor', 'supplier', 'admin'];
const BUYER_ROLES = ['customer', 'contractor', 'admin'];

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <Router>
      <Routes>
        {/* ── Public Routes ── */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Catalog ── */}
        <Route path="/catalog" element={<ProtectedRoute allowedRoles={ALL_ROLES}><Catalog /></ProtectedRoute>} />
        <Route path="/products/:id" element={<ProtectedRoute allowedRoles={ALL_ROLES}><ProductDetail /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute allowedRoles={ALL_ROLES}><Cart /></ProtectedRoute>} />

        {/* ── Suppliers Map ── */}
        <Route path="/suppliers" element={<ProtectedRoute allowedRoles={ALL_ROLES}><SupplierMap /></ProtectedRoute>} />

        {/* ── RFQ ── */}
        <Route path="/rfq" element={<ProtectedRoute allowedRoles={BUYER_ROLES}><RFQPage /></ProtectedRoute>} />
        <Route path="/rfq/:id" element={<ProtectedRoute allowedRoles={BUYER_ROLES}><RFQDetail /></ProtectedRoute>} />
        <Route path="/rfq/open" element={<ProtectedRoute allowedRoles={['supplier']}><SupplierRFQView /></ProtectedRoute>} />

        {/* ── Orders ── */}
        <Route path="/orders" element={<ProtectedRoute allowedRoles={ALL_ROLES}><OrdersPage /></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute allowedRoles={ALL_ROLES}><OrderTracking /></ProtectedRoute>} />

        {/* ── Role Dashboards ── */}
        <Route path="/dashboard/customer" element={<ProtectedRoute allowedRoles={['customer']}><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/contractor" element={<ProtectedRoute allowedRoles={['contractor']}><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/supplier" element={<ProtectedRoute allowedRoles={['supplier']}><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={['admin']}><Dashboard /></ProtectedRoute>} />

        {/* ── Fallback ── */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
