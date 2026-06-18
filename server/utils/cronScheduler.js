const cron = require('node-cron');
const Product = require('../models/Product');
const sendEmail = require('./sendEmail');

/**
 * Scan database for products with low stock count (<= 5)
 * and compile an email report warning to administrators.
 */
const scanInventoryAndWarn = async () => {
  try {
    console.log('🕰️  Initiating automated product inventory levels scan...');
    const lowStockProducts = await Product.find({ stock: { $lte: 5 } });

    if (lowStockProducts.length > 0) {
      console.log(`🚨 Identified ${lowStockProducts.length} items with low stock. Generating email warning...`);

      const rowsHtml = lowStockProducts
        .map(
          (p) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 10px; color: #1e293b; font-weight: 600;">${p.title}</td>
          <td style="padding: 12px 10px; font-family: monospace; color: #64748b;">${p._id}</td>
          <td style="padding: 12px 10px; color: #ef4444; font-weight: bold; font-family: monospace;">${p.stock} units left</td>
        </tr>
      `
        )
        .join('');

      const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <h2 style="color: #ef4444; margin-top: 0; font-size: 20px; border-bottom: 2px solid #fee2e2; pb: 10px;">⚠️ Low Inventory Stock Warning</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">The following catalog items are running low on inventory (5 units or less). Please reorder these items as soon as possible to prevent supply shortages:</p>
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; margin-top: 20px;">
            <thead>
              <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #475569; font-weight: bold;">
                <th style="padding: 10px;">Product Name</th>
                <th style="padding: 10px;">Product SKU/ID</th>
                <th style="padding: 10px;">Current Stock</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <p style="margin-top: 30px; font-size: 11px; color: #94a3b8; text-align: center;">This is an automated warning dispatched by the ShopSphere Inventory Manager.</p>
        </div>
      `;

      await sendEmail({
        email: process.env.ADMIN_EMAIL || 'admin@shopsphere.com',
        subject: '⚠️ Alert: Low Stock Product Inventory Warning',
        html,
      });
    } else {
      console.log('✅ Inventory levels check complete: All catalog items healthy.');
    }
  } catch (error) {
    console.error('⚠️ Low stock inventory check failed:', error.message);
  }
};

/**
 * Initialize node-cron jobs
 */
const startCronJobs = () => {
  console.log('⏰ Scheduling background cron jobs...');

  // Run daily at midnight (0 0 * * *)
  cron.schedule('0 0 * * *', async () => {
    await scanInventoryAndWarn();
  });
};

module.exports = {
  startCronJobs,
  scanInventoryAndWarn,
};
