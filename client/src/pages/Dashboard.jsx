import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import {
  CheckCircle, Shield, ShoppingCart, Briefcase, Award,
  Package, ArrowRight, Search, Zap, TrendingUp, Clock, MapPin
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    activeRfqs: 0,
    pendingQuotes: 0,
    ordersCount: 0,
    totalSales: 0,
    openListings: 0,
    openLeads: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        if (user.role === 'contractor' || user.role === 'customer') {
          const [rfqRes, orderRes] = await Promise.all([
            api.get('/api/rfq/my'),
            api.get('/api/orders/my')
          ]);
          const rfqs = rfqRes.data.data;
          const orders = orderRes.data.data;

          // Count active RFQs
          const activeRfqs = rfqs.filter(r => r.status === 'open' || r.status === 'quoted').length;

          // For pending quotes, count total quotes across all active RFQs
          let pendingQuotes = 0;
          await Promise.all(rfqs.map(async (r) => {
            if (r.status !== 'closed') {
              try {
                const qRes = await api.get(`/api/rfq/${r._id}/quotes`);
                pendingQuotes += qRes.data.data.length;
              } catch (e) {}
            }
          }));

          setStats({
            activeRfqs,
            pendingQuotes,
            ordersCount: orders.length
          });
        } else if (user.role === 'supplier') {
          const [orderRes, rfqRes] = await Promise.all([
            api.get('/api/orders/supplier'),
            api.get('/api/rfq/open')
          ]);
          const orders = orderRes.data.data;
          const openRfqs = rfqRes.data.data;

          // Calculate total sales
          const totalSales = orders
            .filter(o => o.status === 'delivered')
            .reduce((sum, o) => sum + o.totalAmount + o.gstAmount, 0);

          setStats({
            totalSales,
            openListings: 32, // Mock count of seeded products listing
            openLeads: openRfqs.length,
            ordersCount: orders.length
          });
        }
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return (
    <div className="min-h-screen bg-dark-950 text-dark-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-brand-950/40 via-dark-900/60 to-dark-900/20 border border-brand-500/10 rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/8 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="badge badge-brand capitalize">{user?.role}</span>
              {user?.businessName && (
                <span className="text-xs text-dark-400">{user.businessName}</span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="mt-2 text-dark-300 leading-relaxed text-sm md:text-base max-w-xl">
              Your MODIT portal for Delhi NCR building material procurement — compare prices, raise RFQs, and track deliveries in real time.
            </p>
            <div className="flex gap-3">
              <Link to="/catalog" className="btn-primary mt-5 inline-flex px-6 py-2.5">
                <Search className="h-4 w-4" />
                Browse Catalog
                <ArrowRight className="h-4 w-4" />
              </Link>
              {user?.role === 'supplier' && (
                <Link to="/rfq/open" className="btn-secondary mt-5 inline-flex px-6 py-2.5">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  View Open RFQs
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Role Dashboards */}
        {user?.role === 'customer' && <CustomerDashboardView user={user} stats={stats} />}
        {user?.role === 'contractor' && <ContractorDashboardView user={user} stats={stats} />}
        {user?.role === 'supplier' && <SupplierDashboardView user={user} stats={stats} />}
        {user?.role === 'admin' && <AdminDashboardView user={user} />}
      </main>
    </div>
  );
};

/* ── Quick Action Card ── */
const QuickAction = ({ icon, title, desc, to, color = 'brand' }) => (
  <Link to={to} className="glass-card group flex items-start gap-4">
    <div className={`h-10 w-10 rounded-xl bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="font-bold text-white text-sm group-hover:text-brand-300 transition-colors">{title}</div>
      <div className="text-xs text-dark-400 mt-0.5 leading-snug">{desc}</div>
    </div>
    <ArrowRight className="h-4 w-4 text-dark-600 group-hover:text-brand-400 group-hover:translate-x-1 transition-all shrink-0 mt-0.5" />
  </Link>
);

/* ── Stat Card ── */
const StatCard = ({ label, value, suffix, color = 'white' }) => (
  <div className="bg-dark-900 p-4 rounded-xl border border-dark-800">
    <div className="text-xs text-dark-400 font-medium mb-1">{label}</div>
    <div className={`text-2xl font-extrabold text-${color}`}>{value}</div>
    {suffix && <div className="text-xs text-dark-500 mt-0.5">{suffix}</div>}
  </div>
);

/* ── CUSTOMER ── */
const CustomerDashboardView = ({ user, stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="md:col-span-2 space-y-4">
      <div className="grid grid-cols-2 gap-4 mb-2">
        <StatCard label="Total Orders" value={stats.ordersCount} />
        <StatCard label="Active RFQs" value={stats.activeRfqs} />
      </div>
      <h2 className="text-lg font-bold text-white">Quick Actions</h2>
      <QuickAction
        icon={<Package className="h-5 w-5 text-brand-400" />}
        title="Browse Materials"
        desc="Search cement, steel, tiles & more across 6 local suppliers"
        to="/catalog"
      />
      <QuickAction
        icon={<ShoppingCart className="h-5 w-5 text-green-400" />}
        title="View Cart"
        desc="Check items saved from your last browsing session"
        to="/cart"
        color="green"
      />
    </div>
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white">Delivery Addresses</h2>
      <div className="glass-card">
        {user.addresses?.length > 0 ? (
          user.addresses.map((addr, idx) => (
            <div key={idx} className="bg-dark-950 p-3 rounded-lg border border-dark-800 text-xs mb-2 last:mb-0">
              <div className="font-bold text-white">{addr.label}</div>
              <div className="text-dark-300">{addr.line1}</div>
              <div className="text-dark-400 mt-1">{addr.pincode} · {addr.zone}</div>
            </div>
          ))
        ) : (
          <p className="text-dark-500 text-sm">No addresses yet. Add one during checkout.</p>
        )}
      </div>
    </div>
  </div>
);

/* ── CONTRACTOR ── */
const ContractorDashboardView = ({ user, stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="md:col-span-2 space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Active RFQs" value={stats.activeRfqs} />
        <StatCard label="Quotes Received" value={stats.pendingQuotes} />
        <StatCard label="Total Orders" value={stats.ordersCount} />
      </div>
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
        <div className="space-y-3">
          <QuickAction
            icon={<Search className="h-5 w-5 text-brand-400" />}
            title="Browse & Compare Materials"
            desc="Find cement, TMT bars, tiles — compare suppliers side by side"
            to="/catalog"
          />
          <QuickAction
            icon={<Zap className="h-5 w-5 text-yellow-400" />}
            title="Raise an RFQ"
            desc="Broadcast your material requirements to all matching suppliers"
            to="/rfq"
            color="yellow"
          />
          <QuickAction
            icon={<ShoppingCart className="h-5 w-5 text-green-400" />}
            title="View Cart"
            desc="Review materials added for bulk ordering"
            to="/cart"
            color="green"
          />
        </div>
      </div>
    </div>
    <div className="space-y-4">
      <div className="glass-card">
        <h3 className="font-bold text-white mb-3 text-sm">BNPL / Credit Line</h3>
        <div className="p-4 bg-brand-500/5 rounded-xl border border-brand-500/10">
          <div className="text-xs text-dark-400 mb-1">Approved Limit</div>
          <div className="text-2xl font-extrabold text-white">₹1,00,000</div>
          <div className="flex items-center gap-1 mt-2 text-xs text-green-400 font-semibold">
            <CheckCircle className="h-3.5 w-3.5" /> Active
          </div>
        </div>
      </div>
      <div className="glass-card">
        <h3 className="font-bold text-white mb-3 text-sm">Office Locations</h3>
        {user.addresses?.length > 0 ? (
          user.addresses.map((addr, idx) => (
            <div key={idx} className="bg-dark-950 p-3 rounded-lg border border-dark-800 text-xs mb-2">
              <div className="font-bold text-brand-400">{addr.label}</div>
              <div className="text-dark-300">{addr.line1}, {addr.zone}</div>
            </div>
          ))
        ) : (
          <p className="text-dark-500 text-xs">No offices added yet.</p>
        )}
      </div>
    </div>
  </div>
);

/* ── SUPPLIER ── */
const SupplierDashboardView = ({ user, stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="md:col-span-2 space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Sales (Delivered)" value={`₹${stats.totalSales.toLocaleString('en-IN')}`} />
        <StatCard label="Incoming Orders" value={stats.ordersCount} />
        <StatCard label="Open NCR RFQs" value={stats.openLeads} color="yellow-400" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Supplier Tools</h2>
        <div className="space-y-3">
          <QuickAction
            icon={<Package className="h-5 w-5 text-brand-400" />}
            title="Incoming Orders"
            desc="Fulfill building material requests and track deliveries"
            to="/orders"
          />
          <QuickAction
            icon={<Zap className="h-5 w-5 text-yellow-400" />}
            title="Open Bids / RFQs"
            desc="Respond to active contractor requirements in your NCR zones"
            to="/rfq/open"
            color="yellow"
          />
        </div>
      </div>
    </div>
    <div className="glass-card">
      <h3 className="font-bold text-white mb-3 text-sm">Verification Status</h3>
      <div className="p-4 rounded-xl border flex items-start gap-3 bg-green-500/5 border-green-500/20">
        <Award className="h-5 w-5 text-green-400 mt-0.5 shrink-0" />
        <div>
          <div className="text-sm font-bold text-green-400">Verified Partner</div>
          <div className="text-xs text-dark-400 mt-1 leading-relaxed">
            Your GSTIN and business documents are fully verified by MODIT. You are authorized to quote and sell in Delhi NCR.
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ── ADMIN ── */
const AdminDashboardView = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    <div className="md:col-span-3 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Platform GMV" value="₹0" suffix="This month" />
        <StatCard label="Pending Approvals" value="0" suffix="Suppliers" color="yellow-400" />
        <StatCard label="Total Products" value="32" suffix="Across 15 categories" color="brand-400" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Admin Actions</h2>
        <div className="space-y-3">
          <QuickAction
            icon={<Shield className="h-5 w-5 text-red-400" />}
            title="Supplier Approval Queue"
            desc="Review and approve pending supplier registrations"
            to="/admin/suppliers"
            color="red"
          />
          <QuickAction
            icon={<Package className="h-5 w-5 text-brand-400" />}
            title="Product Catalog Admin"
            desc="Add, update or deactivate products in the platform catalog"
            to="/catalog"
          />
          <QuickAction
            icon={<Clock className="h-5 w-5 text-green-400" />}
            title="Order Oversight"
            desc="Monitor all platform orders across all suppliers and buyers"
            to="/admin/orders"
            color="green"
          />
        </div>
      </div>
    </div>
    <div className="glass-card">
      <h3 className="font-bold text-white mb-4 text-sm">NCR Zones Coverage</h3>
      <ul className="space-y-2.5">
        {[
          { zone: 'Delhi', count: 3 },
          { zone: 'Gurugram', count: 2 },
          { zone: 'Noida', count: 2 },
          { zone: 'Faridabad', count: 2 },
          { zone: 'Ghaziabad', count: 2 }
        ].map(({ zone, count }) => (
          <li key={zone} className="flex items-center justify-between p-2.5 bg-dark-900 rounded-lg border border-dark-800 text-xs">
            <span className="font-semibold text-white">{zone}</span>
            <span className="badge badge-brand">{count} suppliers</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default Dashboard;
