const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  searchEquipment,
  searchReservations,
  getCalendarEvents
} = require('../controllers/searchController');

// Public — no auth needed
router.get('/equipment', searchEquipment);

// Protected — requires authentication
router.get('/reservations', auth, searchReservations);
router.get('/calendar', auth, getCalendarEvents);

module.exports = router;
