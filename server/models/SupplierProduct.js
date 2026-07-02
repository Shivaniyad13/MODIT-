import mongoose from 'mongoose';

// Junction table: one product can be offered by many suppliers at different prices
const supplierProductSchema = new mongoose.Schema({
  productRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required']
  },
  supplierRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [true, 'Supplier reference is required']
  },
  pricePerUnit: {
    type: Number,
    required: [true, 'Price per unit is required'],
    min: [0, 'Price cannot be negative']
  },
  // Minimum Order Quantity
  moq: {
    type: Number,
    default: 1,
    min: 1
  },
  stockQty: {
    type: Number,
    default: 0,
    min: 0
  },
  avgDeliveryDays: {
    type: Number,
    default: 2,
    min: 1
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Compound unique: one supplier can list each product only once
supplierProductSchema.index({ productRef: 1, supplierRef: 1 }, { unique: true });
supplierProductSchema.index({ supplierRef: 1 });
supplierProductSchema.index({ productRef: 1 });

const SupplierProduct = mongoose.model('SupplierProduct', supplierProductSchema);
export default SupplierProduct;
