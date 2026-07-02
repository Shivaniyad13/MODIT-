import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Supplier from '../models/Supplier.js';
import Product from '../models/Product.js';
import SupplierProduct from '../models/SupplierProduct.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/modit';

// ─── SEED DATA ────────────────────────────────────────────────────────────────

const seedUsers = [
  {
    name: 'Amit Verma',
    email: 'admin@modit.com',
    phone: '9810000001',
    passwordHash: 'password123',
    role: 'admin'
  },
  {
    name: 'Priya Sharma',
    email: 'customer@modit.com',
    phone: '9810000002',
    passwordHash: 'password123',
    role: 'customer',
    addresses: [{
      label: 'Home',
      line1: 'B-204, Vasant Kunj',
      city: 'Delhi NCR',
      pincode: '110070',
      zone: 'Delhi',
      lat: 28.5355,
      lng: 77.1580
    }]
  },
  {
    name: 'Suresh Kumar',
    email: 'builder@modit.com',
    phone: '9810000003',
    passwordHash: 'password123',
    role: 'contractor',
    businessName: 'Kumar Construction Pvt Ltd',
    addresses: [{
      label: 'Office',
      line1: '45, DLF Phase 2',
      city: 'Delhi NCR',
      pincode: '122002',
      zone: 'Gurugram',
      lat: 28.4949,
      lng: 77.0884
    }]
  },
  {
    name: 'Rohit Agarwal',
    email: 'supplier@modit.com',
    phone: '9810000004',
    passwordHash: 'password123',
    role: 'supplier',
    businessName: 'Agarwal Building Materials',
    gstin: '07AABCA1234A1Z1'
  },
  // ── 6 Supplier Users ──
  {
    name: 'Rakesh Gupta',
    email: 'rakesh@delhicement.com',
    phone: '9811000011',
    passwordHash: 'password123',
    role: 'supplier',
    businessName: 'Delhi Cement & Aggregates',
    gstin: '07AABCG1111B1Z2'
  },
  {
    name: 'Mohan Lal',
    email: 'mohan@gurugramsteel.com',
    phone: '9812000022',
    passwordHash: 'password123',
    role: 'supplier',
    businessName: 'Gurugram Steel Traders',
    gstin: '06AABCM2222C1Z3'
  },
  {
    name: 'Anil Saxena',
    email: 'anil@noidatiles.com',
    phone: '9813000033',
    passwordHash: 'password123',
    role: 'supplier',
    businessName: 'Noida Tiles & Sanitaryware',
    gstin: '09AABCA3333D1Z4'
  },
  {
    name: 'Vijay Sharma',
    email: 'vijay@faridabadpaint.com',
    phone: '9814000044',
    passwordHash: 'password123',
    role: 'supplier',
    businessName: 'Faridabad Paint & Hardware',
    gstin: '06AABCV4444E1Z5'
  },
  {
    name: 'Deepak Yadav',
    email: 'deepak@ghaziabadelec.com',
    phone: '9815000055',
    passwordHash: 'password123',
    role: 'supplier',
    businessName: 'Ghaziabad Electrical Supplies',
    gstin: '09AABCD5555F1Z6'
  },
  {
    name: 'Sanjay Bhatia',
    email: 'sanjay@delhibricks.com',
    phone: '9816000066',
    passwordHash: 'password123',
    role: 'supplier',
    businessName: 'Delhi Bricks & Plywood House',
    gstin: '07AABCS6666G1Z7'
  }
];

