const equipmentService = require('../services/equipment.service')

const equipmentController = {

    // GET /equipment - Get all equipment
    findAll: async (req, res) => {
        try {
            const equipments = await equipmentService.findAll()
            res.status(200).json(equipments)
        } catch (err) {
            console.log("Error in equipment findAll:", err.message)
            res.status(err.status || 500).json({ message: err.message || 'Error fetching equipment' })
        }
    },

    // GET /equipment/:id - Get one equipment by ID
    findOne: async (req, res) => {
        try {
            const equipment = await equipmentService.findById(req.params.id)
            res.status(200).json(equipment)
        } catch (err) {
            console.log("Error in equipment findOne:", err.message)
            res.status(err.status || 500).json({ message: err.message || 'Error fetching equipment' })
        }
    },

    // POST /equipment - Create new equipment (with image upload)
    create: async (req, res) => {
        try {
            // If a file was uploaded by multer, save its path
            const data = { ...req.body }
            if (req.file) {
                data.image = '/uploads/' + req.file.filename
            }

            const equipment = await equipmentService.create(data)
            res.status(201).json({ message: 'Equipment created successfully!', equipment })
        } catch (err) {
            console.log("Error in equipment create:", err.message)
            res.status(err.status || 500).json({ message: err.message || 'Error creating equipment' })
        }
    },

    // PUT /equipment/:id - Update equipment (with optional image upload)
    update: async (req, res) => {
        try {
            const data = { ...req.body }
            if (req.file) {
                data.image = '/uploads/' + req.file.filename
            }

            const equipment = await equipmentService.update(req.params.id, data)
            res.status(200).json({ message: 'Equipment updated successfully!', equipment })
        } catch (err) {
            console.log("Error in equipment update:", err.message)
            res.status(err.status || 500).json({ message: err.message || 'Error updating equipment' })
        }
    },

    // DELETE /equipment/:id - Delete equipment
    delete: async (req, res) => {
        try {
            const result = await equipmentService.delete(req.params.id)
            res.status(200).json(result)
        } catch (err) {
            console.log("Error in equipment delete:", err.message)
            res.status(err.status || 500).json({ message: err.message || 'Error deleting equipment' })
        }
    }
}

module.exports = equipmentController
