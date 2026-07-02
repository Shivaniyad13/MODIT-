import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],

  addItem: (product, supplierListing) => {
    const { items } = get();
    const existing = items.find(
      i => i.productId === product._id && i.supplierId === supplierListing.supplierRef._id
    );
    if (existing) {
      set({
        items: items.map(i =>
          i.productId === product._id && i.supplierId === supplierListing.supplierRef._id
            ? { ...i, qty: i.qty + 1 }
            : i
        )
      });
    } else {
      set({
        items: [...items, {
          productId: product._id,
          supplierId: supplierListing.supplierRef._id,
          productName: product.name,
          category: product.category,
          brand: product.brand,
          unit: product.unit,
          supplierName: supplierListing.supplierRef.businessName,
          pricePerUnit: supplierListing.pricePerUnit,
          hsnCode: product.hsnCode,
          taxSlab: product.taxSlab,
          qty: supplierListing.moq || 1,
          moq: supplierListing.moq || 1,
        }]
      });
    }
  },

  updateQty: (productId, supplierId, qty) => {
    set({
      items: get().items.map(i =>
        i.productId === productId && i.supplierId === supplierId
          ? { ...i, qty: Math.max(i.moq, qty) }
          : i
      )
    });
  },

  removeItem: (productId, supplierId) => {
    set({ items: get().items.filter(i => !(i.productId === productId && i.supplierId === supplierId)) });
  },

  clearCart: () => set({ items: [] }),

  getTotalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),

  getTotalAmount: () => get().items.reduce((sum, i) => sum + i.pricePerUnit * i.qty, 0),
}));
