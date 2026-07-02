import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import {
  Search, Filter, ChevronRight, Star, Package,
  Layers, X, SlidersHorizontal, Tag
} from 'lucide-react';

// Category icons mapping
const CATEGORY_ICONS = {
  'Cement': '🏗️',
  'Steel/TMT': '⚙️',
  'Sand': '🏖️',
  'Aggregate/Gravel': '🪨',
  'Bricks/Blocks': '🧱',
  'Tiles': '🔲',
  'Sanitaryware': '🚿',
  'Plumbing': '🔧',
  'Electrical': '⚡',
  'Paint': '🎨',
  'Hardware/Fasteners': '🔩',
  'Plywood/Veneer': '🪵',
  'Glass': '🪟',
  'Tools/Equipment': '🛠️',
  'Finishing Materials': '✨'
};

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catLoading, setCatLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Fetch categories once
  useEffect(() => {
    api.get('/api/products/categories')
      .then(res => setCategories(res.data.data))
      .catch(() => {})
      .finally(() => setCatLoading(false));
  }, []);

  // Fetch products when filters change
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, limit: 16 });
      if (search) params.append('search', search);
      if (activeCategory) params.append('category', activeCategory);

      const res = await api.get(`/api/products?${params.toString()}`);
      setProducts(res.data.data.products);
      setPagination(res.data.data.pagination);
    } catch (err) {
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, activeCategory, page]);

  useEffect(() => {
    const debounce = setTimeout(fetchProducts, 300);
    return () => clearTimeout(debounce);
  }, [fetchProducts]);

  const handleCategoryClick = (cat) => {
    setActiveCategory(prev => prev === cat ? '' : cat);
    setPage(1);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setActiveCategory('');
    setPage(1);
  };

  const getTaxBadgeColor = (slab) => {
    if (slab <= 5) return 'badge-success';
    if (slab <= 12) return 'badge-info';
    if (slab <= 18) return 'badge-warning';
    return 'badge-danger';
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />

      {/* Hero Bar */}
      <div className="bg-gradient-to-r from-brand-950/60 via-dark-900/80 to-dark-950 border-b border-dark-800/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1">
            Building Material Catalog
          </h1>
          <p className="text-dark-400 text-sm mb-6">
            {pagination?.total || 0} products across Delhi NCR — compare prices from multiple local suppliers
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search cement, TMT bars, tiles, paint..."
              className="w-full bg-dark-900/80 border border-dark-700 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-sm"
            />
            {search && (
              <button
                onClick={() => { setSearch(''); setPage(1); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">

          {/* Sidebar - Categories */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="glass-card sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider">Categories</h3>
                {activeCategory && (
                  <button onClick={() => setActiveCategory('')} className="text-xs text-brand-400 hover:text-brand-300">
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => handleCategoryClick('')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-all ${
                    !activeCategory
                      ? 'bg-brand-500/15 text-brand-300 font-semibold'
                      : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                  }`}
                >
                  <span>All Materials</span>
                  <span className="text-xs text-dark-500">{pagination?.total || 0}</span>
                </button>
                {catLoading ? (
                  <div className="space-y-1">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="h-8 bg-dark-800 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  categories.map(cat => (
                    <button
                      key={cat.name}
                      onClick={() => handleCategoryClick(cat.name)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 justify-between transition-all ${
                        activeCategory === cat.name
                          ? 'bg-brand-500/15 text-brand-300 font-semibold'
                          : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{CATEGORY_ICONS[cat.name] || '📦'}</span>
                        <span className="truncate">{cat.name}</span>
                      </span>
                      <span className="text-xs text-dark-500 shrink-0">{cat.count}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Active Filters Bar */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              {/* Mobile category toggle */}
              <button
                className="lg:hidden btn-secondary text-sm py-2 px-3"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </button>

              {activeCategory && (
                <div className="badge badge-brand gap-2">
                  {CATEGORY_ICONS[activeCategory]} {activeCategory}
                  <button onClick={() => setActiveCategory('')}>
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {search && (
                <div className="badge badge-info gap-2">
                  <Search className="h-3 w-3" />
                  "{search}"
                  <button onClick={() => setSearch('')}>
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {(activeCategory || search) && (
                <button onClick={clearFilters} className="text-xs text-dark-500 hover:text-dark-300 underline">
                  Clear all
                </button>
              )}

              <div className="ml-auto text-sm text-dark-500">
                {pagination ? `${pagination.total} results` : ''}
              </div>
            </div>

            {/* Mobile Category Drawer */}
            {showFilters && (
              <div className="lg:hidden glass-card mb-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { handleCategoryClick(''); setShowFilters(false); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      !activeCategory ? 'bg-brand-500/20 text-brand-300' : 'bg-dark-800 text-dark-300'
                    }`}
                  >
                    All
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.name}
                      onClick={() => { handleCategoryClick(cat.name); setShowFilters(false); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        activeCategory === cat.name ? 'bg-brand-500/20 text-brand-300' : 'bg-dark-800 text-dark-300'
                      }`}
                    >
                      {CATEGORY_ICONS[cat.name]} {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="glass-card animate-pulse">
                    <div className="h-40 bg-dark-800 rounded-lg mb-4" />
                    <div className="h-4 bg-dark-800 rounded mb-2 w-3/4" />
                    <div className="h-3 bg-dark-800 rounded mb-4 w-1/2" />
                    <div className="h-8 bg-dark-800 rounded" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="glass-card text-center py-16">
                <p className="text-red-400 font-medium">{error}</p>
                <button onClick={fetchProducts} className="btn-primary mt-4 px-6">
                  Retry
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="glass-card text-center py-20">
                <Package className="h-12 w-12 text-dark-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-dark-300 mb-2">No products found</h3>
                <p className="text-dark-500 text-sm mb-6">
                  Try adjusting your search or category filter.
                </p>
                <button onClick={clearFilters} className="btn-primary px-6">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {products.map(product => (
                    <ProductCard key={product._id} product={product} getTaxBadgeColor={getTaxBadgeColor} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex justify-center items-center gap-3 mt-8">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="btn-secondary px-4 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-dark-400">
                      Page <span className="font-bold text-white">{page}</span> of{' '}
                      <span className="font-bold text-white">{pagination.pages}</span>
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                      disabled={page === pagination.pages}
                      className="btn-secondary px-4 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product, getTaxBadgeColor }) => (
  <Link
    to={`/products/${product._id}`}
    className="glass-card group flex flex-col"
  >
    {/* Placeholder image area */}
    <div className="h-36 rounded-lg bg-gradient-to-br from-dark-800 to-dark-900 flex items-center justify-center mb-4 group-hover:from-brand-950/40 group-hover:to-dark-900 transition-all duration-300 overflow-hidden">
      <span className="text-5xl">{CATEGORY_ICONS[product.category] || '📦'}</span>
    </div>

    <div className="flex items-start justify-between gap-2 mb-1">
      <h3 className="font-bold text-white text-sm leading-snug line-clamp-2 group-hover:text-brand-300 transition-colors">
        {product.name}
      </h3>
    </div>

    <div className="text-xs text-dark-400 mb-2 flex items-center gap-1.5">
      <Tag className="h-3 w-3" />
      {product.brand}
    </div>

    <div className="flex items-center gap-2 mb-3 flex-wrap">
      <span className="badge badge-brand text-xs">{product.category}</span>
      <span className={`badge ${getTaxBadgeColor(product.taxSlab)} text-xs`}>
        GST {product.taxSlab}%
      </span>
      <span className="text-xs text-dark-500">/ {product.unit}</span>
    </div>

    <div className="text-xs text-dark-500 mb-4 font-mono">
      HSN: {product.hsnCode}
    </div>

    <div className="mt-auto flex items-center justify-between">
      <span className="text-xs text-dark-400">Click to compare suppliers →</span>
      <ChevronRight className="h-4 w-4 text-brand-400 group-hover:translate-x-1 transition-transform" />
    </div>
  </Link>
);

export default Catalog;
