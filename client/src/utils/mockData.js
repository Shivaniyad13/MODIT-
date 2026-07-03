export const mockCategories = [
  { name: 'Cement', count: 3 },
  { name: 'Steel/TMT', count: 3 },
  { name: 'Sand', count: 2 },
  { name: 'Aggregate/Gravel', count: 2 },
  { name: 'Bricks/Blocks', count: 2 },
  { name: 'Tiles', count: 3 },
  { name: 'Sanitaryware', count: 2 },
  { name: 'Plumbing', count: 2 },
  { name: 'Electrical', count: 2 },
  { name: 'Paint', count: 2 },
  { name: 'Hardware/Fasteners', count: 2 },
  { name: 'Plywood/Veneer', count: 2 },
  { name: 'Glass', count: 1 },
  { name: 'Tools/Equipment', count: 2 },
  { name: 'Finishing Materials', count: 2 }
];

export const mockProducts = [
  { _id: 'prod_1', name: 'UltraTech OPC 53 Grade Cement', category: 'Cement', subCategory: 'OPC', brand: 'UltraTech', unit: 'bag', description: 'High strength OPC 53 grade cement for RCC structures. 50 kg bag.', specs: { 'Grade': 'OPC 53', 'Weight': '50 kg', 'Setting Time': '30 min initial' }, hsnCode: '2523', taxSlab: 28 },
  { _id: 'prod_2', name: 'ACC Gold PPC Cement', category: 'Cement', subCategory: 'PPC', brand: 'ACC', unit: 'bag', description: 'Portland Pozzolana Cement for general construction. 50 kg bag.', specs: { 'Grade': 'PPC', 'Weight': '50 kg', 'Fly Ash': '25%' }, hsnCode: '2523', taxSlab: 28 },
  { _id: 'prod_3', name: 'Ambuja Plus Cement', category: 'Cement', subCategory: 'OPC', brand: 'Ambuja', unit: 'bag', description: 'Premium OPC cement with superior strength and durability.', specs: { 'Grade': 'OPC 43', 'Weight': '50 kg' }, hsnCode: '2523', taxSlab: 28 },
  { _id: 'prod_4', name: 'SAIL TMT Fe500D 8mm Rebar', category: 'Steel/TMT', subCategory: 'TMT Bars', brand: 'SAIL', unit: 'ton', description: 'Fe500D grade earthquake resistant TMT bars for RCC. 8mm diameter.', specs: { 'Grade': 'Fe500D', 'Diameter': '8mm', 'Length': '12m' }, hsnCode: '7214', taxSlab: 18 },
  { _id: 'prod_5', name: 'Tata Tiscon TMT Fe550 12mm', category: 'Steel/TMT', subCategory: 'TMT Bars', brand: 'Tata Tiscon', unit: 'ton', description: 'High strength Fe550 grade TMT bars. 12mm diameter, corrosion resistant.', specs: { 'Grade': 'Fe550', 'Diameter': '12mm', 'Length': '12m' }, hsnCode: '7214', taxSlab: 18 },
  { _id: 'prod_6', name: 'JSW Neosteel 550D 16mm', category: 'Steel/TMT', subCategory: 'TMT Bars', brand: 'JSW Neosteel', unit: 'ton', description: 'Premium Fe550D Neosteel for high-rise construction. 16mm.', specs: { 'Grade': 'Fe550D', 'Diameter': '16mm' }, hsnCode: '7214', taxSlab: 18 },
  { _id: 'prod_7', name: 'River Sand (Fine Grade)', category: 'Sand', subCategory: 'River Sand', brand: 'Local', unit: 'ton', description: 'Natural river sand for plaster and masonry. Sieve size Zone 2.', specs: { 'Zone': 'Zone 2', 'Sieve': '4.75mm' }, hsnCode: '2505', taxSlab: 5 },
  { _id: 'prod_8', name: 'M-Sand (Manufactured Sand)', category: 'Sand', subCategory: 'M-Sand', brand: 'Local', unit: 'ton', description: 'Machine-crushed granite sand for concrete. Consistent grading.', specs: { 'Source': 'Granite', 'Grade': 'Concrete Grade' }, hsnCode: '2505', taxSlab: 5 },
  { _id: 'prod_9', name: '20mm Crushed Stone Aggregate', category: 'Aggregate/Gravel', subCategory: 'Coarse Aggregate', brand: 'Local', unit: 'ton', description: 'Crushed stone aggregate for concrete mix. 20mm grading.', specs: { 'Size': '20mm', 'Type': 'Crushed Stone' }, hsnCode: '2517', taxSlab: 5 },
  { _id: 'prod_10', name: '10mm Fine Aggregate / Grit', category: 'Aggregate/Gravel', subCategory: 'Fine Aggregate', brand: 'Local', unit: 'ton', description: 'Fine grit for concrete, floor screed, and pavement.', specs: { 'Size': '10mm' }, hsnCode: '2517', taxSlab: 5 },
  { _id: 'prod_11', name: 'Red Clay Bricks (Standard)', category: 'Bricks/Blocks', subCategory: 'Clay Bricks', brand: 'Local', unit: 'piece', description: 'Traditional red clay bricks for masonry walls. Standard size 230x110x75mm.', specs: { 'Size': '230x110x75mm', 'Class': 'Class A' }, hsnCode: '6901', taxSlab: 5 },
  { _id: 'prod_12', name: 'AAC Blocks (Autoclaved Aerated)', category: 'Bricks/Blocks', subCategory: 'AAC Blocks', brand: 'Siporex', unit: 'piece', description: 'Lightweight AAC blocks for energy efficient construction. 600x200x200mm.', specs: { 'Size': '600x200x200mm', 'Density': '550 kg/m3' }, hsnCode: '6901', taxSlab: 12 },
  { _id: 'prod_13', name: 'Kajaria Soluble Salt Vitrified Tile 600x600', category: 'Tiles', subCategory: 'Vitrified', brand: 'Kajaria', unit: 'sqft', description: 'Double charge vitrified tiles for flooring. 600x600mm, 9mm thick.', specs: { 'Size': '600x600mm', 'Thickness': '9mm', 'Finish': 'Glossy' }, hsnCode: '6907', taxSlab: 18 },
  { _id: 'prod_14', name: 'Somany Duragres Floor Tile 400x400', category: 'Tiles', subCategory: 'Ceramic Floor', brand: 'Somany', unit: 'sqft', description: 'Anti-skid ceramic floor tiles for bathrooms and kitchens.', specs: { 'Size': '400x400mm', 'Finish': 'Matt', 'PEI': 'Grade IV' }, hsnCode: '6907', taxSlab: 18 },
  { _id: 'prod_15', name: 'Asian Granito Wall Tile 300x450', category: 'Tiles', subCategory: 'Wall Tiles', brand: 'Asian Granito', unit: 'sqft', description: 'Digital print ceramic wall tiles for bathrooms. 300x450mm.', specs: { 'Size': '300x450mm', 'Type': 'Wall Tile' }, hsnCode: '6907', taxSlab: 18 },
  { _id: 'prod_16', name: 'Hindware Aster Wall Hung WC', category: 'Sanitaryware', subCategory: 'WC', brand: 'Hindware', unit: 'piece', description: 'Modern wall hung water closet with dual flush system.', specs: { 'Type': 'Wall Hung', 'Flush': 'Dual 3/6L', 'Color': 'Ivory White' }, hsnCode: '6910', taxSlab: 18 },
  { _id: 'prod_17', name: 'Jaquar Lyric Basin', category: 'Sanitaryware', subCategory: 'Wash Basin', brand: 'Jaquar', unit: 'piece', description: 'Elegant under-counter wash basin, vitreous china, white.', specs: { 'Size': '500x400mm', 'Material': 'Vitreous China' }, hsnCode: '6910', taxSlab: 18 },
  { _id: 'prod_18', name: 'CPVC Pipes & Fittings (1 inch, 10ft)', category: 'Plumbing', subCategory: 'CPVC Pipes', brand: 'Astral', unit: 'piece', description: 'Hot & cold water CPVC pipes. 1 inch diameter, 10 ft length.', specs: { 'Diameter': '1 inch', 'Length': '10 ft', 'Pressure': 'SDR 11' }, hsnCode: '3917', taxSlab: 18 },
  { _id: 'prod_19', name: 'uPVC Pressure Pipes (2 inch, ISI Mark)', category: 'Plumbing', subCategory: 'uPVC Pipes', brand: 'Supreme', unit: 'meter', description: 'ISI marked uPVC pressure pipes for underground supply lines. 2 inch.', specs: { 'Diameter': '2 inch', 'Standard': 'IS:4985', 'Color': 'Grey' }, hsnCode: '3917', taxSlab: 18 },
  { _id: 'prod_20', name: 'Havells FRLS Wires 1.5 sqmm (90m)', category: 'Electrical', subCategory: 'Wires & Cables', brand: 'Havells', unit: 'roll', description: 'Fire retardant low smoke 1.5 sqmm copper wires, red/black/green/yellow available.', specs: { 'Rating': '1.5 sqmm', 'Length': '90m', 'Type': 'FRLS' }, hsnCode: '8544', taxSlab: 18 },
  { _id: 'prod_21', name: 'Legrand MCB 32A Single Pole', category: 'Electrical', subCategory: 'MCB & DB', brand: 'Legrand', unit: 'piece', description: 'DX3 miniature circuit breaker, 32A SP for branch circuit protection.', specs: { 'Rating': '32A', 'Poles': 'Single', 'Breaking Capacity': '6kA' }, hsnCode: '8535', taxSlab: 18 },
  { _id: 'prod_22', name: 'Asian Paints Royale Luxury Emulsion (20L)', category: 'Paint', subCategory: 'Interior Emulsion', brand: 'Asian Paints', unit: 'liter', description: 'Premium interior luxury emulsion for walls & ceilings. 20 liter bucket.', specs: { 'Coverage': '140-160 sqft/L', 'Finish': 'Sheen', 'VOC': 'Low' }, hsnCode: '3209', taxSlab: 18 },
  { _id: 'prod_23', name: 'Berger WeatherCoat Exterior Emulsion (10L)', category: 'Paint', subCategory: 'Exterior Paint', brand: 'Berger', unit: 'liter', description: 'Waterproof exterior emulsion with UV protection. 10 liter bucket.', specs: { 'Coverage': '120-140 sqft/L', 'Weather': 'UV Protected' }, hsnCode: '3209', taxSlab: 18 },
  { _id: 'prod_24', name: 'Stainless Steel Anchor Bolts (M12, Box of 50)', category: 'Hardware/Fasteners', subCategory: 'Fasteners', brand: 'Jindal', unit: 'box', description: 'SS 304 grade expansion anchor bolts for heavy fixings. M12x100mm, box of 50.', specs: { 'Size': 'M12x100mm', 'Grade': 'SS 304', 'Qty': '50/box' }, hsnCode: '7318', taxSlab: 18 },
  { _id: 'prod_25', name: 'GI Binding Wire 18 Gauge (5kg)', category: 'Hardware/Fasteners', subCategory: 'Binding Wire', brand: 'Local', unit: 'kg', description: 'Galvanized iron binding wire for tying rebar. 18 gauge, 5kg coil.', specs: { 'Gauge': '18', 'Weight': '5kg', 'Coating': 'Galvanized' }, hsnCode: '7217', taxSlab: 18 },
  { _id: 'prod_26', name: 'Greenply Green Club BWP Plywood 18mm (8x4)', category: 'Plywood/Veneer', subCategory: 'Plywood', brand: 'Greenply', unit: 'piece', description: 'Boiling water proof plywood for wet areas. 18mm thick, 8x4 ft sheet.', specs: { 'Thickness': '18mm', 'Size': '8x4 ft', 'Grade': 'BWP/MR' }, hsnCode: '4412', taxSlab: 12 },
  { _id: 'prod_27', name: 'Century Laminates Sunmica 1mm Sheet (8x4)', category: 'Plywood/Veneer', subCategory: 'Laminates', brand: 'Century', unit: 'piece', description: 'High pressure laminate sheets for furniture finish. 1mm, 8x4 ft.', specs: { 'Thickness': '1mm', 'Size': '8x4 ft', 'Finish': 'Matt/Glossy' }, hsnCode: '4823', taxSlab: 18 },
  { _id: 'prod_28', name: 'Saint-Gobain Clear Float Glass 6mm (per sqft)', category: 'Glass', subCategory: 'Float Glass', brand: 'Saint-Gobain', unit: 'sqft', description: 'Clear float glass for windows and partitions. 6mm thick. Price per sqft.', specs: { 'Thickness': '6mm', 'Type': 'Clear Float', 'Toughened': 'Optional' }, hsnCode: '7005', taxSlab: 18 },
  { _id: 'prod_29', name: 'Bosch GBM 350 RE Rotary Drill Machine', category: 'Tools/Equipment', subCategory: 'Power Tools', brand: 'Bosch', unit: 'piece', description: 'Professional rotary drill, 350W, variable speed. Key chuck 10mm.', specs: { 'Power': '350W', 'Chuck': '10mm', 'Speed': '0-2800 rpm' }, hsnCode: '8467', taxSlab: 18 },
  { _id: 'prod_30', name: 'Concrete Vibrator Needle (1.5HP Electric)', category: 'Tools/Equipment', subCategory: 'Concrete Tools', brand: 'Wacker Neuson', unit: 'piece', description: 'Electric internal concrete vibrator for compacting RCC. 38mm needle.', specs: { 'Power': '1.5 HP', 'Needle': '38mm', 'Frequency': '200Hz' }, hsnCode: '8479', taxSlab: 18 },
  { _id: 'prod_31', name: 'JK White Cement Putty (40kg)', category: 'Finishing Materials', subCategory: 'Wall Putty', brand: 'JK', unit: 'bag', description: 'White cement based wall putty for interior wall finishing. 40kg bag.', specs: { 'Weight': '40kg', 'Coverage': '18-22 sqft/kg', 'Layers': '2 coats' }, hsnCode: '3214', taxSlab: 18 },
  { _id: 'prod_32', name: 'Dr. Fixit Waterproofing Coating (10L)', category: 'Finishing Materials', subCategory: 'Waterproofing', brand: 'Dr. Fixit', unit: 'liter', description: 'Polymer modified cement-based waterproofing slurry. 10L pack.', specs: { 'Coverage': '35-40 sqft/L', 'Coats': '2', 'Cure Time': '28 days' }, hsnCode: '3214', taxSlab: 18 }
];

