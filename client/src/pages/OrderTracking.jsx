import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { getSocket, trackOrder, simulateDelivery } from '../utils/socket';
import {
  Package, Truck, CheckCircle, Clock, MapPin, Phone,
  ArrowLeft, RotateCcw, Building, Receipt, Zap
} from 'lucide-react';

// Fix leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const STATUS_STEPS = [
  { key: 'placed', label: 'Order Placed', icon: Receipt },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'dispatched', label: 'Dispatched', icon: Package },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

const STATUS_ORDER = ['placed', 'confirmed', 'dispatched', 'out_for_delivery', 'delivered'];

// Delhi NCR delivery waypoints simulation
const DEMO_WAYPOINTS = [
  { currentLat: 28.6139, currentLng: 77.2090, eta: '45 mins' },
  { currentLat: 28.6200, currentLng: 77.2150, eta: '38 mins' },
  { currentLat: 28.6260, currentLng: 77.2200, eta: '30 mins' },
  { currentLat: 28.6320, currentLng: 77.2240, eta: '22 mins' },
  { currentLat: 28.6380, currentLng: 77.2280, eta: '15 mins' },
  { currentLat: 28.6440, currentLng: 77.2320, eta: '8 mins' },
  { currentLat: 28.6460, currentLng: 77.2360, eta: 'Arriving...' },
];

