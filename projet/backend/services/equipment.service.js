const Equipment = require('../models/equipment.model')

const equipmentService = {

    // Get all equipment
    findAll: async () => {
        const equipments = await Equipment.findAll()
        return equipments
    },

    // Find one equipment by ID
    findById: async (id) => {
        const equipment = await Equipment.findByPk(id)
        if (!equipment) {
            throw { status: 404, message: 'Equipment not found' }
        }
        return equipment
    },

    // Create new equipment
    create: async (data) => {
        if (!data.name) {
            throw { status: 400, message: 'Equipment name is required' }
        }

        const equipment = await Equipment.create({
            name: data.name,
            description: data.description || null,
            category: data.category || null,
            quantity: data.quantity || 1,
            status: data.status || 'available',
            image: data.image || null
        })

        return equipment
    },

    // Update equipment by ID
    update: async (id, data) => {
        const equipment = await Equipment.findByPk(id)
        if (!equipment) {
            throw { status: 404, message: 'Equipment not found' }
        }

        await equipment.update(data)
        return equipment
    },

    // Delete equipment by ID
    delete: async (id) => {
        const equipment = await Equipment.findByPk(id)
        if (!equipment) {
            throw { status: 404, message: 'Equipment not found' }
        }

        await equipment.destroy()
        return { message: 'Equipment deleted successfully' }
    }
}

module.exports = equipmentService
