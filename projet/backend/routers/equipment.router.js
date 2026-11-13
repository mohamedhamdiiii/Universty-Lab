const express = require('express')
const router = express.Router()
const equipmentController = require('../controllers/equipment.controller')
const upload = require('../middlewares/upload')

// GET /equipment - Get all equipment
router.get('/', equipmentController.findAll)

// GET /equipment/:id - Get one equipment by ID
router.get('/:id', equipmentController.findOne)

// POST /equipment - Create equipment (with image upload)
// upload.single('image') means we expect one file with the field name "image"
router.post('/', upload.single('image'), equipmentController.create)

// PUT /equipment/:id - Update equipment (with optional image upload)
router.put('/:id', upload.single('image'), equipmentController.update)

// DELETE /equipment/:id - Delete equipment
router.delete('/:id', equipmentController.delete)

module.exports = router
