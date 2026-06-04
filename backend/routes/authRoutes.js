const express = require('express');
const router = express.Router();
const {
  loginUser,
  getMe,
  updateProfile,
  registerUser,
  forgotPassword,
  resetPassword,
  qrLoginClockIn,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/qr-login-clock-in', qrLoginClockIn);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
