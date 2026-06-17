const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const generateQR = require('./generateQR');

const categories = [
  { name: 'Electronics', description: 'Gadgets, devices, and tech accessories', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400' },
  { name: 'Fashion', description: 'Clothing, shoes, and accessories', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400' },
  { name: 'Home & Kitchen', description: 'Furniture, decor, and kitchen essentials', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400' },
  { name: 'Books', description: 'Bestsellers, textbooks, and novels', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400' },
  { name: 'Sports', description: 'Sports equipment and fitness gear', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400' },
  { name: 'Beauty', description: 'Skincare, makeup, and personal care', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400' },
];

const seedProducts = [
  {
    title: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-cancelling wireless headphones with 40-hour battery life, deep bass, and crystal-clear sound. Features adaptive ANC, transparency mode, and multipoint connectivity.',
    price: 2999,
    discountPercent: 15,
    stock: 150,
    isFeatured: true,
    isTrending: true,
    tags: ['headphones', 'wireless', 'bluetooth', 'audio', 'noise-cancelling'],
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500',
    ],
    categoryName: 'Electronics',
    rating: 4.5,
    numReviews: 128,
  },
  {
    title: 'Smart Watch Pro',
    description: 'Advanced fitness tracker and smartwatch with AMOLED display, heart rate monitoring, GPS, sleep tracking, and 7-day battery life. Water resistant to 50m.',
    price: 4999,
    discountPercent: 10,
    stock: 80,
    isFeatured: true,
    tags: ['smartwatch', 'fitness', 'wearable', 'health'],
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    ],
    categoryName: 'Electronics',
    rating: 4.3,
    numReviews: 89,
  },
  {
    title: 'Ultra-Slim Laptop 15"',
    description: 'Powerful ultrabook with 15.6" 4K display, Intel i7 processor, 16GB RAM, 512GB SSD. Perfect for professionals and creators.',
    price: 54999,
    discountPercent: 5,
    stock: 25,
    isFeatured: true,
    isTrending: true,
    tags: ['laptop', 'computer', 'ultrabook', 'professional'],
    images: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
    ],
    categoryName: 'Electronics',
    rating: 4.7,
    numReviews: 203,
  },
  {
    title: 'Classic Denim Jacket',
    description: 'Timeless denim jacket crafted from premium cotton denim. Features a relaxed fit, brass buttons, and adjustable waist tabs.',
    price: 1999,
    discountPercent: 20,
    stock: 200,
    isTrending: true,
    tags: ['jacket', 'denim', 'fashion', 'casual'],
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
    ],
    categoryName: 'Fashion',
    rating: 4.2,
    numReviews: 67,
  },
  {
    title: 'Running Sneakers Ultra',
    description: 'Lightweight running shoes with responsive cushioning, breathable mesh upper, and durable rubber outsole. Ideal for daily runs and marathon training.',
    price: 3499,
    discountPercent: 0,
    stock: 120,
    isFeatured: true,
    tags: ['shoes', 'running', 'sneakers', 'sports', 'fitness'],
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    ],
    categoryName: 'Sports',
    rating: 4.6,
    numReviews: 156,
  },
  {
    title: 'Stainless Steel Water Bottle',
    description: 'Vacuum insulated water bottle that keeps drinks cold for 24 hours and hot for 12 hours. BPA-free, leak-proof lid, 750ml capacity.',
    price: 599,
    discountPercent: 10,
    stock: 500,
    tags: ['water-bottle', 'kitchen', 'eco-friendly', 'fitness'],
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500',
    ],
    categoryName: 'Home & Kitchen',
    rating: 4.4,
    numReviews: 312,
  },
  {
    title: 'The Art of Programming',
    description: 'A comprehensive guide to modern software engineering practices. Covers clean code, design patterns, system design, and career growth strategies.',
    price: 799,
    discountPercent: 5,
    stock: 300,
    isFeatured: true,
    tags: ['book', 'programming', 'technology', 'learning'],
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
    ],
    categoryName: 'Books',
    rating: 4.8,
    numReviews: 445,
  },
  {
    title: 'Yoga Mat Premium',
    description: 'Extra thick 6mm yoga mat with non-slip surface, alignment markers, and carrying strap. Made from eco-friendly TPE material.',
    price: 1299,
    discountPercent: 0,
    stock: 180,
    isTrending: true,
    tags: ['yoga', 'fitness', 'mat', 'exercise'],
    images: [
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500',
    ],
    categoryName: 'Sports',
    rating: 4.3,
    numReviews: 98,
  },
  {
    title: 'Organic Face Serum',
    description: 'Luxurious vitamin C and hyaluronic acid face serum. Brightens skin, reduces dark spots, and provides deep hydration. Suitable for all skin types.',
    price: 899,
    discountPercent: 25,
    stock: 250,
    isFeatured: true,
    isTrending: true,
    tags: ['skincare', 'beauty', 'serum', 'organic'],
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500',
    ],
    categoryName: 'Beauty',
    rating: 4.6,
    numReviews: 178,
  },
  {
    title: 'Minimalist Desk Lamp',
    description: 'Modern LED desk lamp with touch dimmer, 3 color temperature modes, and USB charging port. Flexible gooseneck design with stable weighted base.',
    price: 1499,
    discountPercent: 10,
    stock: 90,
    tags: ['lamp', 'desk', 'home', 'office', 'led'],
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=500',
    ],
    categoryName: 'Home & Kitchen',
    rating: 4.1,
    numReviews: 54,
  },
  {
    title: 'Mechanical Keyboard RGB',
    description: 'Compact 75% mechanical keyboard with hot-swappable switches, per-key RGB backlighting, PBT keycaps, and USB-C connectivity.',
    price: 3999,
    discountPercent: 0,
    stock: 60,
    isTrending: true,
    tags: ['keyboard', 'mechanical', 'gaming', 'computer', 'rgb'],
    images: [
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500',
    ],
    categoryName: 'Electronics',
    rating: 4.5,
    numReviews: 87,
  },
  {
    title: 'Canvas Tote Bag',
    description: 'Spacious canvas tote bag with inner zipper pocket and reinforced handles. Perfect for daily use, shopping, or beach trips.',
    price: 499,
    discountPercent: 0,
    stock: 400,
    tags: ['bag', 'tote', 'canvas', 'fashion', 'eco-friendly'],
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500',
    ],
    categoryName: 'Fashion',
    rating: 4.0,
    numReviews: 42,
  },
];

const seedDB = async () => {
  try {
    await connectDB();
    console.log('🗑️  Clearing existing data...');

    await Product.deleteMany({});
    await Category.deleteMany({});

    console.log('📁 Seeding categories...');
    const createdCategories = await Category.insertMany(categories);
    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });

    console.log('📦 Seeding products...');
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    const productsToInsert = seedProducts.map((p) => ({
      ...p,
      category: categoryMap[p.categoryName],
      categoryName: undefined,
    }));

    const createdProducts = await Product.insertMany(productsToInsert);

    // Generate QR codes for each product
    console.log('🔲 Generating QR codes...');
    for (const product of createdProducts) {
      product.qrCode = await generateQR(product._id, clientUrl);
      await product.save();
    }

    console.log(`✅ Seeded ${createdCategories.length} categories and ${createdProducts.length} products`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDB();