export const mockSuppliers = [
  { _id: 'sup_1', businessName: 'Delhi Cement & Aggregates', rating: 4.6, totalReviews: 143, serviceZones: ['Delhi', 'Gurugram'], description: 'Wholesale cement & aggregate supplier serving Delhi NCR.' },
  { _id: 'sup_2', businessName: 'Gurugram Steel Traders', rating: 4.8, totalReviews: 289, serviceZones: ['Gurugram', 'Delhi', 'Faridabad'], description: 'Premium TMT bar distributor.' },
  { _id: 'sup_3', businessName: 'Noida Tiles & Sanitaryware', rating: 4.4, totalReviews: 97, serviceZones: ['Noida', 'Ghaziabad', 'Delhi'], description: 'Complete tiling and sanitaryware solutions.' },
  { _id: 'sup_4', businessName: 'Faridabad Paint & Hardware', rating: 4.3, totalReviews: 64, serviceZones: ['Faridabad', 'Delhi', 'Gurugram'], description: 'One-stop shop for paints, hardware, and plywood.' },
  { _id: 'sup_5', businessName: 'Ghaziabad Electrical Supplies', rating: 4.7, totalReviews: 178, serviceZones: ['Ghaziabad', 'Noida', 'Delhi'], description: 'Leading electrical materials distributor.' },
  { _id: 'sup_6', businessName: 'Delhi Bricks & Plywood House', rating: 4.2, totalReviews: 52, serviceZones: ['Delhi', 'Noida', 'Ghaziabad'], description: 'Brick and construction raw material supplier.' }
];

