import mongoose from 'mongoose';

const quotationSchema = new mongoose.Schema({
  rfqRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RFQ',
    required: [true, 'RFQ reference is required']
  },
  supplierRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [true, 'Supplier reference is required']
  },
  items: [{
    productRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quotedPrice: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
    deliveryDays: { type: Number, required: true, min: 1 }
  }],
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: 0
  },
  validUntil: { type: Date },
  notes: { type: String, trim: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  // AI-generated summary from quotation comparison assistant
  aiSummary: { type: String }
}, { timestamps: true });

quotationSchema.index({ rfqRef: 1 });
quotationSchema.index({ supplierRef: 1 });
quotationSchema.index({ status: 1 });

const Quotation = mongoose.model('Quotation', quotationSchema);
export default Quotation;
