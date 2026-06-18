const nodemailer = require('nodemailer');

/**
 * Send email helper
 * @param {Object} options - Email parameters
 * @param {string} options.email - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} [options.text] - Plain text content
 * @param {string} [options.html] - HTML formatted template
 */
const sendEmail = async (options) => {
  // Developer Fallback: If no SMTP details are set, log visually to server console.
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log('\n==================================================');
    console.log('✉️  SIMULATED EMAIL DISPATCH OUTBOX');
    console.log('--------------------------------------------------');
    console.log(`FROM: ShopSphere <noreply@shopsphere.com>`);
    console.log(`TO:   ${options.email}`);
    console.log(`SUBJ: ${options.subject}`);
    console.log('--------------------------------------------------');
    if (options.text) {
      console.log('TEXT BODY:\n', options.text);
    }
    if (options.html) {
      console.log('HTML BODY:\n', options.html.replace(/<[^>]*>/g, ' ').substring(0, 300) + '... [HTML truncated]');
    }
    console.log('==================================================\n');
    return { success: true, simulated: true };
  }

  // Real SMTP connection
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 2525,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `ShopSphere <${process.env.FROM_EMAIL || 'noreply@shopsphere.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email successfully dispatched: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`⚠️ Email dispatch failed:`, error.message);
    throw error;
  }
};

module.exports = sendEmail;
