import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import {
  FileText, Clock, AlertTriangle, MapPin, Calendar, Plus, Send,
  CheckCircle, ArrowRight, Package, X
} from 'lucide-react';

const SupplierRFQView = () => {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [quotePrices, setQuotePrices] = useState({}); // productId -> price
  const [leadTime, setLeadTime] = useState(2);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOpenRFQs();
  }, []);

  const fetchOpenRFQs = async () => {
    try {
      const res = await api.get('/api/rfq/open');
      setRfqs(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenQuoteModal = (rfq) => {
    setSelectedRFQ(rfq);
    setError(null);
    setSuccess('');
    // Initialize prices safely
    const prices = {};
    rfq.items.forEach(item => {
      if (item.productRef) {
        prices[item.productRef._id || item.productRef] = '';
      }
    });
    setQuotePrices(prices);
    setLeadTime(2);
  };

  const handlePriceChange = (prodId, val) => {
    setQuotePrices(prev => ({
      ...prev,
      [prodId]: val
    }));
  };

  const handleSubmitQuote = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess('');

    // Check all prices filled safely
    const missing = selectedRFQ.items.some(item => item.productRef && !quotePrices[item.productRef._id || item.productRef]);
    if (missing) {
      setError('Please provide a bid price for all items in the RFQ.');
      return;
    }

    const items = selectedRFQ.items
      .filter(item => item.productRef)
      .map(item => ({
        productRef: item.productRef._id || item.productRef,
        pricePerUnit: Number(quotePrices[item.productRef._id || item.productRef])
      }));

    setSubmitting(true);
    try {
      await api.post(`/api/rfq/${selectedRFQ._id}/quote`, {
        items,
        deliveryLeadTimeDays: Number(leadTime)
      });
      setSuccess('Your quote has been submitted to the buyer!');
      setSelectedRFQ(null);
      fetchOpenRFQs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quotation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />

      <div className="bg-gradient-to-r from-dark-900/80 to-dark-950 border-b border-dark-800/50 py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-brand-400" />
            Open Material RFQs
          </h1>
          <p className="text-dark-400 text-sm mt-1">
            Submit quotes for material requests matching your NCR delivery zones
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
            <p className="text-green-300 text-sm font-medium">{success}</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card animate-pulse h-28" />
            ))}
          </div>
        ) : rfqs.length === 0 ? (
          <div className="glass-card text-center py-16">
            <Clock className="h-12 w-12 text-dark-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-dark-300 mb-2">No active RFQs</h3>
            <p className="text-dark-500 text-sm">
              There are currently no open RFQs matching your zones or categories.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rfqs.map(rfq => (
              <div key={rfq._id} className="glass-card flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className="text-xs text-dark-500">ID: {rfq._id.slice(-6).toUpperCase()}</span>
                    <span className="text-xs text-yellow-400 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Deadline: {new Date(rfq.deadline).toLocaleDateString('en-IN')}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4 bg-dark-900/40 p-3 rounded-lg border border-dark-800">
                    <div className="text-xs text-dark-400 font-semibold mb-1 uppercase">Items Requested</div>
                    {rfq.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="text-white font-medium">{item.productRef?.name}</span>
                        <span className="text-brand-300 font-bold shrink-0">{item.qty} {item.unit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {rfq.targetZones.map(z => (
                      <span key={z} className="text-[10px] bg-dark-900 border border-dark-800 text-dark-400 px-2 py-0.5 rounded flex items-center gap-1">
                        <MapPin className="h-2.5 w-2.5" />{z}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleOpenQuoteModal(rfq)}
                  className="btn-primary w-full text-xs py-2 mt-2"
                >
                  Submit Quote
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quote Submission Modal */}
      {selectedRFQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm">
          <div className="glass-card max-w-lg w-full relative">
            <button
              onClick={() => setSelectedRFQ(null)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-dark-500 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold text-white mb-4">Submit Quotation</h2>
            <form onSubmit={handleSubmitQuote} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-300 text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

               <div className="space-y-3">
                <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider">Item Pricing (₹ per unit)</label>
                {selectedRFQ.items.filter(item => item.productRef).map((item, idx) => {
                  const key = item.productRef._id || item.productRef;
                  return (
                    <div key={idx} className="flex items-center gap-4 bg-dark-900/60 p-3 rounded-lg border border-dark-800 justify-between">
                      <div>
                        <div className="text-sm font-semibold text-white">{item.productRef?.name}</div>
                        <div className="text-xs text-dark-500">Qty required: {item.qty} {item.unit}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm text-dark-400">₹</span>
                        <input
                          type="number"
                          min="1"
                          placeholder="Bid Price"
                          value={quotePrices[key] || ''}
                          onChange={e => handlePriceChange(key, e.target.value)}
                          className="glass-input w-24 text-sm px-2 py-1 text-right"
                          required
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">Delivery Details</label>
                <div className="grid grid-cols-2 gap-4 bg-dark-900/60 p-3 rounded-lg border border-dark-800">
                  <div>
                    <label className="block text-[10px] text-dark-400 mb-1">Lead Time (Days)</label>
                    <input
                      type="number"
                      min="1"
                      value={leadTime}
                      onChange={e => setLeadTime(e.target.value)}
                      className="glass-input w-full text-xs px-2 py-1 text-center"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-dark-400 mb-1">NCR Delivery Zone</label>
                    <div className="text-xs text-white font-semibold py-1.5">
                      {selectedRFQ.targetZones.join(', ')}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-2.5 mt-2"
              >
                {submitting ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Submitting...</>
                ) : (
                  <><Send className="h-4 w-4 mr-2" /> Send Quote</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierRFQView;
