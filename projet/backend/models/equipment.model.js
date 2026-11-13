const { DataTypes } = require('sequelize')
const db = require('../utils/db')

// Equipment model - defines the "equipments" table in the database
const Equipment = db.define("equipments", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Equipment name cannot be empty' }
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: { args: [0], msg: 'Quantity cannot be negative' }
        }
    },
    status: {
        type: DataTypes.ENUM('available', 'in_use', 'maintenance'),
        defaultValue: 'available',
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'equipments'
})

module.exports = Equipment