// Generates dynamic listings for a product ID based on its category
export const getMockListings = (productId) => {
  const product = mockProducts.find(p => p._id === productId);
  if (!product) return [];

  const listings = [];
  
  if (product.category === 'Cement' || product.category === 'Sand' || product.category === 'Aggregate/Gravel') {
    listings.push({
      _id: `list_${productId}_1`,
      productRef: product._id,
      supplierRef: mockSuppliers[0], // Delhi Cement
      pricePerUnit: product.category === 'Cement' ? 380 : 1200,
      moq: 50,
      stockQty: 5000,
      avgDeliveryDays: 1
    });
    if (product.category === 'Cement') {
      listings.push({
        _id: `list_${productId}_2`,
        productRef: product._id,
        supplierRef: mockSuppliers[3], // Faridabad Paint
        pricePerUnit: 392,
        moq: 20,
        stockQty: 500,
        avgDeliveryDays: 2
      });
    }
  }

  if (product.category === 'Steel/TMT' || product.category === 'Hardware/Fasteners') {
    listings.push({
      _id: `list_${productId}_3`,
      productRef: product._id,
      supplierRef: mockSuppliers[1], // Gurugram Steel
      pricePerUnit: product.category === 'Steel/TMT' ? 62000 : 850,
      moq: 2,
      stockQty: 100,
      avgDeliveryDays: 2
    });
  }

  if (product.category === 'Tiles' || product.category === 'Sanitaryware' || product.category === 'Plumbing') {
    listings.push({
      _id: `list_${productId}_4`,
      productRef: product._id,
      supplierRef: mockSuppliers[2], // Noida Tiles
      pricePerUnit: product.category === 'Tiles' ? 45 : 8200,
      moq: 100,
      stockQty: 15000,
      avgDeliveryDays: 3
    });
  }

  if (product.category === 'Paint' || product.category === 'Plywood/Veneer' || product.category === 'Finishing Materials') {
    listings.push({
      _id: `list_${productId}_5`,
      productRef: product._id,
      supplierRef: mockSuppliers[3], // Faridabad Paint
      pricePerUnit: product.category === 'Paint' ? 210 : 1800,
      moq: 10,
      stockQty: 800,
      avgDeliveryDays: 2
    });
  }

  if (product.category === 'Electrical' || product.category === 'Tools/Equipment') {
    listings.push({
      _id: `list_${productId}_6`,
      productRef: product._id,
      supplierRef: mockSuppliers[4], // Ghaziabad Elec
      pricePerUnit: product.category === 'Electrical' ? 65 : 3200,
      moq: 10,
      stockQty: 1000,
      avgDeliveryDays: 1
    });
  }

  if (product.category === 'Bricks/Blocks' || product.category === 'Glass') {
    listings.push({
      _id: `list_${productId}_7`,
      productRef: product._id,
      supplierRef: mockSuppliers[5], // Delhi Bricks
      pricePerUnit: product.category === 'Bricks/Blocks' ? 8 : 85,
      moq: 500,
      stockQty: 250000,
      avgDeliveryDays: 2
    });
  }

  // Fallback listing if empty
  if (listings.length === 0) {
    listings.push({
      _id: `list_${productId}_fallback`,
      productRef: product._id,
      supplierRef: mockSuppliers[0],
      pricePerUnit: 150,
      moq: 10,
      stockQty: 500,
      avgDeliveryDays: 2
    });
  }

  return listings;
};
