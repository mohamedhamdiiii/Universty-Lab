const { Op } = require('sequelize');
const { body, param, query, validationResult } = require('express-validator');
const Reservation = require('../models/Reservation');
const Equipment = require('../models/Equipment');
const User = require('../models/User');

// Validation rules
const createReservationValidation = [
  body('equipmentId').isInt({ min: 1 }).withMessage('Valid equipment ID is required'),
  body('startDate').isDate().withMessage('Valid start date is required'),
  body('endDate').isDate().withMessage('Valid end date is required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('notes').optional().isString()
];

const updateStatusValidation = [
  body('status').isIn(['approved', 'rejected', 'returned']).withMessage('Status must be approved, rejected, or returned')
];

// @desc    Create a new reservation
// @route   POST /api/reservations
// @access  Private
const createReservation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    const { equipmentId, startDate, endDate, notes, quantity = 1 } = req.body;

    // Validate dates
    if (startDate >= endDate) {
      return res.status(400).json({ message: 'Start date must be before end date' });
    }

    // Check equipment exists and is available
    const equipment = await Equipment.findByPk(equipmentId);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    if (!equipment.available) {
      return res.status(400).json({ message: 'Equipment is not available for booking' });
    }

    // Check requested quantity doesn't exceed equipment quantity
    if (quantity > equipment.quantity) {
      return res.status(400).json({
        message: `Requested quantity (${quantity}) exceeds available equipment quantity (${equipment.quantity})`
      });
    }

    // DOUBLE-BOOKING PREVENTION
    // Find all overlapping reservations (pending or approved) for the same equipment
    const overlappingReservations = await Reservation.findAll({
      where: {
        equipmentId,
        status: { [Op.in]: ['pending', 'approved'] },
        // Date overlap check: existing.startDate < requested.endDate AND existing.endDate > requested.startDate
        [Op.and]: [
          { startDate: { [Op.lt]: endDate } },
          { endDate: { [Op.gt]: startDate } }
        ]
      }
    });

    // Sum up the quantities of overlapping reservations
    const totalReservedQuantity = overlappingReservations.reduce(
      (sum, r) => sum + r.quantity, 0
    );

    if (totalReservedQuantity + quantity > equipment.quantity) {
      return res.status(409).json({
        message: 'Equipment is already booked for the selected dates. No available units remaining.',
        availableQuantity: Math.max(0, equipment.quantity - totalReservedQuantity)
      });
    }

    // Create reservation
    const reservation = await Reservation.create({
      userId: req.user.id,
      equipmentId,
      startDate,
      endDate,
      notes,
      quantity,
      status: 'pending'
    });

    // Return with equipment and user details
    const fullReservation = await Reservation.findByPk(reservation.id, {
      include: [
        { model: Equipment, as: 'equipment' },
        { model: User, as: 'user', attributes: { exclude: ['password'] } }
      ]
    });

    res.status(201).json(fullReservation);
  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(500).json({ message: 'Server error creating reservation' });
  }
};

// @desc    Get current user's reservations
// @route   GET /api/reservations/my
// @access  Private
const getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.findAll({
      where: { userId: req.user.id },
      include: [
        { model: Equipment, as: 'equipment' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(reservations);
  } catch (error) {
    console.error('Get my reservations error:', error);
    res.status(500).json({ message: 'Server error fetching reservations' });
  }
};

// @desc    Get all reservations (admin)
// @route   GET /api/reservations
// @access  Admin
const getAllReservations = async (req, res) => {
  try {
    const { status, userId, equipmentId } = req.query;

    // Build dynamic where clause from query params
    const where = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (equipmentId) where.equipmentId = equipmentId;

    const reservations = await Reservation.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: Equipment, as: 'equipment' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(reservations);
  } catch (error) {
    console.error('Get all reservations error:', error);
    res.status(500).json({ message: 'Server error fetching reservations' });
  }
};

// @desc    Get reservation by ID
// @route   GET /api/reservations/:id
// @access  Private
const getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: Equipment, as: 'equipment' }
      ]
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Students can only see their own reservations
    if (req.user.role !== 'admin' && reservation.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(reservation);
  } catch (error) {
    console.error('Get reservation by ID error:', error);
    res.status(500).json({ message: 'Server error fetching reservation' });
  }
};

// @desc    Update reservation status (admin)
// @route   PUT /api/reservations/:id/status
// @access  Admin
const updateReservationStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    const reservation = await Reservation.findByPk(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    const { status } = req.body;

    // Validate status transitions
    const validTransitions = {
      pending: ['approved', 'rejected'],
      approved: ['returned', 'rejected'],
      rejected: [],
      returned: [],
      cancelled: []
    };

    if (!validTransitions[reservation.status]?.includes(status)) {
      return res.status(400).json({
        message: `Cannot transition from '${reservation.status}' to '${status}'`
      });
    }

    reservation.status = status;
    await reservation.save();

    const updatedReservation = await Reservation.findByPk(reservation.id, {
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: Equipment, as: 'equipment' }
      ]
    });

    res.json(updatedReservation);
  } catch (error) {
    console.error('Update reservation status error:', error);
    res.status(500).json({ message: 'Server error updating reservation status' });
  }
};

// @desc    Cancel reservation
// @route   PUT /api/reservations/:id/cancel
// @access  Private
const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Users can only cancel their own reservations
    if (reservation.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only cancel your own reservations' });
    }

    // Can only cancel pending or approved reservations
    if (!['pending', 'approved'].includes(reservation.status)) {
      return res.status(400).json({
        message: `Cannot cancel a reservation with status '${reservation.status}'`
      });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    const updatedReservation = await Reservation.findByPk(reservation.id, {
      include: [
        { model: Equipment, as: 'equipment' }
      ]
    });

    res.json(updatedReservation);
  } catch (error) {
    console.error('Cancel reservation error:', error);
    res.status(500).json({ message: 'Server error cancelling reservation' });
  }
};

// @desc    Delete reservation (admin)
// @route   DELETE /api/reservations/:id
// @access  Admin
const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    await reservation.destroy();

    res.json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    console.error('Delete reservation error:', error);
    res.status(500).json({ message: 'Server error deleting reservation' });
  }
};

module.exports = {
  createReservation,
  createReservationValidation,
  getMyReservations,
  getAllReservations,
  getReservationById,
  updateReservationStatus,
  updateStatusValidation,
  cancelReservation,
  deleteReservation
};
