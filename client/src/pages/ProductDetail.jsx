import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { useCartStore } from '../store/cartStore';
import { mockProducts, getMockListings } from '../utils/mockData';
import {
  Star, Truck, Package, MapPin, CheckCircle, ShoppingCart,
  ArrowLeft, Clock, Award, AlertTriangle, ChevronDown, ChevronUp,
  Info, Tag, BarChart2
} from 'lucide-react';

const ZONE_COLORS = {
  Delhi: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  Gurugram: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  Noida: 'text-green-400 bg-green-500/10 border-green-500/20',
  Faridabad: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  Ghaziabad: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
};

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSpecs, setExpandedSpecs] = useState(false);
  const [addedStates, setAddedStates] = useState({});

  const { addItem } = useCartStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/products/${id}`);
        setProduct(res.data.data.product);
        setListings(res.data.data.supplierListings);
      } catch (err) {
        console.warn('Backend API failed. Falling back to product detail mock data.');
        let localProduct = mockProducts.find(p => p._id === id);
        
        // Dynamic matching fallback if id is a MongoDB ObjectId
        if (!localProduct && id && id.length === 24) {
          const index = parseInt(id.substring(id.length - 2), 16) % mockProducts.length || 0;
          localProduct = mockProducts[index];
        }

        if (localProduct) {
          setProduct(localProduct);
          setListings(getMockListings(localProduct._id));
          setError(null);
        } else {
          setError('Product not found or no longer available.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = (listing) => {
    addItem(product, listing);
    setAddedStates(prev => ({ ...prev, [listing._id]: true }));
    setTimeout(() => setAddedStates(prev => ({ ...prev, [listing._id]: false })), 2000);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-3.5 w-3.5 ${i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-dark-600'}`}
      />
    ));
  };

  const getCheapestPrice = () => {
    if (!listings.length) return null;
    return Math.min(...listings.map(l => l.pricePerUnit));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-dark-800 rounded w-1/3" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 h-64 bg-dark-800 rounded-xl" />
              <div className="lg:col-span-2 space-y-4">
                <div className="h-6 bg-dark-800 rounded w-2/3" />
                <div className="h-4 bg-dark-800 rounded w-1/2" />
                <div className="h-32 bg-dark-800 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-dark-950">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 font-medium text-lg">{error}</p>
          <Link to="/catalog" className="btn-primary mt-6 inline-flex px-6">
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const cheapest = getCheapestPrice();

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-dark-400 mb-6">
          <Link to="/catalog" className="hover:text-white flex items-center gap-1 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Catalog
          </Link>
          <span>/</span>
          <span className="text-brand-400">{product.category}</span>
          <span>/</span>
          <span className="text-dark-300 truncate max-w-xs">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Product Image Placeholder */}
          <div className="lg:col-span-1">
            <div className="glass-card aspect-square flex items-center justify-center rounded-2xl">
              <span className="text-8xl">
                {product.category === 'Cement' ? '🏗️' :
                 product.category === 'Steel/TMT' ? '⚙️' :
                 product.category === 'Tiles' ? '🔲' :
                 product.category === 'Paint' ? '🎨' :
                 product.category === 'Electrical' ? '⚡' : '📦'}
              </span>
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:col-span-2">
            <div className="glass-card h-full">
              <div className="flex flex-wrap items-start gap-3 mb-3">
                <span className="badge badge-brand">{product.category}</span>
                {product.subCategory && (
                  <span className="badge badge-info">{product.subCategory}</span>
                )}
                <span className="badge badge-warning">GST {product.taxSlab}%</span>
              </div>

              <h1 className="text-2xl font-extrabold text-white leading-tight mb-2">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 text-sm text-dark-400 mb-4">
                <span className="flex items-center gap-1.5">
                  <Tag className="h-4 w-4 text-brand-400" />
                  <span className="font-semibold text-white">{product.brand}</span>
                </span>
                <span>·</span>
                <span>Per <strong className="text-white">{product.unit}</strong></span>
                <span>·</span>
                <span>HSN: <strong className="text-white font-mono">{product.hsnCode}</strong></span>
              </div>

              {product.description && (
                <p className="text-dark-300 text-sm leading-relaxed mb-5 border-l-2 border-brand-500/30 pl-4">
                  {product.description}
                </p>
              )}

              {/* Price Summary */}
              {listings.length > 0 && (
                <div className="bg-brand-500/5 border border-brand-500/15 rounded-xl p-4 mb-5">
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-extrabold text-white">
                      ₹{cheapest?.toLocaleString('en-IN')}
                    </span>
                    <span className="text-dark-400 mb-1 text-sm">/ {product.unit} (lowest price)</span>
                  </div>
                  <p className="text-xs text-dark-500 mt-1">
                    Available from <strong className="text-brand-400">{listings.length}</strong> verified Delhi NCR supplier{listings.length > 1 ? 's' : ''}
                  </p>
                </div>
              )}

              {/* Specs */}
              {product.specs && Object.keys(product.specs).length > 0 && (
                <div>
                  <button
                    onClick={() => setExpandedSpecs(!expandedSpecs)}
                    className="flex items-center gap-2 text-sm font-semibold text-dark-300 hover:text-white transition-colors mb-2"
                  >
                    <Info className="h-4 w-4 text-brand-400" />
                    Technical Specifications
                    {expandedSpecs ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {expandedSpecs && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.entries(product.specs).map(([key, val]) => (
                        <div key={key} className="bg-dark-950 rounded-lg p-3 border border-dark-800">
                          <div className="text-xs text-dark-500 mb-0.5">{key}</div>
                          <div className="text-sm font-semibold text-white">{val}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Supplier Price Comparison Table ── */}
        <div className="glass-card">
          <div className="flex items-center gap-3 mb-6">
            <BarChart2 className="h-5 w-5 text-brand-400" />
            <h2 className="text-xl font-bold text-white">
              Supplier Price Comparison
            </h2>
            <span className="badge badge-brand ml-auto">{listings.length} suppliers</span>
          </div>

          {listings.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-10 w-10 text-dark-600 mx-auto mb-3" />
              <p className="text-dark-400 font-medium">No approved suppliers currently listing this product.</p>
              <p className="text-dark-600 text-sm mt-1">Check back soon or raise an RFQ to find suppliers.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-dark-800">
                      <th className="text-xs text-dark-500 font-semibold uppercase tracking-wider pb-3 pl-2">Supplier</th>
                      <th className="text-xs text-dark-500 font-semibold uppercase tracking-wider pb-3">Zone</th>
                      <th className="text-xs text-dark-500 font-semibold uppercase tracking-wider pb-3">Rating</th>
                      <th className="text-xs text-dark-500 font-semibold uppercase tracking-wider pb-3">Price / {product.unit}</th>
                      <th className="text-xs text-dark-500 font-semibold uppercase tracking-wider pb-3">MOQ</th>
                      <th className="text-xs text-dark-500 font-semibold uppercase tracking-wider pb-3">Delivery</th>
                      <th className="text-xs text-dark-500 font-semibold uppercase tracking-wider pb-3">Stock</th>
                      <th className="text-xs text-dark-500 font-semibold uppercase tracking-wider pb-3 pr-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-800/60">
                    {listings.map((listing, idx) => {
                      const isCheapest = listing.pricePerUnit === cheapest;
                      const supplier = listing.supplierRef;
                      return (
                        <tr
                          key={listing._id}
                          className={`transition-colors hover:bg-dark-900/40 ${isCheapest ? 'bg-brand-500/5' : ''}`}
                        >
                          <td className="py-4 pl-2">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-dark-700 to-dark-800 flex items-center justify-center text-sm font-bold text-white">
                                {supplier?.businessName?.[0] || 'S'}
                              </div>
                              <div>
                                <Link
                                  to={`/suppliers/${supplier?._id}`}
                                  className="text-sm font-semibold text-white hover:text-brand-400 transition-colors"
                                >
                                  {supplier?.businessName}
                                </Link>
                                {isCheapest && (
                                  <div className="flex items-center gap-1 text-xs text-green-400 font-semibold mt-0.5">
                                    <Award className="h-3 w-3" /> Lowest Price
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex flex-wrap gap-1">
                              {supplier?.serviceZones?.slice(0, 2).map(zone => (
                                <span
                                  key={zone}
                                  className={`text-xs px-2 py-0.5 rounded-full border font-medium ${ZONE_COLORS[zone] || 'text-dark-400 bg-dark-800 border-dark-700'}`}
                                >
                                  {zone}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-1">
                              {renderStars(supplier?.rating)}
                              <span className="text-xs text-dark-400 ml-1">{supplier?.rating?.toFixed(1)}</span>
                            </div>
                            <div className="text-xs text-dark-600 mt-0.5">{supplier?.totalReviews} reviews</div>
                          </td>
                          <td className="py-4">
                            <div className={`text-lg font-extrabold ${isCheapest ? 'text-brand-300' : 'text-white'}`}>
                              ₹{listing.pricePerUnit.toLocaleString('en-IN')}
                            </div>
                            <div className="text-xs text-dark-500">
                              +{product.taxSlab}% GST
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="text-sm font-semibold text-white">
                              {listing.moq.toLocaleString('en-IN')}
                            </div>
                            <div className="text-xs text-dark-500">{product.unit}s min</div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-1 text-sm text-white font-medium">
                              <Truck className="h-3.5 w-3.5 text-brand-400" />
                              {listing.avgDeliveryDays} day{listing.avgDeliveryDays > 1 ? 's' : ''}
                            </div>
                          </td>
                          <td className="py-4">
                            <div className={`text-sm font-semibold ${listing.stockQty > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {listing.stockQty > 0 ? `${listing.stockQty.toLocaleString('en-IN')} ${product.unit}s` : 'Out of stock'}
                            </div>
                          </td>
                          <td className="py-4 pr-2">
                            <button
                              onClick={() => handleAddToCart(listing)}
                              disabled={listing.stockQty === 0}
                              className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-all ${
                                addedStates[listing._id]
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                  : listing.stockQty === 0
                                  ? 'bg-dark-800 text-dark-500 cursor-not-allowed'
                                  : 'btn-primary'
                              }`}
                            >
                              {addedStates[listing._id] ? (
                                <><CheckCircle className="h-4 w-4" /> Added</>
                              ) : (
                                <><ShoppingCart className="h-4 w-4" /> Add to Cart</>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {listings.map(listing => {
                  const isCheapest = listing.pricePerUnit === cheapest;
                  const supplier = listing.supplierRef;
                  return (
                    <div
                      key={listing._id}
                      className={`rounded-xl border p-4 ${isCheapest ? 'border-brand-500/30 bg-brand-500/5' : 'border-dark-800 bg-dark-900/40'}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-bold text-white text-sm">{supplier?.businessName}</div>
                          <div className="flex items-center gap-1 mt-1">
                            {renderStars(supplier?.rating)}
                            <span className="text-xs text-dark-400">{supplier?.rating?.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xl font-extrabold ${isCheapest ? 'text-brand-300' : 'text-white'}`}>
                            ₹{listing.pricePerUnit.toLocaleString('en-IN')}
                          </div>
                          <div className="text-xs text-dark-500">/{product.unit}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-dark-400 mb-3">
                        <span className="flex items-center gap-1"><Truck className="h-3 w-3" />{listing.avgDeliveryDays} days</span>
                        <span>MOQ: {listing.moq} {product.unit}s</span>
                        <span className={listing.stockQty > 0 ? 'text-green-400' : 'text-red-400'}>
                          {listing.stockQty > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleAddToCart(listing)}
                        disabled={listing.stockQty === 0}
                        className={`w-full btn-primary py-2 text-sm ${listing.stockQty === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        {addedStates[listing._id] ? '✓ Added to Cart' : 'Add to Cart'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Related navigation */}
        <div className="mt-6 flex justify-between">
          <Link to="/catalog" className="btn-secondary px-5">
            <ArrowLeft className="h-4 w-4" />
            Back to Catalog
          </Link>
          <Link to="/cart" className="btn-primary px-5">
            <ShoppingCart className="h-4 w-4" />
            View Cart
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
