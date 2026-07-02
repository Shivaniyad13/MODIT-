import Supplier from '../models/Supplier.js';
import SupplierProduct from '../models/SupplierProduct.js';
import User from '../models/User.js';

// @desc    Get all approved suppliers (with optional zone/category filter)
// @route   GET /api/suppliers
// @access  Public
export const getSuppliers = async (req, res, next) => {
  try {
    const { zone, category, page = 1, limit = 20 } = req.query;
    const query = { status: 'approved' };

    if (zone) query.serviceZones = zone;
    if (category) query.categories = category;

    const skip = (Number(page) - 1) * Number(limit);

    const [suppliers, total] = await Promise.all([
      Supplier.find(query)
        .populate('userRef', 'name email phone')
        .skip(skip)
        .limit(Number(limit))
        .sort({ rating: -1 }),
      Supplier.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        suppliers,
        pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single supplier profile + their product listings
// @route   GET /api/suppliers/:id
// @access  Public
export const getSupplierById = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id)
      .populate('userRef', 'name email phone createdAt');

    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const products = await SupplierProduct.find({
      supplierRef: supplier._id,
      active: true
    }).populate('productRef');

    res.json({
      success: true,
      data: { supplier, products }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Supplier: Submit onboarding / create profile
// @route   POST /api/suppliers/onboard
// @access  Private/Supplier
export const onboardSupplier = async (req, res, next) => {
  try {
    // Check if profile already exists
    const existing = await Supplier.findOne({ userRef: req.user._id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Supplier profile already exists. Use update instead.'
      });
    }

    const {
      businessName, gstin, categories, serviceZones, serviceablePincodes,
      bankDetails, location, contactPhone, contactEmail, address,
      establishedYear, description
    } = req.body;

    // Validate GSTIN is consistent with the user record
    if (!businessName || !gstin || !categories || !serviceZones) {
      return res.status(400).json({
        success: false,
        message: 'Business name, GSTIN, categories, and service zones are required'
      });
    }

    const supplier = await Supplier.create({
      userRef: req.user._id,
      businessName,
      gstin,
      categories,
      serviceZones,
      serviceablePincodes: serviceablePincodes || [],
      bankDetails: bankDetails || {},
      location: location || {},
      contactPhone,
      contactEmail,
      address,
      establishedYear,
      description,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Supplier onboarding submitted. Pending admin approval.',
      data: supplier
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all suppliers with any status (for approval queue)
// @route   GET /api/suppliers/admin/all
// @access  Private/Admin
export const getAllSuppliersAdmin = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};

    const [suppliers, total] = await Promise.all([
      Supplier.find(query)
        .populate('userRef', 'name email phone createdAt')
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit)),
      Supplier.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        suppliers,
        pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Approve or reject a supplier
// @route   PATCH /api/suppliers/:id/status
// @access  Private/Admin
export const updateSupplierStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['approved', 'rejected', 'suspended', 'pending'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { status, documentsVerified: status === 'approved' },
      { new: true }
    ).populate('userRef', 'name email');

    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    res.json({
      success: true,
      message: `Supplier status updated to '${status}'`,
      data: supplier
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Supplier: Update own inventory listing (add/update product prices)
// @route   POST /api/suppliers/inventory
// @access  Private/Supplier
export const upsertInventoryItem = async (req, res, next) => {
  try {
    const supplier = await Supplier.findOne({ userRef: req.user._id });
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier profile not found' });
    }

    const { productRef, pricePerUnit, moq, stockQty, avgDeliveryDays } = req.body;

    const listing = await SupplierProduct.findOneAndUpdate(
      { productRef, supplierRef: supplier._id },
      { productRef, supplierRef: supplier._id, pricePerUnit, moq, stockQty, avgDeliveryDays, active: true },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Inventory listing updated',
      data: listing
    });
  } catch (error) {
    next(error);
  }
};
