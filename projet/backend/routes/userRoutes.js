const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');
const {
  register,
  registerValidation,
  login,
  loginValidation,
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  deleteUser,
  changePassword,
  changePasswordValidation
} = require('../controllers/userController');

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes (any authenticated user)
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/change-password', auth, changePasswordValidation, changePassword);

// Admin-only routes
router.get('/', auth, authorize('admin'), getAllUsers);
router.get('/:id', auth, authorize('admin'), getUserById);
router.delete('/:id', auth, authorize('admin'), deleteUser);

module.exports = router;