const seedProducts = [
  // ── CEMENT (3) ──
  { name: 'UltraTech OPC 53 Grade Cement', category: 'Cement', subCategory: 'OPC', brand: 'UltraTech', unit: 'bag', description: 'High strength OPC 53 grade cement for RCC structures. 50 kg bag.', specs: new Map([['Grade', 'OPC 53'], ['Weight', '50 kg'], ['Setting Time', '30 min initial']]), hsnCode: '2523', taxSlab: 28 },
  { name: 'ACC Gold PPC Cement', category: 'Cement', subCategory: 'PPC', brand: 'ACC', unit: 'bag', description: 'Portland Pozzolana Cement for general construction. 50 kg bag.', specs: new Map([['Grade', 'PPC'], ['Weight', '50 kg'], ['Fly Ash', '25%']]), hsnCode: '2523', taxSlab: 28 },
  { name: 'Ambuja Plus Cement', category: 'Cement', subCategory: 'OPC', brand: 'Ambuja', unit: 'bag', description: 'Premium OPC cement with superior strength and durability.', specs: new Map([['Grade', 'OPC 43'], ['Weight', '50 kg']]), hsnCode: '2523', taxSlab: 28 },

  // ── STEEL/TMT (3) ──
  { name: 'SAIL TMT Fe500D 8mm Rebar', category: 'Steel/TMT', subCategory: 'TMT Bars', brand: 'SAIL', unit: 'ton', description: 'Fe500D grade earthquake resistant TMT bars for RCC. 8mm diameter.', specs: new Map([['Grade', 'Fe500D'], ['Diameter', '8mm'], ['Length', '12m']]), hsnCode: '7214', taxSlab: 18 },
  { name: 'Tata Tiscon TMT Fe550 12mm', category: 'Steel/TMT', subCategory: 'TMT Bars', brand: 'Tata Tiscon', unit: 'ton', description: 'High strength Fe550 grade TMT bars. 12mm diameter, corrosion resistant.', specs: new Map([['Grade', 'Fe550'], ['Diameter', '12mm'], ['Length', '12m']]), hsnCode: '7214', taxSlab: 18 },
  { name: 'JSW Neosteel 550D 16mm', category: 'Steel/TMT', subCategory: 'TMT Bars', brand: 'JSW Neosteel', unit: 'ton', description: 'Premium Fe550D Neosteel for high-rise construction. 16mm.', specs: new Map([['Grade', 'Fe550D'], ['Diameter', '16mm']]), hsnCode: '7214', taxSlab: 18 },

  // ── SAND (2) ──
  { name: 'River Sand (Fine Grade)', category: 'Sand', subCategory: 'River Sand', brand: 'Local', unit: 'ton', description: 'Natural river sand for plaster and masonry. Sieve size Zone 2.', specs: new Map([['Zone', 'Zone 2'], ['Sieve', '4.75mm']]), hsnCode: '2505', taxSlab: 5 },
  { name: 'M-Sand (Manufactured Sand)', category: 'Sand', subCategory: 'M-Sand', brand: 'Local', unit: 'ton', description: 'Machine-crushed granite sand for concrete. Consistent grading.', specs: new Map([['Source', 'Granite'], ['Grade', 'Concrete Grade']]), hsnCode: '2505', taxSlab: 5 },

  // ── AGGREGATE/GRAVEL (2) ──
  { name: '20mm Crushed Stone Aggregate', category: 'Aggregate/Gravel', subCategory: 'Coarse Aggregate', brand: 'Local', unit: 'ton', description: 'Crushed stone aggregate for concrete mix. 20mm grading.', specs: new Map([['Size', '20mm'], ['Type', 'Crushed Stone']]), hsnCode: '2517', taxSlab: 5 },
  { name: '10mm Fine Aggregate / Grit', category: 'Aggregate/Gravel', subCategory: 'Fine Aggregate', brand: 'Local', unit: 'ton', description: 'Fine grit for concrete, floor screed, and pavement.', specs: new Map([['Size', '10mm']]), hsnCode: '2517', taxSlab: 5 },

  // ── BRICKS/BLOCKS (2) ──
  { name: 'Red Clay Bricks (Standard)', category: 'Bricks/Blocks', subCategory: 'Clay Bricks', brand: 'Local', unit: 'piece', description: 'Traditional red clay bricks for masonry walls. Standard size 230x110x75mm.', specs: new Map([['Size', '230x110x75mm'], ['Class', 'Class A']]), hsnCode: '6901', taxSlab: 5 },
  { name: 'AAC Blocks (Autoclaved Aerated)', category: 'Bricks/Blocks', subCategory: 'AAC Blocks', brand: 'Siporex', unit: 'piece', description: 'Lightweight AAC blocks for energy efficient construction. 600x200x200mm.', specs: new Map([['Size', '600x200x200mm'], ['Density', '550 kg/m3']]), hsnCode: '6901', taxSlab: 12 },

  // ── TILES (3) ──
  { name: 'Kajaria Soluble Salt Vitrified Tile 600x600', category: 'Tiles', subCategory: 'Vitrified', brand: 'Kajaria', unit: 'sqft', description: 'Double charge vitrified tiles for flooring. 600x600mm, 9mm thick.', specs: new Map([['Size', '600x600mm'], ['Thickness', '9mm'], ['Finish', 'Glossy']]), hsnCode: '6907', taxSlab: 18 },
  { name: 'Somany Duragres Floor Tile 400x400', category: 'Tiles', subCategory: 'Ceramic Floor', brand: 'Somany', unit: 'sqft', description: 'Anti-skid ceramic floor tiles for bathrooms and kitchens.', specs: new Map([['Size', '400x400mm'], ['Finish', 'Matt'], ['PEI', 'Grade IV']]), hsnCode: '6907', taxSlab: 18 },
  { name: 'Asian Granito Wall Tile 300x450', category: 'Tiles', subCategory: 'Wall Tiles', brand: 'Asian Granito', unit: 'sqft', description: 'Digital print ceramic wall tiles for bathrooms. 300x450mm.', specs: new Map([['Size', '300x450mm'], ['Type', 'Wall Tile']]), hsnCode: '6907', taxSlab: 18 },

  // ── SANITARYWARE (2) ──
  { name: 'Hindware Aster Wall Hung WC', category: 'Sanitaryware', subCategory: 'WC', brand: 'Hindware', unit: 'piece', description: 'Modern wall hung water closet with dual flush system.', specs: new Map([['Type', 'Wall Hung'], ['Flush', 'Dual 3/6L'], ['Color', 'Ivory White']]), hsnCode: '6910', taxSlab: 18 },
  { name: 'Jaquar Lyric Basin', category: 'Sanitaryware', subCategory: 'Wash Basin', brand: 'Jaquar', unit: 'piece', description: 'Elegant under-counter wash basin, vitreous china, white.', specs: new Map([['Size', '500x400mm'], ['Material', 'Vitreous China']]), hsnCode: '6910', taxSlab: 18 },

  // ── PLUMBING (2) ──
  { name: 'CPVC Pipes & Fittings (1 inch, 10ft)', category: 'Plumbing', subCategory: 'CPVC Pipes', brand: 'Astral', unit: 'piece', description: 'Hot & cold water CPVC pipes. 1 inch diameter, 10 ft length.', specs: new Map([['Diameter', '1 inch'], ['Length', '10 ft'], ['Pressure', 'SDR 11']]), hsnCode: '3917', taxSlab: 18 },
  { name: 'uPVC Pressure Pipes (2 inch, ISI Mark)', category: 'Plumbing', subCategory: 'uPVC Pipes', brand: 'Supreme', unit: 'meter', description: 'ISI marked uPVC pressure pipes for underground supply lines. 2 inch.', specs: new Map([['Diameter', '2 inch'], ['Standard', 'IS:4985'], ['Color', 'Grey']]), hsnCode: '3917', taxSlab: 18 },

  // ── ELECTRICAL (2) ──
  { name: 'Havells FRLS Wires 1.5 sqmm (90m)', category: 'Electrical', subCategory: 'Wires & Cables', brand: 'Havells', unit: 'roll', description: 'Fire retardant low smoke 1.5 sqmm copper wires, red/black/green/yellow available.', specs: new Map([['Rating', '1.5 sqmm'], ['Length', '90m'], ['Type', 'FRLS']]), hsnCode: '8544', taxSlab: 18 },
  { name: 'Legrand MCB 32A Single Pole', category: 'Electrical', subCategory: 'MCB & DB', brand: 'Legrand', unit: 'piece', description: 'DX3 miniature circuit breaker, 32A SP for branch circuit protection.', specs: new Map([['Rating', '32A'], ['Poles', 'Single'], ['Breaking Capacity', '6kA']]), hsnCode: '8535', taxSlab: 18 },

  // ── PAINT (2) ──
  { name: 'Asian Paints Royale Luxury Emulsion (20L)', category: 'Paint', subCategory: 'Interior Emulsion', brand: 'Asian Paints', unit: 'liter', description: 'Premium interior luxury emulsion for walls & ceilings. 20 liter bucket.', specs: new Map([['Coverage', '140-160 sqft/L'], ['Finish', 'Sheen'], ['VOC', 'Low']]), hsnCode: '3209', taxSlab: 18 },
  { name: 'Berger WeatherCoat Exterior Emulsion (10L)', category: 'Paint', subCategory: 'Exterior Paint', brand: 'Berger', unit: 'liter', description: 'Waterproof exterior emulsion with UV protection. 10 liter bucket.', specs: new Map([['Coverage', '120-140 sqft/L'], ['Weather', 'UV Protected']]), hsnCode: '3209', taxSlab: 18 },

  // ── HARDWARE/FASTENERS (2) ──
  { name: 'Stainless Steel Anchor Bolts (M12, Box of 50)', category: 'Hardware/Fasteners', subCategory: 'Fasteners', brand: 'Jindal', unit: 'box', description: 'SS 304 grade expansion anchor bolts for heavy fixings. M12x100mm, box of 50.', specs: new Map([['Size', 'M12x100mm'], ['Grade', 'SS 304'], ['Qty', '50/box']]), hsnCode: '7318', taxSlab: 18 },
  { name: 'GI Binding Wire 18 Gauge (5kg)', category: 'Hardware/Fasteners', subCategory: 'Binding Wire', brand: 'Local', unit: 'kg', description: 'Galvanized iron binding wire for tying rebar. 18 gauge, 5kg coil.', specs: new Map([['Gauge', '18'], ['Weight', '5kg'], ['Coating', 'Galvanized']]), hsnCode: '7217', taxSlab: 18 },

  // ── PLYWOOD/VENEER (2) ──
  { name: 'Greenply Green Club BWP Plywood 18mm (8x4)', category: 'Plywood/Veneer', subCategory: 'Plywood', brand: 'Greenply', unit: 'piece', description: 'Boiling water proof plywood for wet areas. 18mm thick, 8x4 ft sheet.', specs: new Map([['Thickness', '18mm'], ['Size', '8x4 ft'], ['Grade', 'BWP/MR']]), hsnCode: '4412', taxSlab: 12 },
  { name: 'Century Laminates Sunmica 1mm Sheet (8x4)', category: 'Plywood/Veneer', subCategory: 'Laminates', brand: 'Century', unit: 'piece', description: 'High pressure laminate sheets for furniture finish. 1mm, 8x4 ft.', specs: new Map([['Thickness', '1mm'], ['Size', '8x4 ft'], ['Finish', 'Matt/Glossy']]), hsnCode: '4823', taxSlab: 18 },

  // ── GLASS (1) ──
  { name: 'Saint-Gobain Clear Float Glass 6mm (per sqft)', category: 'Glass', subCategory: 'Float Glass', brand: 'Saint-Gobain', unit: 'sqft', description: 'Clear float glass for windows and partitions. 6mm thick. Price per sqft.', specs: new Map([['Thickness', '6mm'], ['Type', 'Clear Float'], ['Toughened', 'Optional']]), hsnCode: '7005', taxSlab: 18 },

  // ── TOOLS/EQUIPMENT (2) ──
  { name: 'Bosch GBM 350 RE Rotary Drill Machine', category: 'Tools/Equipment', subCategory: 'Power Tools', brand: 'Bosch', unit: 'piece', description: 'Professional rotary drill, 350W, variable speed. Key chuck 10mm.', specs: new Map([['Power', '350W'], ['Chuck', '10mm'], ['Speed', '0-2800 rpm']]), hsnCode: '8467', taxSlab: 18 },
  { name: 'Concrete Vibrator Needle (1.5HP Electric)', category: 'Tools/Equipment', subCategory: 'Concrete Tools', brand: 'Wacker Neuson', unit: 'piece', description: 'Electric internal concrete vibrator for compacting RCC. 38mm needle.', specs: new Map([['Power', '1.5 HP'], ['Needle', '38mm'], ['Frequency', '200Hz']]), hsnCode: '8479', taxSlab: 18 },

  // ── FINISHING MATERIALS (2) ──
  { name: 'JK White Cement Putty (40kg)', category: 'Finishing Materials', subCategory: 'Wall Putty', brand: 'JK', unit: 'bag', description: 'White cement based wall putty for interior wall finishing. 40kg bag.', specs: new Map([['Weight', '40kg'], ['Coverage', '18-22 sqft/kg'], ['Layers', '2 coats']]), hsnCode: '3214', taxSlab: 18 },
  { name: 'Dr. Fixit Waterproofing Coating (10L)', category: 'Finishing Materials', subCategory: 'Waterproofing', brand: 'Dr. Fixit', unit: 'liter', description: 'Polymer modified cement-based waterproofing slurry. 10L pack.', specs: new Map([['Coverage', '35-40 sqft/L'], ['Coats', '2'], ['Cure Time', '28 days']]), hsnCode: '3214', taxSlab: 18 }
];

