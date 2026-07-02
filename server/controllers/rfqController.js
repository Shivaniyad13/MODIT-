import RFQ from '../models/RFQ.js';
import Quotation from '../models/Quotation.js';
import Supplier from '../models/Supplier.js';
import Order from '../models/Order.js';

// @desc    Create a new RFQ
// @route   POST /api/rfq
// @access  Private/Contractor
export const createRFQ = async (req, res, next) => {
  try {
    const { items, targetZones, deadline, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'RFQ must have at least one item' });
    }

    const rfq = await RFQ.create({
      requesterRef: req.user._id,
      items,
      targetZones: targetZones || ['Delhi', 'Gurugram', 'Noida', 'Faridabad', 'Ghaziabad'],
      deadline: deadline || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days default
      notes,
      status: 'open'
    });

    // Notify matching suppliers via Socket.io (if io is available on app)
    const io = req.app.get('io');
    if (io) {
      // Find suppliers in the target zones
      const matchingSuppliers = await Supplier.find({
        serviceZones: { $in: targetZones || [] },
        status: 'approved'
      }).select('_id userRef');

      matchingSuppliers.forEach(supplier => {
        io.to(`supplier_${supplier._id}`).emit('new_rfq', {
          rfqId: rfq._id,
          message: 'New RFQ matching your service zones',
          itemCount: items.length,
          deadline: rfq.deadline
        });
      });
    }

    await rfq.populate('items.productRef', 'name category unit');

    res.status(201).json({
      success: true,
      message: 'RFQ created and broadcast to matching suppliers',
      data: rfq
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all RFQs for logged-in contractor
// @route   GET /api/rfq/my
// @access  Private/Contractor
export const getMyRFQs = async (req, res, next) => {
  try {
    const rfqs = await RFQ.find({ requesterRef: req.user._id })
      .populate('items.productRef', 'name category unit brand')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: rfqs });
  } catch (error) {
    next(error);
  }
};

// @desc    Get open RFQs matching supplier zones (for supplier view)
// @route   GET /api/rfq/open
// @access  Private/Supplier
export const getOpenRFQs = async (req, res, next) => {
  try {
    const supplier = await Supplier.findOne({ userRef: req.user._id });
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier profile not found' });
    }

    const rfqs = await RFQ.find({
      status: 'open',
      targetZones: { $in: supplier.serviceZones },
      deadline: { $gte: new Date() }
    })
      .populate('requesterRef', 'name businessName phone')
      .populate('items.productRef', 'name category unit brand')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: rfqs });
  } catch (error) {
    next(error);
  }
};

// @desc    Supplier submits a quotation for an RFQ
// @route   POST /api/rfq/:rfqId/quote
// @access  Private/Supplier
export const submitQuotation = async (req, res, next) => {
  try {
    const rfq = await RFQ.findById(req.params.rfqId);
    if (!rfq || rfq.status !== 'open') {
      return res.status(400).json({ success: false, message: 'RFQ not found or no longer open' });
    }

    const supplier = await Supplier.findOne({ userRef: req.user._id });
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier profile not found' });
    }

    // Check if supplier already submitted a quotation
    const existing = await Quotation.findOne({ rfqRef: rfq._id, supplierRef: supplier._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already submitted a quote for this RFQ' });
    }

    const { items, notes, validUntil } = req.body;

    // Calculate total
    const totalAmount = items.reduce((sum, item) => sum + (item.quotedPrice * item.qty), 0);

    const quotation = await Quotation.create({
      rfqRef: rfq._id,
      supplierRef: supplier._id,
      items,
      totalAmount,
      notes,
      validUntil: validUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'pending'
    });

    // Update RFQ status to 'quoted' if first quote
    await RFQ.findByIdAndUpdate(rfq._id, { status: 'quoted' });

    // Notify the buyer via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${rfq.requesterRef}`).emit('new_quotation', {
        rfqId: rfq._id,
        quotationId: quotation._id,
        supplierName: supplier.businessName,
        totalAmount,
        message: `New quote received for your RFQ`
      });
    }

    res.status(201).json({
      success: true,
      message: 'Quotation submitted successfully',
      data: quotation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all quotations for a specific RFQ (buyer view)
// @route   GET /api/rfq/:rfqId/quotes
// @access  Private/Contractor
export const getRFQQuotations = async (req, res, next) => {
  try {
    const rfq = await RFQ.findById(req.params.rfqId);
    if (!rfq || rfq.requesterRef.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this RFQ' });
    }

    const quotations = await Quotation.find({ rfqRef: rfq._id })
      .populate('supplierRef', 'businessName rating serviceZones location contactPhone documentsVerified')
      .populate('items.productRef', 'name category unit')
      .sort({ totalAmount: 1 }); // Cheapest first

    res.json({ success: true, data: quotations });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept a quotation → creates an Order
// @route   POST /api/rfq/:rfqId/quotes/:quotationId/accept
// @access  Private/Contractor
export const acceptQuotation = async (req, res, next) => {
  try {
    const quotation = await Quotation.findById(req.params.quotationId)
      .populate('rfqRef')
      .populate('supplierRef')
      .populate('items.productRef');

    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    // Verify buyer owns the RFQ
    if (quotation.rfqRef.requesterRef.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Calculate GST
    const gstAmount = quotation.items.reduce((sum, item) => {
      const taxRate = item.productRef?.taxSlab || 18;
      return sum + (item.quotedPrice * item.qty * taxRate / 100);
    }, 0);

    const { paymentMode, deliveryAddress } = req.body;

    // Create Order
    const order = await Order.create({
      buyerRef: req.user._id,
      supplierRef: quotation.supplierRef._id,
      items: quotation.items.map(i => ({
        productRef: i.productRef._id,
        qty: i.qty,
        price: i.quotedPrice,
        hsnCode: i.productRef?.hsnCode,
        taxSlab: i.productRef?.taxSlab
      })),
      totalAmount: quotation.totalAmount,
      gstAmount: Math.round(gstAmount),
      paymentMode: paymentMode || 'prepaid',
      deliveryAddress,
      rfqRef: quotation.rfqRef._id,
      quotationRef: quotation._id,
      status: 'placed'
    });

    // Update quotation and RFQ statuses
    await Quotation.findByIdAndUpdate(quotation._id, { status: 'accepted' });
    await RFQ.findByIdAndUpdate(quotation.rfqRef._id, { status: 'closed' });

    // Reject other quotations for this RFQ
    await Quotation.updateMany(
      { rfqRef: quotation.rfqRef._id, _id: { $ne: quotation._id } },
      { status: 'rejected' }
    );

    // Notify supplier via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`supplier_${quotation.supplierRef._id}`).emit('quotation_accepted', {
        orderId: order._id,
        message: 'Your quotation was accepted! New order received.'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Quotation accepted. Order placed successfully.',
      data: { order, quotation }
    });
  } catch (error) {
    next(error);
  }
};
