import Product from '../models/Product.js';
import SupplierProduct from '../models/SupplierProduct.js';
import Supplier from '../models/Supplier.js';

// @desc    Get all products with filtering, search, pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      brand,
      page = 1,
      limit = 20,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const query = { isActive: true };

    if (category) query.category = category;
    if (brand) query.brand = new RegExp(brand, 'i');
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [products, total] = await Promise.all([
      Product.find(query).sort(sort).skip(skip).limit(Number(limit)),
      Product.countDocuments(query)
    ]);

    res.json({
      success: true,
      message: 'Products fetched successfully',
      data: {
        products,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
          limit: Number(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product + all supplier listings for price comparison
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get all active supplier listings for this product
    const supplierListings = await SupplierProduct.find({
      productRef: product._id,
      active: true
    })
      .populate({
        path: 'supplierRef',
        select: 'businessName rating totalReviews location serviceZones avgDeliveryDays status contactPhone'
      })
      .sort({ pricePerUnit: 1 }); // Cheapest first

    // Filter only approved suppliers
    const approvedListings = supplierListings.filter(
      sp => sp.supplierRef && sp.supplierRef.status === 'approved'
    );

    res.json({
      success: true,
      message: 'Product details fetched',
      data: {
        product,
        supplierListings: approvedListings
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all product categories
// @route   GET /api/products/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const categories = [
      'Cement', 'Steel/TMT', 'Sand', 'Aggregate/Gravel', 'Bricks/Blocks',
      'Tiles', 'Sanitaryware', 'Plumbing', 'Electrical', 'Paint',
      'Hardware/Fasteners', 'Plywood/Veneer', 'Glass', 'Tools/Equipment', 'Finishing Materials'
    ];

    // Get count per category
    const countPipeline = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const countMap = countPipeline.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: categories.map(cat => ({
        name: cat,
        count: countMap[cat] || 0
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Create new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product updated', data: product });
  } catch (error) {
    next(error);
  }
};