// ── 6 Supplier Profiles ──
// Prices per supplier will be added as SupplierProduct records

const seedSuppliersInfo = [
  {
    email: 'rakesh@delhicement.com',
    data: {
      businessName: 'Delhi Cement & Aggregates',
      gstin: '07AABCG1111B1Z2',
      categories: ['Cement', 'Sand', 'Aggregate/Gravel'],
      serviceZones: ['Delhi', 'Gurugram'],
      serviceablePincodes: ['110001', '110005', '110070', '110088', '122001', '122002'],
      rating: 4.6,
      totalReviews: 143,
      documentsVerified: true,
      location: { lat: 28.6692, lng: 77.2273 },
      contactPhone: '9811000011',
      contactEmail: 'rakesh@delhicement.com',
      address: 'Plot 12, Wazirpur Industrial Area, Delhi',
      establishedYear: 2008,
      description: 'Wholesale cement & aggregate supplier serving Delhi NCR for 15+ years. Authorised dealer for UltraTech, ACC, Ambuja.',
      status: 'approved'
    }
  },
  {
    email: 'mohan@gurugramsteel.com',
    data: {
      businessName: 'Gurugram Steel Traders',
      gstin: '06AABCM2222C1Z3',
      categories: ['Steel/TMT', 'Hardware/Fasteners'],
      serviceZones: ['Gurugram', 'Delhi', 'Faridabad'],
      serviceablePincodes: ['122001', '122002', '122018', '110039', '121001'],
      rating: 4.8,
      totalReviews: 289,
      documentsVerified: true,
      location: { lat: 28.4536, lng: 77.0288 },
      contactPhone: '9812000022',
      contactEmail: 'mohan@gurugramsteel.com',
      address: '45A, IMT Manesar Industrial Estate, Gurugram',
      establishedYear: 2003,
      description: 'Premium TMT bar distributor. Authorised stockist for Tata Tiscon, SAIL, JSW Neosteel. Bulk discount available.',
      status: 'approved'
    }
  },
  {
    email: 'anil@noidatiles.com',
    data: {
      businessName: 'Noida Tiles & Sanitaryware',
      gstin: '09AABCA3333D1Z4',
      categories: ['Tiles', 'Sanitaryware', 'Plumbing'],
      serviceZones: ['Noida', 'Ghaziabad', 'Delhi'],
      serviceablePincodes: ['201301', '201305', '201010', '110096', '201001'],
      rating: 4.4,
      totalReviews: 97,
      documentsVerified: true,
      location: { lat: 28.5744, lng: 77.3741 },
      contactPhone: '9813000033',
      contactEmail: 'anil@noidatiles.com',
      address: 'Sector 60, Noida, UP',
      establishedYear: 2012,
      description: 'Complete tiling and sanitaryware solutions — Kajaria, Somany, Hindware, Jaquar. 10,000+ SKUs in showroom.',
      status: 'approved'
    }
  },
  {
    email: 'vijay@faridabadpaint.com',
    data: {
      businessName: 'Faridabad Paint & Hardware',
      gstin: '06AABCV4444E1Z5',
      categories: ['Paint', 'Hardware/Fasteners', 'Plywood/Veneer', 'Finishing Materials'],
      serviceZones: ['Faridabad', 'Delhi', 'Gurugram'],
      serviceablePincodes: ['121001', '121002', '121003', '110044', '122001'],
      rating: 4.3,
      totalReviews: 64,
      documentsVerified: true,
      location: { lat: 28.4282, lng: 77.3004 },
      contactPhone: '9814000044',
      contactEmail: 'vijay@faridabadpaint.com',
      address: 'Old Faridabad Main Market, Faridabad, Haryana',
      establishedYear: 1998,
      description: 'One-stop shop for paints, hardware, plywood and finishing materials. Family business since 1998.',
      status: 'approved'
    }
  },
  {
    email: 'deepak@ghaziabadelec.com',
    data: {
      businessName: 'Ghaziabad Electrical Supplies',
      gstin: '09AABCD5555F1Z6',
      categories: ['Electrical', 'Tools/Equipment'],
      serviceZones: ['Ghaziabad', 'Noida', 'Delhi'],
      serviceablePincodes: ['201001', '201002', '201009', '201010', '110032'],
      rating: 4.7,
      totalReviews: 178,
      documentsVerified: true,
      location: { lat: 28.6649, lng: 77.4380 },
      contactPhone: '9815000055',
      contactEmail: 'deepak@ghaziabadelec.com',
      address: 'Lal Kuan, Ghaziabad, UP',
      establishedYear: 2005,
      description: 'Leading electrical materials distributor for Ghaziabad NCR. Havells, Legrand, Polycab, Schneider authorised dealer.',
      status: 'approved'
    }
  },
  {
    email: 'sanjay@delhibricks.com',
    data: {
      businessName: 'Delhi Bricks & Plywood House',
      gstin: '07AABCS6666G1Z7',
      categories: ['Bricks/Blocks', 'Plywood/Veneer', 'Glass'],
      serviceZones: ['Delhi', 'Noida', 'Ghaziabad'],
      serviceablePincodes: ['110031', '110032', '110053', '201301', '201001'],
      rating: 4.2,
      totalReviews: 52,
      documentsVerified: false,
      location: { lat: 28.7041, lng: 77.1025 },
      contactPhone: '9816000066',
      contactEmail: 'sanjay@delhibricks.com',
      address: 'Rohini Sector 11, Delhi',
      establishedYear: 2015,
      description: 'Brick and construction raw material supplier for East Delhi and Noida region.',
      status: 'pending'
    }
  }
];

