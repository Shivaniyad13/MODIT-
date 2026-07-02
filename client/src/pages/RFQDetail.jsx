import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import {
  FileText, Clock, CheckCircle, MapPin, Calendar, ArrowLeft,
  Briefcase, MessageSquare, AlertTriangle, ShieldCheck, ChevronRight
} from 'lucide-react';

const STATUS_CONFIG = {
  open: { label: 'Open for Bids', color: 'badge-brand' },
  quoted: { label: 'Quotes Received', color: 'badge-warning' },
  closed: { label: 'Closed / Finalized', color: 'badge-success' }
};

const RFQDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rfq, setRfq] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    fetchRFQData();
  }, [id]);

  const fetchRFQData = async () => {
    try {
      const [rfqRes, quotesRes] = await Promise.all([
        api.get(`/api/rfq/my`),
        api.get(`/api/rfq/${id}/quotes`)
      ]);

      const matchedRfq = rfqRes.data.data.find(r => r._id === id);
      if (!matchedRfq) {
        throw new Error('RFQ not found');
      }
      setRfq(matchedRfq);
      setQuotes(quotesRes.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load RFQ data');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptQuote = async (quotationId) => {
    if (!window.confirm('Are you sure you want to accept this quote? This will create a confirmed order.')) {
      return;
    }
    setAccepting(true);
    try {
      const res = await api.post(`/api/rfq/${id}/quotes/${quotationId}/accept`);
      const { data } = res.data;
      navigate(`/orders/${data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept quotation');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-4">
          <div className="h-8 bg-dark-800 rounded w-1/3" />
          <div className="h-64 bg-dark-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !rfq) {
    return (
      <div className="min-h-screen bg-dark-950">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <p className="text-red-400 font-medium text-lg">{error || 'RFQ not found'}</p>
          <Link to="/rfq" className="btn-primary mt-6 inline-flex px-6">Back to RFQs</Link>
        </div>
      </div>
    );
  }

  const stat = STATUS_CONFIG[rfq.status] || STATUS_CONFIG.open;

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Back link */}
        <Link to="/rfq" className="flex items-center gap-1.5 text-sm text-dark-400 hover:text-white transition-colors mb-5">
          <ArrowLeft className="h-4 w-4" />
          Back to RFQs
        </Link>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* RFQ Meta Details */}
          <div className="lg:col-span-1 space-y-4">
            <div className="glass-card">
              <div className="flex items-center justify-between mb-4">
                <span className={`badge ${stat.color}`}>{stat.label}</span>
                <span className="text-xs text-dark-500">ID: {rfq._id.slice(-6).toUpperCase()}</span>
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Requirement Summary</h2>
              <div className="space-y-3.5 mt-4">
                <div>
                  <span className="text-xs text-dark-400 block mb-1">Target Zones</span>
                  <div className="flex flex-wrap gap-1.5">
                    {rfq.targetZones.map(z => (
                      <span key={z} className="text-xs bg-dark-900 border border-dark-800 text-dark-300 px-2 py-0.5 rounded flex items-center gap-1">
                        <MapPin className="h-3 w-3" />{z}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs text-dark-400 block mb-1">Created On</span>
                  <div className="text-sm text-white font-medium flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-brand-400" />
                    {new Date(rfq.createdAt).toLocaleDateString('en-IN')}
                  </div>
                </div>

                <div>
                  <span className="text-xs text-dark-400 block mb-1">Response Deadline</span>
                  <div className="text-sm text-white font-medium flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-yellow-400" />
                    {new Date(rfq.deadline).toLocaleDateString('en-IN')}
                  </div>
                </div>

                {rfq.notes && (
                  <div>
                    <span className="text-xs text-dark-400 block mb-1">Special Notes</span>
                    <p className="text-xs text-dark-300 bg-dark-950 p-2.5 rounded border border-dark-800 leading-relaxed">
                      {rfq.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Material List */}
            <div className="glass-card">
              <h3 className="font-bold text-white text-sm mb-3">Items Requested</h3>
              <div className="space-y-3">
                {rfq.items.map((item, idx) => (
                  <div key={idx} className="bg-dark-900/60 p-3 rounded-lg border border-dark-800 flex justify-between items-center">
                    <div>
                      <div className="text-sm font-bold text-white">{item.productRef?.name || 'Product'}</div>
                      <div className="text-xs text-dark-400 mt-0.5">{item.productRef?.brand} · {item.productRef?.category}</div>
                    </div>
                    <div className="text-brand-300 font-extrabold text-sm shrink-0">
                      {item.qty} {item.unit || 'bag'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quotations List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-brand-400" />
              Quotes Received ({quotes.length})
            </h2>

            {quotes.length === 0 ? (
              <div className="glass-card text-center py-16">
                <Clock className="h-10 w-10 text-dark-600 mx-auto mb-3" />
                <h3 className="font-bold text-white mb-1">Waiting for Bids</h3>
                <p className="text-dark-500 text-sm">
                  Suppliers in your target zones have been notified. Quotes will appear here in real time.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {quotes.map(quote => (
                  <div key={quote._id} className="glass-card border border-dark-800 hover:border-brand-500/20 transition-colors">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4 mb-4 pb-3 border-b border-dark-850">
                      <div>
                        <div className="font-extrabold text-white text-base flex items-center gap-1.5">
                          <Briefcase className="h-4 w-4 text-brand-400" />
                          {quote.supplierRef?.businessName}
                        </div>
                        <div className="text-xs text-dark-400 mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Delivery in {quote.deliveryLeadTimeDays} days · GST invoice included
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-extrabold text-white">
                          ₹{(quote.totalAmount + quote.gstAmount).toLocaleString('en-IN')}
                        </div>
                        <span className="text-xs text-dark-500">Total (incl. GST)</span>
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-2 mb-4 bg-dark-900/50 p-3 rounded-lg border border-dark-800">
                      <div className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-1.5">Pricing Breakdown</div>
                      {quote.items.map((qItem, idx) => {
                        const originalItem = rfq.items.find(i => i.productRef?._id === qItem.productRef?._id || i.productRef === qItem.productRef?._id);
                        return (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="text-dark-300">{qItem.productRef?.name || 'Product'}</span>
                            <span className="text-white font-medium">
                              {originalItem?.qty} × ₹{qItem.pricePerUnit} = <span className="font-semibold">₹{(originalItem?.qty * qItem.pricePerUnit).toLocaleString('en-IN')}</span>
                            </span>
                          </div>
                        );
                      })}
                      <div className="border-t border-dark-800/80 pt-2 flex justify-between text-xs font-medium">
                        <span className="text-dark-400">Tax (GST)</span>
                        <span className="text-dark-300">₹{quote.gstAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex justify-between items-center gap-4">
                      {quote.supplierRef?.documentsVerified ? (
                        <div className="flex items-center gap-1 text-xs text-green-400 font-medium">
                          <ShieldCheck className="h-4 w-4" />
                          Verified Seller
                        </div>
                      ) : (
                        <div />
                      )}
                      {rfq.status !== 'closed' ? (
                        <button
                          onClick={() => handleAcceptQuote(quote._id)}
                          disabled={accepting}
                          className="btn-primary text-xs px-4 py-2"
                        >
                          Accept & Order
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <div className="text-xs text-dark-500 font-semibold italic">RFQ Finalized</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RFQDetail;
