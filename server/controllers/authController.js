const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      throw new Error('User with this email already exists');
    }

    // Create user
    const user = await User.create({ name, email, password });

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user & return JWT
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    // Find user and explicitly select password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/auth/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Update allowed fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.avatar = req.body.avatar || user.avatar;

    if (req.body.addresses) {
      user.addresses = req.body.addresses;
    }

    // If password is being updated
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        addresses: updatedUser.addresses,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot password — generates a reset token
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404);
      throw new Error('No user found with that email');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set expiry on user document
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    // In production, send email with resetToken here
    // For now, return the token in the response (development only)
    res.status(200).json({
      success: true,
      message: 'Password reset token generated',
      ...(process.env.NODE_ENV === 'development' && { resetToken }),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password using token
 * @route   PUT /api/v1/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    // Hash the token from URL params
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // Find user by hashed token and check expiry
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired reset token');
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    // Generate new auth token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register as a Vendor
 * @route   POST /api/v1/auth/vendor-register
 * @access  Private
 */
const registerVendor = async (req, res, next) => {
  try {
    const { storeName, storeDescription, phone, logo } = req.body;

    if (!storeName || !phone) {
      res.status(400);
      throw new Error('Please provide store name and phone contact');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.role = 'vendor';
    user.vendorProfile = {
      storeName,
      storeDescription,
      phone,
      logo: logo || '',
      isApproved: false, // requires admin approval
      commissionRate: 0.10, // 10% standard platform commission split
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Vendor application submitted. Awaiting administrator approval.',
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve or reject vendor application (Admin only)
 * @route   PUT /api/v1/auth/vendor-approve/:id
 * @access  Private/Admin
 */
const approveVendor = async (req, res, next) => {
  try {
    const { isApproved } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user.role !== 'vendor') {
      res.status(400);
      throw new Error('User is not a vendor');
    }

    user.vendorProfile.isApproved = isApproved;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Vendor application ${isApproved ? 'approved' : 'suspended'}.`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all vendors (Admin only)
 * @route   GET /api/v1/auth/vendors
 * @access  Private/Admin
 */
const getVendors = async (req, res, next) => {
  try {
    const vendors = await User.find({ role: 'vendor' });

    res.status(200).json({
      success: true,
      count: vendors.length,
      vendors,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  registerVendor,
  approveVendor,
  getVendors,
};
