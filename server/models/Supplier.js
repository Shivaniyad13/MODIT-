import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  userRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    unique: true
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  gstin: {
    type: String,
    required: [true, 'GSTIN is required'],
    match: [/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/, 'Invalid GSTIN format'],
    uppercase: true
  },
  categories: [{
    type: String,
    enum: [
      'Cement', 'Steel/TMT', 'Sand', 'Aggregate/Gravel', 'Bricks/Blocks',
      'Tiles', 'Sanitaryware', 'Plumbing', 'Electrical', 'Paint',
      'Hardware/Fasteners', 'Plywood/Veneer', 'Glass', 'Tools/Equipment', 'Finishing Materials'
    ]
  }],
  serviceZones: [{
    type: String,
    enum: ['Delhi', 'Gurugram', 'Noida', 'Faridabad', 'Ghaziabad']
  }],
  serviceablePincodes: [{ type: String }],
  rating: {
    type: Number,
    default: 4.5,
    min: 1,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  documentsVerified: {
    type: Boolean,
    default: false
  },
  bankDetails: {
    accountNo: { type: String },
    ifscCode: { type: String },
    bankName: { type: String }
  },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  contactPhone: { type: String },
  contactEmail: { type: String },
  address: { type: String },
  establishedYear: { type: Number },
  description: { type: String },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  }
}, { timestamps: true });

// Index for fast geo/pincode queries
supplierSchema.index({ serviceablePincodes: 1 });
supplierSchema.index({ serviceZones: 1 });
supplierSchema.index({ status: 1 });
supplierSchema.index({ categories: 1 });

const Supplier = mongoose.model('Supplier', supplierSchema);
export default Supplier;
