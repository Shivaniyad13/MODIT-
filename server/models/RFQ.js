import mongoose from 'mongoose';

const rfqSchema = new mongoose.Schema({
  requesterRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requester is required']
  },
  items: [{
    productRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    qty: { type: Number, required: true, min: 1 },
    unit: { type: String, required: true }
  }],
  targetZones: [{
    type: String,
    enum: ['Delhi', 'Gurugram', 'Noida', 'Faridabad', 'Ghaziabad']
  }],
  notes: { type: String, trim: true },
  status: {
    type: String,
    enum: ['open', 'quoted', 'closed'],
    default: 'open'
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required']
  }
}, { timestamps: true });

rfqSchema.index({ requesterRef: 1 });
rfqSchema.index({ status: 1 });
rfqSchema.index({ targetZones: 1 });

const RFQ = mongoose.model('RFQ', rfqSchema);
export default RFQ;