const truckIcon = L.divIcon({
  className: '',
  html: `<div style="
    background: #5275ff;
    border: 2px solid white;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 12px #5275ff80;
    font-size: 12px;
  ">🚚</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveStatus, setLiveStatus] = useState(null);
  const [liveLocation, setLiveLocation] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [pathHistory, setPathHistory] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/api/orders/${id}`);
        setOrder(res.data.data);
        if (res.data.data.deliveryTracking?.currentLat) {
          setLiveLocation({
            lat: res.data.data.deliveryTracking.currentLat,
            lng: res.data.data.deliveryTracking.currentLng,
            eta: res.data.data.deliveryTracking.eta
          });
        }
      } catch (err) {
        setError('Order not found or you do not have access.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Set up Socket.io
    const socket = getSocket();
    socketRef.current = socket;

    socket.on('connect', () => setSocketConnected(true));
    socket.on('disconnect', () => setSocketConnected(false));

    trackOrder(id);

    socket.on('order_status_update', (data) => {
      if (data.orderId === id || data.orderId?.toString() === id) {
        setLiveStatus(data.status);
        if (data.deliveryTracking?.currentLat) {
          const newPos = {
            lat: data.deliveryTracking.currentLat,
            lng: data.deliveryTracking.currentLng,
            eta: data.deliveryTracking.eta
          };
          setLiveLocation(newPos);
          setPathHistory(prev => [...prev, [newPos.lat, newPos.lng]]);
        }
      }
    });

    socket.on('delivery_location_update', (data) => {
      if (data.orderId === id || data.orderId?.toString() === id) {
        const newPos = {
          lat: data.currentLat,
          lng: data.currentLng,
          eta: data.eta
        };
        setLiveLocation(newPos);
        setPathHistory(prev => [...prev, [newPos.lat, newPos.lng]]);
      }
    });

    return () => {
      socket.off('order_status_update');
      socket.off('delivery_location_update');
    };
  }, [id]);

  const handleSimulate = () => {
    simulateDelivery(id, DEMO_WAYPOINTS);
    setPathHistory([[DEMO_WAYPOINTS[0].currentLat, DEMO_WAYPOINTS[0].currentLng]]);
  };

  const currentStatusIdx = STATUS_ORDER.indexOf(liveStatus || order?.status || 'placed');

  const mapCenter = liveLocation
    ? [liveLocation.lat, liveLocation.lng]
    : order?.supplierRef?.location?.lat
    ? [order.supplierRef.location.lat, order.supplierRef.location.lng]
    : [28.6139, 77.2090];

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

  if (error || !order) {
    return (
      <div className="min-h-screen bg-dark-950">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <p className="text-red-400 font-medium text-lg">{error}</p>
          <Link to="/orders" className="btn-primary mt-6 inline-flex px-6">Back to Orders</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/orders" className="text-dark-400 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-brand-400" />
                Order #{id.slice(-8).toUpperCase()}
              </h1>
              <div className="flex items-center gap-2 text-xs mt-0.5">
                <div className={`h-2 w-2 rounded-full ${socketConnected ? 'bg-green-400 animate-pulse' : 'bg-dark-600'}`} />
                <span className="text-dark-400">{socketConnected ? 'Live tracking active' : 'Connecting...'}</span>
              </div>
            </div>
          </div>
          {/* Demo simulate button — for assessment demo */}
          {order.status !== 'delivered' && (
            <button onClick={handleSimulate} className="btn-secondary text-xs px-3 py-2 gap-1.5">
              <Zap className="h-3.5 w-3.5 text-yellow-400" />
              Simulate Delivery
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Status + Details */}
          <div className="lg:col-span-1 space-y-4">
            {/* Status Timeline */}
            <div className="glass-card">
              <h3 className="font-bold text-white text-sm mb-4">Delivery Status</h3>
              <div className="space-y-3">
                {STATUS_STEPS.map((step, idx) => {
                  const isCompleted = idx <= currentStatusIdx;
                  const isCurrent = idx === currentStatusIdx;
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                          isCurrent
                            ? 'border-brand-500 bg-brand-500/20 text-brand-300'
                            : isCompleted
                            ? 'border-green-500 bg-green-500/10 text-green-400'
                            : 'border-dark-700 bg-dark-900 text-dark-600'
                        }`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        {idx < STATUS_STEPS.length - 1 && (
                          <div className={`w-0.5 h-6 mt-1 ${isCompleted && idx < currentStatusIdx ? 'bg-green-500/40' : 'bg-dark-800'}`} />
                        )}
                      </div>
                      <div className="pt-0.5">
                        <div className={`text-sm font-semibold ${isCurrent ? 'text-brand-300' : isCompleted ? 'text-white' : 'text-dark-500'}`}>
                          {step.label}
                        </div>
                        {isCurrent && liveLocation?.eta && (
                          <div className="text-xs text-brand-400 mt-0.5 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            ETA: {liveLocation.eta}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Supplier Info */}
            <div className="glass-card">
              <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                <Building className="h-4 w-4 text-brand-400" />
                Supplier
              </h3>
              <div className="text-sm text-white font-semibold">{order.supplierRef?.businessName}</div>
              {order.supplierRef?.contactPhone && (
                <a href={`tel:${order.supplierRef.contactPhone}`}
                  className="flex items-center gap-1 text-xs text-brand-400 mt-2 hover:text-brand-300">
                  <Phone className="h-3.5 w-3.5" />
                  {order.supplierRef.contactPhone}
                </a>
              )}
            </div>

            {/* Order Items */}
            <div className="glass-card">
              <h3 className="font-bold text-white text-sm mb-3">Items Ordered</h3>
              <div className="space-y-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <div>
                      <div className="text-white font-medium text-xs">{item.productRef?.name || 'Product'}</div>
                      <div className="text-dark-400 text-xs">{item.qty} × ₹{item.price?.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="text-white text-xs font-bold">
                      ₹{(item.qty * item.price)?.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
                <div className="border-t border-dark-800 pt-2 flex justify-between text-sm">
                  <span className="text-dark-300">Total (incl. GST)</span>
                  <span className="font-bold text-white">
                    ₹{(order.totalAmount + order.gstAmount)?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Map */}
          <div className="lg:col-span-2">
            <div className="glass-card h-full min-h-[480px] p-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-dark-800 flex items-center justify-between">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand-400" />
                  Live Delivery Map
                </h3>
                {liveLocation && (
                  <div className="badge badge-brand animate-pulse text-xs">
                    🔴 Live
                  </div>
                )}
              </div>
              <div style={{ height: '420px' }}>
                <MapContainer
                  center={mapCenter}
                  zoom={12}
                  style={{ height: '100%', width: '100%' }}
                  key={`${mapCenter[0]}-${mapCenter[1]}`}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                  />

                  {/* Delivery vehicle */}
                  {liveLocation && (
                    <Marker position={[liveLocation.lat, liveLocation.lng]} icon={truckIcon}>
                      <Popup>
                        <div className="text-sm font-bold">🚚 Delivery Vehicle</div>
                        <div className="text-xs text-gray-400">ETA: {liveLocation.eta}</div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Delivery path */}
                  {pathHistory.length > 1 && (
                    <Polyline
                      positions={pathHistory}
                      pathOptions={{ color: '#5275ff', weight: 3, opacity: 0.7, dashArray: '8 4' }}
                    />
                  )}
                </MapContainer>
              </div>

              {!liveLocation && (
                <div className="px-4 py-3 border-t border-dark-800 text-center">
                  <p className="text-dark-500 text-xs">
                    Live tracking activates when supplier dispatches your order.
                    Click <span className="text-brand-400">Simulate Delivery</span> to demo.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
