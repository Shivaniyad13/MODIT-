import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { useAuthStore } from '../store/authStore';
import {
  FileText, Plus, Clock, CheckCircle, XCircle, ChevronRight,
  Package, Calendar, MapPin, AlertTriangle, Trash2, Send
} from 'lucide-react';

const CATEGORIES = [
  'Cement', 'Steel/TMT', 'Sand', 'Aggregate/Gravel', 'Bricks/Blocks',
  'Tiles', 'Sanitaryware', 'Plumbing', 'Electrical', 'Paint',
  'Hardware/Fasteners', 'Plywood/Veneer', 'Glass', 'Tools/Equipment', 'Finishing Materials'
];

const ZONES = ['Delhi', 'Gurugram', 'Noida', 'Faridabad', 'Ghaziabad'];

const STATUS_CONFIG = {
  open: { label: 'Open', color: 'badge-brand', icon: <Clock className="h-3 w-3" /> },
  quoted: { label: 'Quoted', color: 'badge-warning', icon: <FileText className="h-3 w-3" /> },
  closed: { label: 'Closed', color: 'badge-success', icon: <CheckCircle className="h-3 w-3" /> }
};

const RFQPage = () => {
  const { user } = useAuthStore();
  const [rfqs, setRfqs] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Form state
  const [items, setItems] = useState([{ productRef: '', qty: 1, unit: 'bag' }]);
  const [targetZones, setTargetZones] = useState(['Delhi', 'Gurugram', 'Noida']);
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchRFQs();
    fetchProducts();
  }, []);

  const fetchRFQs = async () => {
    try {
      const res = await api.get('/api/rfq/my');
      setRfqs(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/api/products?limit=100');
      setProducts(res.data.data.products);
    } catch (err) {}
  };

  const addItem = () => setItems(prev => [...prev, { productRef: '', qty: 1, unit: 'bag' }]);
  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));
  const updateItem = (idx, field, value) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const toggleZone = (zone) => {
    setTargetZones(prev =>
      prev.includes(zone) ? prev.filter(z => z !== zone) : [...prev, zone]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg('');

    if (items.some(i => !i.productRef || !i.qty)) {
      setError('Please fill all item fields.');
      return;
    }
    if (targetZones.length === 0) {
      setError('Please select at least one target zone.');
      return;
    }

    // Map product units
    const enrichedItems = items.map(item => {
      const prod = products.find(p => p._id === item.productRef);
      return { productRef: item.productRef, qty: Number(item.qty), unit: prod?.unit || item.unit };
    });

    setSubmitting(true);
    try {
      await api.post('/api/rfq', {
        items: enrichedItems,
        targetZones,
        deadline: deadline || undefined,
        notes
      });
      setSuccessMsg('RFQ broadcast to matching suppliers! They will respond within your deadline.');
      setShowForm(false);
      setItems([{ productRef: '', qty: 1, unit: 'bag' }]);
      setNotes('');
      fetchRFQs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create RFQ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-dark-900/80 to-dark-950 border-b border-dark-800/50 py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                <FileText className="h-6 w-6 text-brand-400" />
                My RFQs
              </h1>
              <p className="text-dark-400 text-sm mt-1">
                Broadcast material requirements to multiple suppliers simultaneously
              </p>
            </div>
            <button
              onClick={() => { setShowForm(!showForm); setError(null); }}
              className="btn-primary px-5"
            >
              <Plus className="h-4 w-4" />
              New RFQ
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Success Banner */}
        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
            <p className="text-green-300 text-sm font-medium">{successMsg}</p>
          </div>
        )}

        {/* New RFQ Form */}
        {showForm && (
          <div className="glass-card">
            <h2 className="text-lg font-bold text-white mb-5">Create New RFQ</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2 text-red-300 text-sm">
                  <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
                </div>
              )}

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-white">Materials Required</label>
                  <button type="button" onClick={addItem} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                    <Plus className="h-3.5 w-3.5" /> Add Item
                  </button>
                </div>
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <select
                        value={item.productRef}
                        onChange={e => updateItem(idx, 'productRef', e.target.value)}
                        className="glass-input flex-1 text-sm"
                        required
                      >
                        <option value="">Select Product</option>
                        {products.map(p => (
                          <option key={p._id} value={p._id}>
                            {p.name} ({p.brand}) — {p.unit}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={e => updateItem(idx, 'qty', e.target.value)}
                        className="glass-input w-24 text-sm"
                        placeholder="Qty"
                        required
                      />
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(idx)}
                          className="p-2 text-dark-500 hover:text-red-400 transition-colors mt-0.5">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Zones */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Target Delivery Zones
                </label>
                <div className="flex flex-wrap gap-2">
                  {ZONES.map(zone => (
                    <button
                      key={zone}
                      type="button"
                      onClick={() => toggleZone(zone)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                        targetZones.includes(zone)
                          ? 'bg-brand-500/20 border-brand-500/40 text-brand-300'
                          : 'border-dark-800 text-dark-400 hover:border-dark-700 bg-dark-900'
                      }`}
                    >
                      {zone}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deadline + Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1">
                    Quote Deadline (Optional)
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setDeadline(e.target.value)}
                    className="glass-input w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1">Notes</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="glass-input w-full text-sm"
                    placeholder="Delivery schedule, site address, quality grade..."
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" disabled={submitting} className="btn-primary px-6">
                  {submitting ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Broadcasting...</>
                  ) : (
                    <><Send className="h-4 w-4" /> Broadcast RFQ</>
                  )}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary px-5">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* RFQ List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card animate-pulse h-28" />
            ))}
          </div>
        ) : rfqs.length === 0 ? (
          <div className="glass-card text-center py-16">
            <FileText className="h-12 w-12 text-dark-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-dark-300 mb-2">No RFQs yet</h3>
            <p className="text-dark-500 text-sm mb-6">
              Create your first RFQ to get quotes from multiple Delhi NCR suppliers at once.
            </p>
            <button onClick={() => setShowForm(true)} className="btn-primary px-6">
              <Plus className="h-4 w-4" /> Create RFQ
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {rfqs.map(rfq => {
              const cfg = STATUS_CONFIG[rfq.status] || STATUS_CONFIG.open;
              return (
                <div key={rfq._id} className="glass-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`badge ${cfg.color}`}>{cfg.icon}{cfg.label}</span>
                        <span className="text-xs text-dark-500">
                          {rfq.items.length} material{rfq.items.length > 1 ? 's' : ''}
                        </span>
                        <span className="text-xs text-dark-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Deadline: {new Date(rfq.deadline).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <div className="space-y-1 mb-3">
                        {rfq.items.slice(0, 3).map((item, i) => (
                          <div key={i} className="text-sm text-dark-200 flex items-center gap-2">
                            <Package className="h-3.5 w-3.5 text-brand-400 shrink-0" />
                            <span className="font-medium">{item.productRef?.name || 'Product'}</span>
                            <span className="text-dark-400">× {item.qty} {item.unit}</span>
                          </div>
                        ))}
                        {rfq.items.length > 3 && (
                          <div className="text-xs text-dark-500">+{rfq.items.length - 3} more items</div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {rfq.targetZones.map(z => (
                          <span key={z} className="text-xs bg-dark-800 text-dark-300 px-2 py-0.5 rounded flex items-center gap-1">
                            <MapPin className="h-2.5 w-2.5" />{z}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Link
                      to={`/rfq/${rfq._id}`}
                      className="btn-secondary text-xs px-3 py-2 shrink-0"
                    >
                      View Quotes
                      <ChevronRight className="h-4 w-4" />
                    </Link>
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

export default RFQPage;
