import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { useAuthStore } from '../store/authStore';
import { Package, Truck, Clock, CheckCircle, XCircle, MapPin, ChevronRight, RefreshCw } from 'lucide-react';

const STATUS_CONFIG = {
  placed: { label: 'Placed', color: 'badge-info', icon: <Clock className="h-3 w-3" /> },
  confirmed: { label: 'Confirmed', color: 'badge-brand', icon: <CheckCircle className="h-3 w-3" /> },
  dispatched: { label: 'Dispatched', color: 'badge-warning', icon: <Package className="h-3 w-3" /> },
  out_for_delivery: { label: 'Out for Delivery', color: 'badge-warning', icon: <Truck className="h-3 w-3" /> },
  delivered: { label: 'Delivered', color: 'badge-success', icon: <CheckCircle className="h-3 w-3" /> },
  cancelled: { label: 'Cancelled', color: 'badge-danger', icon: <XCircle className="h-3 w-3" /> }
};

const OrdersPage = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const isSupplier = user?.role === 'supplier';

  useEffect(() => {
    fetchOrders();
  }, [isSupplier]);

  const fetchOrders = () => {
    setLoading(true);
    const endpoint = isSupplier ? '/api/orders/supplier' : '/api/orders/my';
    api.get(endpoint)
      .then(res => setOrders(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const payload = { status: newStatus };
      // Seed default track details for out_for_delivery
      if (newStatus === 'out_for_delivery') {
        payload.currentLat = 28.6139;
        payload.currentLng = 77.2090;
        payload.eta = '45 mins';
      }
      await api.patch(`/api/orders/${orderId}/status`, payload);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = filter ? orders.filter(o => o.status === filter) : orders;

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />

      <div className="bg-gradient-to-r from-dark-900/80 to-dark-950 border-b border-dark-800/50 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Package className="h-6 w-6 text-brand-400" />
            {isSupplier ? 'Supplier Incoming Orders' : 'My Orders'}
          </h1>
          <p className="text-dark-400 text-sm mt-1">
            {isSupplier ? 'Manage and fulfill builder requirements' : 'Track all your building material orders'}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-5">
          {['', 'placed', 'confirmed', 'dispatched', 'out_for_delivery', 'delivered', 'cancelled'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                filter === s
                  ? 'bg-brand-500/20 border-brand-500/40 text-brand-300'
                  : 'border-dark-800 text-dark-400 hover:text-white bg-dark-900'
              }`}
            >
              {s ? s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'All Orders'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="glass-card h-24 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card text-center py-16">
            <Package className="h-12 w-12 text-dark-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-dark-300 mb-2">No orders found</h3>
            <p className="text-dark-500 text-sm mb-6">
              {isSupplier ? 'No builder has placed an order with you yet.' : 'Place your first order from the catalog.'}
            </p>
            {!isSupplier && <Link to="/catalog" className="btn-primary px-6">Browse Catalog</Link>}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(order => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.placed;
              return (
                <div key={order._id} className="glass-card">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`badge ${cfg.color}`}>{cfg.icon} {cfg.label}</span>
                        <span className="text-xs text-dark-500">
                          {new Date(order.createdAt).toLocaleDateString('en-IN')}
                        </span>
                        <span className="text-xs text-dark-450">ID: {order._id.slice(-6).toUpperCase()}</span>
                      </div>
                      <div className="text-xs text-dark-400 mb-1">
                        <span className="font-semibold text-dark-200">
                          {isSupplier ? 'Buyer:' : 'Supplier:'}
                        </span>{' '}
                        {isSupplier ? order.buyerRef?.name : order.supplierRef?.businessName}
                      </div>
                      <div className="text-xs text-dark-400 mb-1">
                        <span className="font-semibold text-dark-200">Items:</span>{' '}
                        {order.items.length} product{order.items.length > 1 ? 's' : ''}
                      </div>
                      {order.deliveryAddress && (
                        <div className="flex items-center gap-1 text-xs text-dark-500 mt-1">
                          <MapPin className="h-3 w-3" />
                          {order.deliveryAddress.line1}, {order.deliveryAddress.zone}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0 w-full sm:w-auto">
                      <div className="text-lg font-extrabold text-white">
                        ₹{(order.totalAmount + order.gstAmount).toLocaleString('en-IN')}
                      </div>

                      {/* Action buttons based on Role */}
                      {isSupplier ? (
                        <div className="flex gap-2 w-full sm:w-auto justify-end">
                          {order.status === 'placed' && (
                            <button
                              onClick={() => handleUpdateStatus(order._id, 'confirmed')}
                              disabled={updatingId === order._id}
                              className="btn-primary text-xs px-3 py-1.5"
                            >
                              Confirm
                            </button>
                          )}
                          {order.status === 'confirmed' && (
                            <button
                              onClick={() => handleUpdateStatus(order._id, 'dispatched')}
                              disabled={updatingId === order._id}
                              className="btn-warning text-xs px-3 py-1.5"
                            >
                              Dispatch
                            </button>
                          )}
                          {order.status === 'dispatched' && (
                            <button
                              onClick={() => handleUpdateStatus(order._id, 'out_for_delivery')}
                              disabled={updatingId === order._id}
                              className="btn-warning text-xs px-3 py-1.5"
                            >
                              Out for Delivery
                            </button>
                          )}
                          <Link
                            to={`/orders/${order._id}`}
                            className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
                          >
                            <Truck className="h-3.5 w-3.5 text-brand-400" /> Map
                          </Link>
                        </div>
                      ) : (
                        <Link
                          to={`/orders/${order._id}`}
                          className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
                        >
                          <Truck className="h-3.5 w-3.5 text-brand-400" /> Track
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
