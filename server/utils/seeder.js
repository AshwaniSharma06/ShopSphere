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

const generateProducts = () => {
  const products = [];
  const categoriesList = ['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports', 'Beauty'];
  
  const data = {
    'Electronics': {
      adjs: ['Wireless', 'Ergonomic', 'Smart', 'Ultra-Slim', 'Mechanical', 'Bluetooth', 'Noise-Cancelling', 'Portable', 'HD', '4K', 'High-Speed', 'Rechargeable', 'Compact', 'Gaming', 'Dual-Band', 'Smart-Home', 'Virtual-Reality', 'Next-Gen'],
      nouns: ['Headphones', 'Smart Watch', 'Laptop', 'Keyboard', 'Speaker', 'Mouse', 'Monitor', 'Charger', 'Tablet', 'Earbuds', 'Power Bank', 'Webcam', 'Microphone', 'Router', 'VR Headset', 'Projector', 'Security Camera', 'SSD Drive'],
      basePrice: 1500,
      priceVar: 45000,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
        'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500',
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500',
        'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=500',
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500',
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500'
      ],
      tagPool: ['electronics', 'tech', 'gadget', 'wireless', 'smart', 'hardware']
    },
    'Fashion': {
      adjs: ['Classic', 'Casual', 'Slim-Fit', 'Vintage', 'Premium', 'Organic Cotton', 'Designer', 'Waterproof', 'Cozy', 'Breathable', 'Formal', 'Stretched', 'Sporty', 'Knitted', 'Lightweight', 'Denim', 'Elegant', 'Modern-Fit'],
      nouns: ['Jacket', 'Tote Bag', 'Hoodie', 'T-Shirt', 'Jeans', 'Sneakers', 'Sunglasses', 'Scarf', 'Sweater', 'Dress Pants', 'Belt', 'Boots', 'Hat', 'Socks', 'Gloves', 'Raincoat', 'Blazer', 'Windbreaker'],
      basePrice: 500,
      priceVar: 4500,
      images: [
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
        'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500',
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500',
        'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=500',
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500',
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500',
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500'
      ],
      tagPool: ['fashion', 'apparel', 'clothing', 'style', 'casual', 'wear']
    },
    'Home & Kitchen': {
      adjs: ['Minimalist', 'Stainless Steel', 'Ceramic', 'Insulated', 'Bamboo', 'Non-Stick', 'Handcrafted', 'Electric', 'Adjustable', 'Modern', 'Eco-Friendly', 'Double-Walled', 'Rotating', 'Space-Saving', 'Retro', 'Wooden', 'Smart', 'Luxury'],
      nouns: ['Water Bottle', 'Desk Lamp', 'Coffee Mug', 'Chefs Knife', 'Cutting Board', 'Toaster', 'Air Fryer', 'Organizer', 'Storage Container', 'Blender', 'Pan', 'Spice Rack', 'Teapot', 'Serving Tray', 'Trash Can', 'Coasters', 'Dinnerware Set', 'Table Runner'],
      basePrice: 300,
      priceVar: 8000,
      images: [
        'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500',
        'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=500',
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500',
        'https://images.unsplash.com/photo-1599610928290-798c8c201df1?w=500',
        'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500',
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500',
        'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=500',
        'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=500'
      ],
      tagPool: ['home', 'kitchen', 'decor', 'dining', 'cooking', 'lifestyle']
    },
    'Books': {
      adjs: ['The Art of', 'Introduction to', 'Mastering', 'A Guide to', 'The Secrets of', 'History of', 'Principles of', 'Lessons in', 'Advanced', 'Simplified', 'Understanding', 'Philosophy of', 'The Joy of', 'Fascinating World of', 'Essentials of', 'Handbook of', 'Journey Through', 'The Legacy of'],
      nouns: ['Programming', 'Machine Learning', 'Financial Freedom', 'Modern Philosophy', 'Creative Writing', 'Data Science', 'World History', 'Healthy Cooking', 'Microeconomics', 'Graphic Design', 'Public Speaking', 'Digital Marketing', 'Astronomy', 'Psychology', 'Photography', 'Organic Gardening', 'Yoga Practices', 'Modern Art'],
      basePrice: 299,
      priceVar: 1500,
      images: [
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500',
        'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=500',
        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500',
        'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500',
        'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=500',
        'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500'
      ],
      tagPool: ['book', 'education', 'reading', 'learning', 'guide', 'literature']
    },
    'Sports': {
      adjs: ['Running', 'Yoga', 'High-Performance', 'Heavy-Duty', 'Adjustable', 'Anti-Slip', 'Portable', 'Durable', 'Waterproof', 'Ergonomic', 'Lightweight', 'Professional', 'All-Weather', 'Ultra-Grip', 'Padded', 'Elastic', 'Compact', 'Aero-Dynamic'],
      nouns: ['Sneakers Ultra', 'Mat Premium', 'Dumbbells Set', 'Resistance Bands', 'Jump Rope', 'Waterproof Backpack', 'Foam Roller', 'Sports Towel', 'Gym Bag', 'Cycling Helmet', 'Knee Sleeves', 'Tennis Racket', 'Running Belt', 'Workout Gloves', 'Yoga Blocks', 'Exercise Ball', 'Ankle Weights', 'Massage Gun'],
      basePrice: 400,
      priceVar: 12000,
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
        'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500',
        'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500',
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500',
        'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=500',
        'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=500',
        'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500'
      ],
      tagPool: ['sports', 'fitness', 'exercise', 'gear', 'workout', 'training']
    },
    'Beauty': {
      adjs: ['Organic', 'Vitamin C', 'Hydrating', 'Rejuvenating', 'Charcoal', 'Herbal', 'Exfoliating', 'Vegan', 'Soothe', 'Nourishing', 'Purifying', 'Anti-Aging', 'Moisturizing', 'Natural', 'Premium', 'Deep-Cleansing', 'Refreshing', 'Glow-Boost'],
      nouns: ['Face Serum', 'Face Wash', 'Clay Mask', 'Lip Balm', 'Moisturizer Cream', 'Sunscreen SPF 50', 'Hair Oil', 'Body Scrub', 'Eye Cream', 'Toner Spray', 'Cleansing Balm', 'Night Cream', 'Hand Cream', 'Shampoo Bar', 'Conditioner Set', 'Face Roller', 'Micellar Water', 'Lip Scrub'],
      basePrice: 200,
      priceVar: 3500,
      images: [
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500',
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500',
        'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500',
        'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=500',
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500',
        'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=500',
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500'
      ],
      tagPool: ['beauty', 'skincare', 'cosmetics', 'grooming', 'organic', 'selfcare']
    }
  };
  
  const productsPerCategory = 18;
  
  for (const catName of categoriesList) {
    const catInfo = data[catName];
    for (let i = 0; i < productsPerCategory; i++) {
      const adj = catInfo.adjs[i % catInfo.adjs.length];
      const noun = catInfo.nouns[i % catInfo.nouns.length];
      const title = `${adj} ${noun}`;
      
      const price = Math.round(catInfo.basePrice + Math.random() * catInfo.priceVar);
      const discountPercent = Math.random() > 0.6 ? Math.round(5 + Math.random() * 25) : 0;
      const stock = Math.round(10 + Math.random() * 490);
      const rating = parseFloat((4.0 + Math.random() * 1.0).toFixed(1));
      const numReviews = Math.round(5 + Math.random() * 500);
      
      const isFeatured = Math.random() > 0.8;
      const isTrending = Math.random() > 0.8;
      
      const tags = [catName.toLowerCase(), ...catInfo.tagPool.sort(() => 0.5 - Math.random()).slice(0, 3)];
      const imageIndex = i % catInfo.images.length;
      const images = [catInfo.images[imageIndex]];
      
      const description = `This high-quality ${title.toLowerCase()} is perfect for your everyday needs. Designed with durability and convenience in mind, it represents the finest craftsmanship in ${catName.toLowerCase()}. Enjoy premium features, exceptional reliability, and modern style at an unbeatable value.`;
      
      products.push({
        title,
        description,
        price,
        discountPercent,
        stock,
        isFeatured,
        isTrending,
        tags,
        images,
        categoryName: catName,
        rating,
        numReviews
      });
    }
  }
  
  return products;
};

const seedProducts = generateProducts();

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
