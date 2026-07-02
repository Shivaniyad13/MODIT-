import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  buyerRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Buyer is required']
  },
  supplierRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [true, 'Supplier is required']
  },
  items: [{
    productRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    hsnCode: { type: String },
    taxSlab: { type: Number }
  }],
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: 0
  },
  gstAmount: {
    type: Number,
    required: [true, 'GST amount is required'],
    min: 0
  },
  paymentMode: {
    type: String,
    enum: ['prepaid', 'bnpl', 'cod'],
    required: [true, 'Payment mode is required']
  },
  status: {
    type: String,
    enum: ['placed', 'confirmed', 'dispatched', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'placed'
  },
  deliveryAddress: {
    label: String,
    line1: String,
    city: String,
    pincode: String,
    zone: String,
    lat: Number,
    lng: Number
  },
  deliveryTracking: {
    currentLat: { type: Number },
    currentLng: { type: Number },
    eta: { type: String }
  },
  invoiceUrl: { type: String },
  rfqRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RFQ'
  },
  quotationRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quotation'
  },
  notes: { type: String }
}, { timestamps: true });

orderSchema.index({ status: 1 });
orderSchema.index({ buyerRef: 1 });
orderSchema.index({ supplierRef: 1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
