import Order from '../models/Order.js';
import Supplier from '../models/Supplier.js';
import Product from '../models/Product.js';

// @desc    Place a direct order (from cart)
// @route   POST /api/orders
// @access  Private/Customer/Contractor
export const placeOrder = async (req, res, next) => {
  try {
    const { supplierId, items, paymentMode, deliveryAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must have at least one item' });
    }

    // Calculate totals
    let totalAmount = 0;
    let gstAmount = 0;

    const enrichedItems = await Promise.all(items.map(async (item) => {
      const product = await Product.findById(item.productRef);
      const lineTotal = item.price * item.qty;
      const lineGST = lineTotal * (product?.taxSlab || 18) / 100;
      totalAmount += lineTotal;
      gstAmount += lineGST;
      return {
        productRef: item.productRef,
        qty: item.qty,
        price: item.price,
        hsnCode: product?.hsnCode,
        taxSlab: product?.taxSlab
      };
    }));

    const order = await Order.create({
      buyerRef: req.user._id,
      supplierRef: supplierId,
      items: enrichedItems,
      totalAmount: Math.round(totalAmount),
      gstAmount: Math.round(gstAmount),
      paymentMode: paymentMode || 'prepaid',
      deliveryAddress,
      status: 'placed'
    });

    // Notify supplier via socket
    const io = req.app.get('io');
    if (io) {
      io.to(`supplier_${supplierId}`).emit('new_order', {
        orderId: order._id,
        totalAmount: order.totalAmount,
        message: 'New order received!'
      });
    }

    await order.populate([
      { path: 'buyerRef', select: 'name email phone' },
      { path: 'supplierRef', select: 'businessName contactPhone' },
      { path: 'items.productRef', select: 'name category unit' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders for the logged-in buyer
// @route   GET /api/orders/my
// @access  Private/Customer/Contractor
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ buyerRef: req.user._id })
      .populate('supplierRef', 'businessName contactPhone location')
      .populate('items.productRef', 'name category unit images')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyerRef', 'name email phone addresses')
      .populate('supplierRef', 'businessName contactPhone contactEmail location address')
      .populate('items.productRef', 'name category unit hsnCode taxSlab brand images');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Only buyer, their supplier, or admin can view
    const isBuyer = order.buyerRef._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isBuyer && !isAdmin) {
      // Check if supplier
      const supplier = await Supplier.findOne({ userRef: req.user._id });
      const isSupplier = supplier && order.supplierRef._id.toString() === supplier._id.toString();
      if (!isSupplier) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
      }
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (supplier confirms, dispatches, etc.)
// @route   PATCH /api/orders/:id/status
// @access  Private/Supplier/Admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, currentLat, currentLng, eta } = req.body;

    const validStatuses = ['placed', 'confirmed', 'dispatched', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const updateData = { status };
    if (currentLat && currentLng) {
      updateData.deliveryTracking = { currentLat, currentLng, eta: eta || '' };
    }

    const updated = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('buyerRef', 'name email')
      .populate('supplierRef', 'businessName');

    // Emit real-time status update via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`order_${order._id}`).emit('order_status_update', {
        orderId: order._id,
        status,
        deliveryTracking: updateData.deliveryTracking || order.deliveryTracking,
        message: `Order status updated to: ${status}`
      });

      // Also notify the buyer's room
      io.to(`user_${order.buyerRef}`).emit('order_status_update', {
        orderId: order._id,
        status,
        message: `Your order is now: ${status.replace(/_/g, ' ')}`
      });
    }

    res.json({
      success: true,
      message: `Order status updated to '${status}'`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders for supplier's dashboard
// @route   GET /api/orders/supplier
// @access  Private/Supplier
export const getSupplierOrders = async (req, res, next) => {
  try {
    const supplier = await Supplier.findOne({ userRef: req.user._id });
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier profile not found' });
    }

    const { status } = req.query;
    const query = { supplierRef: supplier._id };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('buyerRef', 'name email phone businessName')
      .populate('items.productRef', 'name category unit')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all platform orders
// @route   GET /api/orders/admin/all
// @access  Private/Admin
export const getAllOrdersAdmin = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('buyerRef', 'name email role businessName')
        .populate('supplierRef', 'businessName')
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit)),
      Order.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
      }
    });
  } catch (error) {
    next(error);
  }
};
