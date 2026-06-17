const QRCode = require('qrcode');

/**
 * Generate a QR code data URI for a given product URL.
 * @param {string} productId - The product's MongoDB ObjectId
 * @param {string} baseUrl - The frontend base URL
 * @returns {Promise<string>} QR code as a data URI (PNG base64)
 */
const generateQR = async (productId, baseUrl) => {
  const productUrl = `${baseUrl}/product/${productId}`;
  try {
    const qrDataUri = await QRCode.toDataURL(productUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#1e293b',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
    return qrDataUri;
  } catch (error) {
    console.error('QR Code generation failed:', error.message);
    return '';
  }
};

module.exports = generateQR;
