const express = require('express');
const router = express.Router();
const Equipment = require('../models/Equipment');

// @desc    Get all equipment (with optional category filter)
// @route   GET /api/equipments
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, available } = req.query;
    const where = {};
    if (category) where.category = category;
    if (available !== undefined) where.available = available === 'true';

    const equipments = await Equipment.findAll({ where });
    res.json(equipments);
  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get equipment by ID
// @route   GET /api/equipments/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findByPk(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json(equipment);
  } catch (error) {
    console.error('Get equipment by id error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
