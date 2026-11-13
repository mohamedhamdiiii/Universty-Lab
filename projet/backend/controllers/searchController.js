const { Op } = require('sequelize');
const Equipment = require('../models/Equipment');
const Reservation = require('../models/Reservation');
const User = require('../models/User');

// @desc    Search equipment with filters, sorting, pagination
// @route   GET /api/search/equipment
// @access  Public
const searchEquipment = async (req, res) => {
  try {
    const {
      q,
      category,
      available,
      minQuantity,
      sortBy = 'name',
      sortOrder = 'ASC',
      page = 1,
      limit = 10
    } = req.query;

    // --- Build dynamic WHERE clause ---
    const where = {};

    // Free-text search across name, description, category
    if (q) {
      where[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } },
        { category: { [Op.like]: `%${q}%` } }
      ];
    }

    // Exact category filter
    if (category) {
      where.category = category;
    }

    // Availability filter
    if (available !== undefined) {
      where.available = available === 'true';
    }

    // Minimum quantity filter
    if (minQuantity) {
      where.quantity = { [Op.gte]: parseInt(minQuantity, 10) };
    }

    // --- Sorting ---
    const allowedSortFields = ['name', 'category', 'quantity', 'createdAt'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const safeSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    // --- Pagination ---
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (parsedPage - 1) * parsedLimit;

    // --- Query ---
    const { count, rows } = await Equipment.findAndCountAll({
      where,
      order: [[safeSortBy, safeSortOrder]],
      limit: parsedLimit,
      offset
    });

    return res.json({
      data: rows,
      pagination: {
        total: count,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(count / parsedLimit)
      }
    });
  } catch (error) {
    console.error('searchEquipment error:', error);
    return res.status(500).json({ message: 'Server error while searching equipment' });
  }
};

// @desc    Search reservations with filters, sorting, pagination
// @route   GET /api/search/reservations
// @access  Private
const searchReservations = async (req, res) => {
  try {
    const {
      status,
      equipmentId,
      userId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = 1,
      limit = 10
    } = req.query;

    // --- Build dynamic WHERE clause ---
    const where = {};

    // Non-admin users can only see their own reservations
    if (req.user.role !== 'admin') {
      where.userId = req.user.id;
    } else if (userId) {
      where.userId = parseInt(userId, 10);
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Equipment filter
    if (equipmentId) {
      where.equipmentId = parseInt(equipmentId, 10);
    }

    // Date range filters
    if (startDate) {
      where.startDate = { ...(where.startDate || {}), [Op.gte]: startDate };
    }
    if (endDate) {
      where.endDate = { ...(where.endDate || {}), [Op.lte]: endDate };
    }

    // --- Sorting ---
    const allowedSortFields = ['startDate', 'endDate', 'status', 'createdAt'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const safeSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    // --- Pagination ---
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (parsedPage - 1) * parsedLimit;

    // --- Query ---
    const { count, rows } = await Reservation.findAndCountAll({
      where,
      include: [
        { model: Equipment, as: 'equipment' },
        { model: User, as: 'user', attributes: { exclude: ['password'] } }
      ],
      order: [[safeSortBy, safeSortOrder]],
      limit: parsedLimit,
      offset
    });

    return res.json({
      data: rows,
      pagination: {
        total: count,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(count / parsedLimit)
      }
    });
  } catch (error) {
    console.error('searchReservations error:', error);
    return res.status(500).json({ message: 'Server error while searching reservations' });
  }
};

// @desc    Get calendar events for a given month
// @route   GET /api/search/calendar
// @access  Private
const getCalendarEvents = async (req, res) => {
  try {
    const { month, year, equipmentId } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: 'month and year query parameters are required' });
    }

    const parsedMonth = parseInt(month, 10);
    const parsedYear = parseInt(year, 10);

    // Calculate first and last day of the month
    const monthStart = new Date(parsedYear, parsedMonth - 1, 1);
    const monthEnd = new Date(parsedYear, parsedMonth, 0); // last day of month

    const startStr = monthStart.toISOString().split('T')[0];
    const endStr = monthEnd.toISOString().split('T')[0];

    // --- Build WHERE clause ---
    // Reservations that overlap with the given month:
    //   startDate <= monthEnd AND endDate >= monthStart
    const where = {
      status: { [Op.in]: ['approved', 'pending'] },
      startDate: { [Op.lte]: endStr },
      endDate: { [Op.gte]: startStr }
    };

    // Non-admin users can only see their own reservations
    if (req.user.role !== 'admin') {
      where.userId = req.user.id;
    }

    // Optional equipment filter
    if (equipmentId) {
      where.equipmentId = parseInt(equipmentId, 10);
    }

    const reservations = await Reservation.findAll({
      where,
      include: [
        { model: Equipment, as: 'equipment', attributes: ['name'] }
      ]
    });

    // Format as calendar events
    const events = reservations.map(r => ({
      id: r.id,
      title: r.equipment ? r.equipment.name : `Reservation #${r.id}`,
      start: r.startDate,
      end: r.endDate,
      status: r.status,
      equipmentId: r.equipmentId,
      userId: r.userId
    }));

    return res.json(events);
  } catch (error) {
    console.error('getCalendarEvents error:', error);
    return res.status(500).json({ message: 'Server error while fetching calendar events' });
  }
};

module.exports = {
  searchEquipment,
  searchReservations,
  getCalendarEvents
};
