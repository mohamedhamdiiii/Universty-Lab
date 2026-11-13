const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');
const {
  createReservation,
  createReservationValidation,
  getMyReservations,
  getAllReservations,
  getReservationById,
  updateReservationStatus,
  updateStatusValidation,
  cancelReservation,
  deleteReservation
} = require('../controllers/reservationController');

// POST /api/reservations - Create a new reservation (any authenticated user)
router.post('/', auth, createReservationValidation, createReservation);

// GET /api/reservations/my - Get current user's reservations (must be before /:id)
router.get('/my', auth, getMyReservations);

// GET /api/reservations - Get all reservations (admin only)
router.get('/', auth, authorize('admin'), getAllReservations);

// GET /api/reservations/:id - Get reservation by ID
router.get('/:id', auth, getReservationById);

// PUT /api/reservations/:id/status - Update reservation status (admin only)
router.put('/:id/status', auth, authorize('admin'), updateStatusValidation, updateReservationStatus);

// PUT /api/reservations/:id/cancel - Cancel reservation (owner only)
router.put('/:id/cancel', auth, cancelReservation);

// DELETE /api/reservations/:id - Delete reservation (admin only)
router.delete('/:id', auth, authorize('admin'), deleteReservation);

module.exports = router;
