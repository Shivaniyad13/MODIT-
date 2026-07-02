import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    trim: true
  },
  line1: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    default: 'Delhi NCR'
  },
  pincode: {
    type: String,
    required: true,
    match: [/^\d{6}$/, 'Please provide a valid 6-digit pincode']
  },
  zone: {
    type: String,
    enum: ['Delhi', 'Gurugram', 'Noida', 'Faridabad', 'Ghaziabad'],
    required: true
  },
  lat: {
    type: Number,
    required: false
  },
  lng: {
    type: Number,
    required: false
  }
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ],
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    match: [/^\d{10}$/, 'Please add a valid 10-digit phone number']
  },
  passwordHash: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['customer', 'contractor', 'supplier', 'admin'],
    default: 'customer',
    required: true
  },
  businessName: {
    type: String,
    required: function() {
      return this.role === 'contractor' || this.role === 'supplier';
    }
  },
  gstin: {
    type: String,
    required: function() {
      return this.role === 'supplier';
    },
    match: [/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/, 'Please add a valid GSTIN']
  },
  addresses: [addressSchema],
  creditProfileRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CreditLedger'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for role based access control fast query
userSchema.index({ role: 1 });

// Hashing password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

// Compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

const User = mongoose.model('User', userSchema);
export default User;
