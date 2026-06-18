/**
 * Formats monetary counts into INR standard currency format
 */
const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(val);
};

/**
 * Builds the HTML template for Order Placement / Invoice Receipt
 */
const getOrderReceiptTemplate = (order) => {
  const itemsRows = order.orderItems
    .map((item) => {
      const title = item.product?.title || 'Catalog Item';
      const quantity = item.quantity;
      const price = item.price;
      const total = price * quantity;
      return `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 12px 10px; color: #334155; font-weight: 500;">${title}</td>
        <td style="padding: 12px 10px; color: #475569; text-align: center;">${quantity}</td>
        <td style="padding: 12px 10px; color: #475569; text-align: right;">${formatCurrency(price)}</td>
        <td style="padding: 12px 10px; color: #0f172a; text-align: right; font-weight: bold;">${formatCurrency(total)}</td>
      </tr>
    `;
    })
    .join('');

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <!-- Logo/Header -->
      <div style="text-align: center; margin-bottom: 25px;">
        <div style="display: inline-block; padding: 8px 12px; background: linear-gradient(135deg, #6366f1, #4f46e5); color: #ffffff; border-radius: 8px; font-weight: bold; font-size: 18px;">S</div>
        <h2 style="color: #0f172a; margin: 10px 0 0 0; font-size: 20px;">Order Confirmation</h2>
        <p style="color: #64748b; font-size: 12px; margin: 5px 0 0 0;">Order ID: <span style="font-family: monospace; font-weight: bold;">${order._id}</span></p>
      </div>

      <p style="color: #334155; font-size: 14px; line-height: 1.6;">Thank you for shopping at <strong>ShopSphere</strong>! Your order has been successfully placed. Below is the invoice breakdown for your purchase.</p>

      <!-- Items Table -->
      <h3 style="color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 25px;">Order Summary</h3>
      <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 12px;">
        <thead>
          <tr style="background-color: #f8fafc; color: #475569; font-weight: bold;">
            <th style="padding: 10px;">Item</th>
            <th style="padding: 10px; text-align: center;">Qty</th>
            <th style="padding: 10px; text-align: right;">Unit Price</th>
            <th style="padding: 10px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <!-- Pricing Summary -->
      <div style="margin-top: 15px; background-color: #f8fafc; padding: 15px; border-radius: 12px; font-size: 12px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #475569;">
          <span>Subtotal</span>
          <span style="font-weight: 600; color: #334155;">${formatCurrency(order.totalPrice - order.taxPrice - order.shippingPrice)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #475569;">
          <span>Shipping Fee</span>
          <span style="font-weight: 600; color: #334155;">${order.shippingPrice === 0 ? 'FREE' : formatCurrency(order.shippingPrice)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #475569;">
          <span>GST (18%)</span>
          <span style="font-weight: 600; color: #334155;">${formatCurrency(order.taxPrice)}</span>
        </div>
        <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 8px 0;" />
        <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; color: #0f172a;">
          <span>Grand Total</span>
          <span style="color: #4f46e5;">${formatCurrency(order.totalPrice)}</span>
        </div>
      </div>

      <!-- Shipping Destination -->
      <h3 style="color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 25px;">Shipping Details</h3>
      <p style="color: #475569; font-size: 13px; line-height: 1.6; margin: 5px 0 0 0;">
        <strong>Recipient:</strong> ${order.user?.name || 'Customer'}<br />
        <strong>Address:</strong> ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}<br />
        <strong>Payment Method:</strong> ${order.paymentMethod === 'Card' ? 'Credit / Debit Card (Stripe)' : 'Cash on Delivery (COD)'}
      </p>

      <div style="margin-top: 35px; border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 11px; color: #94a3b8;">
        ShopSphere Inc. • Secure Shopping Guaranteed
      </div>
    </div>
  `;
};

/**
 * Builds the HTML template for Payment Settlement Confirmation
 */
const getPaymentReceiptTemplate = (order) => {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <!-- Logo/Header -->
      <div style="text-align: center; margin-bottom: 25px;">
        <div style="display: inline-block; padding: 8px 12px; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; border-radius: 8px; font-weight: bold; font-size: 18px;">S</div>
        <h2 style="color: #0f172a; margin: 10px 0 0 0; font-size: 20px;">Payment Received</h2>
        <p style="color: #64748b; font-size: 12px; margin: 5px 0 0 0;">Receipt for Order: <span style="font-family: monospace; font-weight: bold;">${order._id}</span></p>
      </div>

      <p style="color: #334155; font-size: 14px; line-height: 1.6;">Hello <strong>${order.user?.name || 'Customer'}</strong>,</p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6;">We have successfully received your payment for order <strong>#${order._id}</strong>. Your payment receipt is detailed below. Your order status is now **Processing** and will be shipped shortly.</p>

      <!-- Receipt summary box -->
      <div style="margin-top: 20px; background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 20px; border-radius: 12px; font-size: 13px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #065f46;">
          <span>Transaction status</span>
          <span style="font-weight: 700; text-transform: uppercase;">Success / Paid</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #374151;">
          <span>Transaction ID</span>
          <span style="font-weight: bold; font-family: monospace;">${order.paymentResult?.id || 'N/A'}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #374151;">
          <span>Settled On</span>
          <span style="font-weight: 600;">${new Date(order.paidAt).toLocaleString()}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #374151;">
          <span>Payment Gateway</span>
          <span style="font-weight: 600;">Stripe Gateway</span>
        </div>
        <hr style="border: 0; border-top: 1px solid #a7f3d0; margin: 10px 0;" />
        <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: bold; color: #065f46;">
          <span>Amount Settled</span>
          <span>${formatCurrency(order.totalPrice)}</span>
        </div>
      </div>

      <p style="color: #475569; font-size: 13px; margin-top: 25px; line-height: 1.5;">You can monitor the status of your delivery at any time inside your <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/orders" style="color: #10b981; font-weight: 600; text-decoration: none;">ShopSphere Orders History</a> panel.</p>

      <div style="margin-top: 35px; border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 11px; color: #94a3b8;">
        ShopSphere Inc. • Secure Shopping Guaranteed
      </div>
    </div>
  `;
};

module.exports = {
  getOrderReceiptTemplate,
  getPaymentReceiptTemplate,
};
