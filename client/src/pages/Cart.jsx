import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCartStore } from '../store/cartStore';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package } from 'lucide-react';

const Cart = () => {
  const { items, updateQty, removeItem, clearCart, getTotalAmount } = useCartStore();

  const subtotal = getTotalAmount();
  const avgGst = items.length
    ? items.reduce((sum, i) => sum + (i.taxSlab / 100) * i.pricePerUnit * i.qty, 0)
    : 0;
  const total = subtotal + avgGst;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-dark-950">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <ShoppingCart className="h-16 w-16 text-dark-700 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-3">Your Cart is Empty</h2>
          <p className="text-dark-400 mb-8">Browse our catalog to add building materials from Delhi NCR suppliers.</p>
          <Link to="/catalog" className="btn-primary px-8 py-3 inline-flex">
            Browse Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-white">Your Cart</h1>
          <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-300 transition-colors">
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={`${item.productId}-${item.supplierId}`} className="glass-card flex gap-4">
                <div className="h-16 w-16 rounded-lg bg-dark-800 flex items-center justify-center text-2xl shrink-0">
                  <Package className="h-7 w-7 text-dark-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-sm leading-snug truncate">{item.productName}</h3>
                  <p className="text-xs text-dark-400 mt-0.5">{item.supplierName}</p>
                  <p className="text-xs text-brand-400 mt-1 font-mono">
                    ₹{item.pricePerUnit.toLocaleString('en-IN')} / {item.unit}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-2 bg-dark-950 border border-dark-800 rounded-lg p-1">
                      <button
                        onClick={() => updateQty(item.productId, item.supplierId, item.qty - 1)}
                        className="p-1 text-dark-400 hover:text-white transition-colors rounded"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-sm font-bold text-white w-10 text-center">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.productId, item.supplierId, item.qty + 1)}
                        className="p-1 text-dark-400 hover:text-white transition-colors rounded"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="text-xs text-dark-500">{item.unit}s</span>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.productId, item.supplierId)}
                    className="text-dark-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="text-right">
                    <div className="text-base font-extrabold text-white">
                      ₹{(item.pricePerUnit * item.qty).toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs text-dark-500">
                      +₹{Math.round((item.taxSlab / 100) * item.pricePerUnit * item.qty).toLocaleString('en-IN')} GST
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="glass-card h-fit sticky top-24">
            <h3 className="font-bold text-white mb-5 text-lg">Order Summary</h3>
            <div className="space-y-3 text-sm mb-5">
              <div className="flex justify-between text-dark-300">
                <span>Subtotal ({items.length} items)</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-dark-300">
                <span>GST (avg)</span>
                <span>₹{Math.round(avgGst).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-dark-300">
                <span>Delivery charges</span>
                <span className="text-green-400">TBD at checkout</span>
              </div>
              <div className="border-t border-dark-800 pt-3 flex justify-between font-bold text-white text-base">
                <span>Total (incl. GST)</span>
                <span>₹{Math.round(total).toLocaleString('en-IN')}</span>
              </div>
            </div>
            <Link to="/checkout" className="btn-primary w-full py-3">
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/catalog" className="btn-secondary w-full py-2.5 mt-3 text-sm">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
