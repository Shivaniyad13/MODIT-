import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { Star, MapPin, Phone, Award, Package, Filter } from 'lucide-react';

// Fix leaflet default marker icons in Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Zone color map for circles
const ZONE_COLORS = {
  Delhi: '#5275ff',
  Gurugram: '#a855f7',
  Noida: '#22c55e',
  Faridabad: '#f97316',
  Ghaziabad: '#ec4899',
};

const DELHI_NCR_CENTER = [28.6139, 77.2090];

const SupplierMap = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selected, setSelected] = useState(null);

  const CATEGORIES = [
    'Cement', 'Steel/TMT', 'Sand', 'Aggregate/Gravel', 'Bricks/Blocks',
    'Tiles', 'Sanitaryware', 'Plumbing', 'Electrical', 'Paint',
    'Hardware/Fasteners', 'Plywood/Veneer', 'Glass', 'Tools/Equipment', 'Finishing Materials'
  ];

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedZone) params.append('zone', selectedZone);
    if (selectedCategory) params.append('category', selectedCategory);

    api.get(`/api/suppliers?${params.toString()}&limit=50`)
      .then(res => setSuppliers(res.data.data.suppliers))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedZone, selectedCategory]);

  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <Star key={i} className={`h-3 w-3 ${i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-dark-600'}`} />
    ));

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-dark-900/80 to-dark-950 border-b border-dark-800/50 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-extrabold text-white mb-1 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-brand-400" />
            Delhi NCR Supplier Map
          </h1>
          <p className="text-dark-400 text-sm mb-4">
            {suppliers.length} verified supplier{suppliers.length !== 1 ? 's' : ''} across Delhi, Gurugram, Noida, Faridabad & Ghaziabad
          </p>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <Filter className="h-4 w-4 text-dark-500 shrink-0" />

            {/* Zone filter */}
            <div className="flex gap-2 flex-wrap">
              {['', 'Delhi', 'Gurugram', 'Noida', 'Faridabad', 'Ghaziabad'].map(zone => (
                <button
                  key={zone}
                  onClick={() => { setSelectedZone(zone); setLoading(true); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    selectedZone === zone
                      ? 'bg-brand-500/20 border-brand-500/40 text-brand-300'
                      : 'border-dark-800 text-dark-400 hover:border-dark-700 hover:text-white bg-dark-900/50'
                  }`}
                >
                  {zone || 'All Zones'}
                </button>
              ))}
            </div>

            {/* Category filter */}
            <select
              value={selectedCategory}
              onChange={e => { setSelectedCategory(e.target.value); setLoading(true); }}
              className="glass-input text-xs py-1.5 px-3"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 gap-4">
        {/* Supplier List */}
        <aside className="w-72 shrink-0 hidden lg:block overflow-y-auto max-h-[calc(100vh-230px)]">
          <div className="space-y-3 pr-1">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="glass-card animate-pulse">
                  <div className="h-4 bg-dark-800 rounded mb-2 w-2/3" />
                  <div className="h-3 bg-dark-800 rounded w-1/2" />
                </div>
              ))
            ) : suppliers.length === 0 ? (
              <div className="glass-card text-center py-8">
                <p className="text-dark-400 text-sm">No suppliers found for this filter.</p>
              </div>
            ) : (
              suppliers.map(sup => (
                <button
                  key={sup._id}
                  onClick={() => setSelected(sup)}
                  className={`glass-card w-full text-left transition-all ${
                    selected?._id === sup._id ? 'border-brand-500/40 bg-brand-500/5' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-bold text-white text-sm leading-snug">{sup.businessName}</span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded font-medium shrink-0"
                      style={{ background: `${ZONE_COLORS[sup.serviceZones?.[0]]}20`, color: ZONE_COLORS[sup.serviceZones?.[0]] }}
                    >
                      {sup.serviceZones?.[0]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {renderStars(sup.rating)}
                    <span className="text-xs text-dark-400 ml-1">{sup.rating?.toFixed(1)} ({sup.totalReviews})</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {sup.categories?.slice(0, 2).map(cat => (
                      <span key={cat} className="text-xs bg-dark-800 text-dark-300 px-1.5 py-0.5 rounded">{cat}</span>
                    ))}
                    {sup.categories?.length > 2 && (
                      <span className="text-xs text-dark-500">+{sup.categories.length - 2} more</span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Map */}
        <div className="flex-1 rounded-2xl overflow-hidden border border-dark-800 relative min-h-[500px]">
          <MapContainer
            center={DELHI_NCR_CENTER}
            zoom={10}
            style={{ height: '100%', width: '100%', background: '#0f1115' }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />

            {/* Zone circles */}
            {[
              { zone: 'Delhi', center: [28.7041, 77.1025], radius: 18000 },
              { zone: 'Gurugram', center: [28.4595, 77.0266], radius: 12000 },
              { zone: 'Noida', center: [28.5355, 77.3910], radius: 11000 },
              { zone: 'Faridabad', center: [28.4089, 77.3178], radius: 9000 },
              { zone: 'Ghaziabad', center: [28.6692, 77.4538], radius: 9000 },
            ].map(({ zone, center, radius }) => (
              (!selectedZone || selectedZone === zone) && (
                <Circle
                  key={zone}
                  center={center}
                  radius={radius}
                  pathOptions={{
                    color: ZONE_COLORS[zone],
                    fillColor: ZONE_COLORS[zone],
                    fillOpacity: 0.04,
                    weight: 1.5,
                    opacity: 0.4,
                    dashArray: '6 4'
                  }}
                />
              )
            ))}

            {/* Supplier Markers */}
            {suppliers.map(sup => {
              if (!sup.location?.lat || !sup.location?.lng) return null;
              const zoneColor = ZONE_COLORS[sup.serviceZones?.[0]] || '#5275ff';

              const customIcon = L.divIcon({
                className: '',
                html: `<div style="
                  background: ${zoneColor};
                  border: 2px solid white;
                  border-radius: 50%;
                  width: 14px;
                  height: 14px;
                  box-shadow: 0 0 8px ${zoneColor}60;
                  cursor: pointer;
                "></div>`,
                iconSize: [14, 14],
                iconAnchor: [7, 7],
              });

              return (
                <Marker
                  key={sup._id}
                  position={[sup.location.lat, sup.location.lng]}
                  icon={customIcon}
                  eventHandlers={{ click: () => setSelected(sup) }}
                >
                  <Popup className="modit-popup">
                    <div className="bg-dark-900 rounded-lg p-3 min-w-[220px]">
                      <h3 className="font-bold text-white text-sm mb-1">{sup.businessName}</h3>
                      <div className="flex items-center gap-1 mb-2">
                        {renderStars(sup.rating)}
                        <span className="text-xs text-dark-400 ml-1">{sup.rating?.toFixed(1)}</span>
                      </div>
                      <div className="text-xs text-dark-300 mb-1">
                        <span className="font-medium text-dark-200">Zones:</span>{' '}
                        {sup.serviceZones?.join(', ')}
                      </div>
                      <div className="text-xs text-dark-300 mb-2">
                        <span className="font-medium text-dark-200">Specializes in:</span>{' '}
                        {sup.categories?.slice(0, 2).join(', ')}
                      </div>
                      {sup.contactPhone && (
                        <a
                          href={`tel:${sup.contactPhone}`}
                          className="flex items-center gap-1 text-xs text-brand-400"
                        >
                          <Phone className="h-3 w-3" />{sup.contactPhone}
                        </a>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-dark-950/90 backdrop-blur-md border border-dark-800 rounded-xl p-3 z-[1000]">
            <div className="text-xs font-bold text-white mb-2 uppercase tracking-wider">NCR Zones</div>
            {Object.entries(ZONE_COLORS).map(([zone, color]) => (
              <div key={zone} className="flex items-center gap-2 mb-1 last:mb-0">
                <div className="w-3 h-3 rounded-full border border-white/20" style={{ background: color }} />
                <span className="text-xs text-dark-300">{zone}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierMap;
