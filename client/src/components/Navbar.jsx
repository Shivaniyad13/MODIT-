import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import {
  ShoppingCart, LogOut, User, Menu, X, Shield,
  Briefcase, Award, ShoppingBag, Search, Bell
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { getTotalItems } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const cartCount = getTotalItems();

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'admin': return <Shield className="h-4 w-4 text-red-400" />;
      case 'supplier': return <Award className="h-4 w-4 text-yellow-400" />;
      case 'contractor': return <Briefcase className="h-4 w-4 text-brand-400" />;
      default: return <ShoppingBag className="h-4 w-4 text-green-400" />;
    }
  };

  const navLinks = [
    { to: '/catalog', label: 'Catalog' },
    { to: '/suppliers', label: 'Supplier Map' },
    ...(user?.role === 'contractor' || user?.role === 'customer'
      ? [
          { to: '/rfq', label: 'RFQs' },
          { to: '/orders', label: 'Orders' },
        ]
      : []),
    ...(user?.role === 'supplier'
      ? [
          { to: '/rfq/open', label: 'Open RFQs' },
          { to: '/orders', label: 'Orders' },
          { to: '/dashboard/supplier', label: 'Dashboard' }
        ]
      : []),
    ...(user?.role === 'admin'
      ? [
          { to: '/dashboard/admin', label: 'Admin' },
          { to: '/orders', label: 'Orders' },
        ]
      : []),
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <header className="glass-panel border-b border-dark-800/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to={user ? `/dashboard/${user.role}` : '/'} className="flex items-center gap-2.5 shrink-0">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-brand-500/20">
              M
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">MODIT</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.to)
                    ? 'bg-brand-500/15 text-brand-300'
                    : 'text-dark-300 hover:text-white hover:bg-dark-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Search shortcut */}
            <Link
              to="/catalog"
              className="hidden md:flex items-center gap-2 bg-dark-900 border border-dark-800 text-dark-400 hover:text-white px-3 py-1.5 rounded-lg text-sm transition-all hover:border-dark-700"
            >
              <Search className="h-4 w-4" />
              <span>Search...</span>
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 rounded-lg bg-dark-900 border border-dark-800 hover:bg-dark-800 text-dark-300 hover:text-white transition-all"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* User badge */}
            {user && (
              <div className="hidden md:flex items-center gap-2 bg-dark-900 border border-dark-800 px-2.5 py-1.5 rounded-lg">
                {getRoleIcon()}
                <span className="text-sm font-semibold text-white max-w-[120px] truncate">{user.name}</span>
              </div>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              title="Log Out"
              className="p-2 rounded-lg bg-dark-900 border border-dark-800 hover:bg-red-500/10 hover:border-red-500/30 text-dark-300 hover:text-red-400 transition-all"
            >
              <LogOut className="h-5 w-5" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-lg bg-dark-900 border border-dark-800 text-dark-300 hover:text-white transition-all"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-dark-800 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.to)
                    ? 'bg-brand-500/15 text-brand-300'
                    : 'text-dark-300 hover:text-white hover:bg-dark-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-dark-400">
                {getRoleIcon()}
                <span>{user.name} <span className="capitalize">({user.role})</span></span>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
