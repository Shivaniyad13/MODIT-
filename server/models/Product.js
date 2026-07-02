import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Cement',
      'Steel/TMT',
      'Sand',
      'Aggregate/Gravel',
      'Bricks/Blocks',
      'Tiles',
      'Sanitaryware',
      'Plumbing',
      'Electrical',
      'Paint',
      'Hardware/Fasteners',
      'Plywood/Veneer',
      'Glass',
      'Tools/Equipment',
      'Finishing Materials'
    ]
  },
  subCategory: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['bag', 'ton', 'sqft', 'piece', 'meter', 'liter', 'set', 'roll', 'box', 'kg']
  },
  images: [{ type: String }],
  description: {
    type: String,
    trim: true
  },
  specs: {
    type: Map,
    of: String
  },
  hsnCode: {
    type: String,
    required: [true, 'HSN code is required'],
    trim: true
  },
  // GST tax slab as percentage (5, 12, 18, 28)
  taxSlab: {
    type: Number,
    required: [true, 'Tax slab is required'],
    enum: [0, 5, 12, 18, 28]
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Index for fast category filtering
productSchema.index({ category: 1 });
productSchema.index({ name: 'text', brand: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