// ─── SEEDER FUNCTION ─────────────────────────────────────────────────────────

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB Connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Supplier.deleteMany({});
    await Product.deleteMany({});
    await SupplierProduct.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users — let the User model's pre-save hook handle password hashing
    const createdUsers = [];
    for (const u of seedUsers) {
      const user = await User.create(u); // pre-save hook will hash u.passwordHash
      createdUsers.push(user);
    }
    console.log(`👥 Created ${createdUsers.length} users`);

    // Create products
    const createdProducts = await Product.insertMany(seedProducts);
    console.log(`📦 Created ${createdProducts.length} products`);

    // Helper to find user by email
    const userByEmail = (email) => createdUsers.find(u => u.email === email);

    // Create supplier records
    const createdSuppliers = [];
    for (const s of seedSuppliersInfo) {
      const user = userByEmail(s.email);
      if (!user) { console.warn(`⚠️  User not found for ${s.email}`); continue; }
      const supplier = await Supplier.create({ userRef: user._id, ...s.data });
      createdSuppliers.push({ supplier, email: s.email });
    }
    console.log(`🏭 Created ${createdSuppliers.length} supplier profiles`);

    // Helper to find product by name fragment
    const productByName = (name) => createdProducts.find(p => p.name.includes(name));
    const supplierByEmail = (email) => createdSuppliers.find(s => s.email === email)?.supplier;

    // ── SupplierProduct seed: each supplier lists relevant products ──
    const spData = [];

    const delhiCement = supplierByEmail('rakesh@delhicement.com');
    const gurugramSteel = supplierByEmail('mohan@gurugramsteel.com');
    const noidaTiles = supplierByEmail('anil@noidatiles.com');
    const faridabadPaint = supplierByEmail('vijay@faridabadpaint.com');
    const ghaziabadElec = supplierByEmail('deepak@ghaziabadelec.com');
    const delhibricks = supplierByEmail('sanjay@delhibricks.com');

    // Delhi Cement: cement, sand, aggregate products
    if (delhiCement) {
      spData.push(
        { productRef: productByName('UltraTech OPC')._id, supplierRef: delhiCement._id, pricePerUnit: 385, moq: 50, stockQty: 5000, avgDeliveryDays: 1 },
        { productRef: productByName('ACC Gold PPC')._id, supplierRef: delhiCement._id, pricePerUnit: 370, moq: 50, stockQty: 3000, avgDeliveryDays: 2 },
        { productRef: productByName('Ambuja Plus')._id, supplierRef: delhiCement._id, pricePerUnit: 378, moq: 50, stockQty: 2000, avgDeliveryDays: 2 },
        { productRef: productByName('River Sand')._id, supplierRef: delhiCement._id, pricePerUnit: 1200, moq: 5, stockQty: 500, avgDeliveryDays: 1 },
        { productRef: productByName('M-Sand')._id, supplierRef: delhiCement._id, pricePerUnit: 1400, moq: 5, stockQty: 800, avgDeliveryDays: 1 },
        { productRef: productByName('20mm Crushed')._id, supplierRef: delhiCement._id, pricePerUnit: 1100, moq: 5, stockQty: 1000, avgDeliveryDays: 1 },
        { productRef: productByName('10mm Fine')._id, supplierRef: delhiCement._id, pricePerUnit: 1050, moq: 5, stockQty: 600, avgDeliveryDays: 2 }
      );
    }

    // Gurugram Steel: TMT bars, hardware
    if (gurugramSteel) {
      spData.push(
        { productRef: productByName('SAIL TMT Fe500D 8mm')._id, supplierRef: gurugramSteel._id, pricePerUnit: 62000, moq: 1, stockQty: 100, avgDeliveryDays: 2 },
        { productRef: productByName('Tata Tiscon')._id, supplierRef: gurugramSteel._id, pricePerUnit: 63500, moq: 1, stockQty: 80, avgDeliveryDays: 2 },
        { productRef: productByName('JSW Neosteel')._id, supplierRef: gurugramSteel._id, pricePerUnit: 64000, moq: 1, stockQty: 60, avgDeliveryDays: 3 },
        { productRef: productByName('Stainless Steel Anchor')._id, supplierRef: gurugramSteel._id, pricePerUnit: 850, moq: 10, stockQty: 500, avgDeliveryDays: 1 },
        { productRef: productByName('GI Binding Wire')._id, supplierRef: gurugramSteel._id, pricePerUnit: 55, moq: 20, stockQty: 2000, avgDeliveryDays: 1 }
      );
    }

    // Noida Tiles: tiles, sanitaryware, plumbing
    if (noidaTiles) {
      spData.push(
        { productRef: productByName('Kajaria Soluble')._id, supplierRef: noidaTiles._id, pricePerUnit: 52, moq: 100, stockQty: 20000, avgDeliveryDays: 3 },
        { productRef: productByName('Somany Duragres')._id, supplierRef: noidaTiles._id, pricePerUnit: 38, moq: 100, stockQty: 15000, avgDeliveryDays: 3 },
        { productRef: productByName('Asian Granito Wall')._id, supplierRef: noidaTiles._id, pricePerUnit: 34, moq: 100, stockQty: 12000, avgDeliveryDays: 3 },
        { productRef: productByName('Hindware Aster')._id, supplierRef: noidaTiles._id, pricePerUnit: 14500, moq: 1, stockQty: 50, avgDeliveryDays: 5 },
        { productRef: productByName('Jaquar Lyric')._id, supplierRef: noidaTiles._id, pricePerUnit: 8200, moq: 1, stockQty: 40, avgDeliveryDays: 5 },
        { productRef: productByName('CPVC Pipes')._id, supplierRef: noidaTiles._id, pricePerUnit: 320, moq: 20, stockQty: 800, avgDeliveryDays: 2 },
        { productRef: productByName('uPVC Pressure')._id, supplierRef: noidaTiles._id, pricePerUnit: 180, moq: 50, stockQty: 2000, avgDeliveryDays: 2 }
      );
    }

    // Faridabad Paint: paint, hardware, plywood, finishing
    if (faridabadPaint) {
      spData.push(
        { productRef: productByName('Asian Paints Royale')._id, supplierRef: faridabadPaint._id, pricePerUnit: 215, moq: 20, stockQty: 1000, avgDeliveryDays: 2 },
        { productRef: productByName('Berger WeatherCoat')._id, supplierRef: faridabadPaint._id, pricePerUnit: 188, moq: 10, stockQty: 600, avgDeliveryDays: 2 },
        { productRef: productByName('Stainless Steel Anchor')._id, supplierRef: faridabadPaint._id, pricePerUnit: 895, moq: 5, stockQty: 300, avgDeliveryDays: 1 },
        { productRef: productByName('Greenply Green Club')._id, supplierRef: faridabadPaint._id, pricePerUnit: 2100, moq: 10, stockQty: 500, avgDeliveryDays: 3 },
        { productRef: productByName('Century Laminates')._id, supplierRef: faridabadPaint._id, pricePerUnit: 1450, moq: 20, stockQty: 1000, avgDeliveryDays: 2 },
        { productRef: productByName('JK White Cement Putty')._id, supplierRef: faridabadPaint._id, pricePerUnit: 490, moq: 20, stockQty: 2000, avgDeliveryDays: 1 },
        { productRef: productByName('Dr. Fixit')._id, supplierRef: faridabadPaint._id, pricePerUnit: 320, moq: 10, stockQty: 500, avgDeliveryDays: 2 }
      );
    }

    // Ghaziabad Electrical: electrical, tools
    if (ghaziabadElec) {
      spData.push(
        { productRef: productByName('Havells FRLS')._id, supplierRef: ghaziabadElec._id, pricePerUnit: 68, moq: 10, stockQty: 500, avgDeliveryDays: 2 },
        { productRef: productByName('Legrand MCB')._id, supplierRef: ghaziabadElec._id, pricePerUnit: 580, moq: 10, stockQty: 2000, avgDeliveryDays: 1 },
        { productRef: productByName('Bosch GBM')._id, supplierRef: ghaziabadElec._id, pricePerUnit: 3200, moq: 1, stockQty: 30, avgDeliveryDays: 3 },
        { productRef: productByName('Concrete Vibrator')._id, supplierRef: ghaziabadElec._id, pricePerUnit: 8500, moq: 1, stockQty: 10, avgDeliveryDays: 5 }
      );
    }

    // Delhi Bricks: bricks, plywood, glass
    if (delhibricks) {
      spData.push(
        { productRef: productByName('Red Clay Bricks')._id, supplierRef: delhibricks._id, pricePerUnit: 8, moq: 1000, stockQty: 500000, avgDeliveryDays: 2 },
        { productRef: productByName('AAC Blocks')._id, supplierRef: delhibricks._id, pricePerUnit: 52, moq: 500, stockQty: 50000, avgDeliveryDays: 3 },
        { productRef: productByName('Greenply Green Club')._id, supplierRef: delhibricks._id, pricePerUnit: 2050, moq: 10, stockQty: 300, avgDeliveryDays: 3 },
        { productRef: productByName('Saint-Gobain')._id, supplierRef: delhibricks._id, pricePerUnit: 85, moq: 50, stockQty: 5000, avgDeliveryDays: 4 }
      );
    }

    // ── Add secondary pricing: some products from 2+ suppliers for comparison ──
    // Cement from Faridabad Paint too (alternative supplier)
    if (faridabadPaint) {
      spData.push(
        { productRef: productByName('UltraTech OPC')._id, supplierRef: faridabadPaint._id, pricePerUnit: 392, moq: 20, stockQty: 500, avgDeliveryDays: 3 },
        { productRef: productByName('River Sand')._id, supplierRef: faridabadPaint._id, pricePerUnit: 1350, moq: 5, stockQty: 100, avgDeliveryDays: 3 }
      );
    }
    // TMT from Delhi Cement too
    if (delhiCement) {
      spData.push(
        { productRef: productByName('SAIL TMT Fe500D 8mm')._id, supplierRef: delhiCement._id, pricePerUnit: 62500, moq: 2, stockQty: 30, avgDeliveryDays: 3 }
      );
    }
    // Paint from Noida Tiles too
    if (noidaTiles) {
      spData.push(
        { productRef: productByName('Asian Paints Royale')._id, supplierRef: noidaTiles._id, pricePerUnit: 222, moq: 10, stockQty: 200, avgDeliveryDays: 4 }
      );
    }

    await SupplierProduct.insertMany(spData);
    console.log(`🔗 Created ${spData.length} supplier-product listings`);

    console.log('\n✅ SEED COMPLETE! Summary:');
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Products: ${createdProducts.length}`);
    console.log(`   Suppliers: ${createdSuppliers.length}`);
    console.log(`   Supplier-Product listings: ${spData.length}`);
    console.log('\n📧 Login credentials (all passwords: password123):');
    console.log('   admin@modit.com     → Admin');
    console.log('   customer@modit.com  → Customer');
    console.log('   builder@modit.com   → Contractor');
    console.log('   supplier@modit.com  → Supplier (not linked to a profile)');
    console.log('   rakesh@delhicement.com  → Supplier (Delhi Cement & Aggregates)');
    console.log('   mohan@gurugramsteel.com → Supplier (Gurugram Steel Traders)');
    console.log('   anil@noidatiles.com     → Supplier (Noida Tiles & Sanitaryware)');
    console.log('   vijay@faridabadpaint.com → Supplier (Faridabad Paint & Hardware)');
    console.log('   deepak@ghaziabadelec.com → Supplier (Ghaziabad Electrical Supplies)');
    console.log('   sanjay@delhibricks.com   → Supplier (Delhi Bricks & Plywood House)');

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedDB();
