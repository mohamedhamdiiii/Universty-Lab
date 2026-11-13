const { DataTypes } = require('sequelize')
const db = require('../utils/db')

const User = db.define("users", {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    firstname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Firstname cannot be empty' },
            len: { args: [2, 50], msg: 'Firstname must be between 2 and 50 characters' }
        }
    },
    lastname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Lastname cannot be empty' },
            len: { args: [2, 50], msg: 'Lastname must be between 2 and 50 characters' }
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
            isEmail: { msg: 'Must be a valid email address' }
        }
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: { msg: 'Username cannot be empty' },
            len: { args: [3, 30], msg: 'Username must be between 3 and 30 characters' }
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Password cannot be empty' }
        }
    },
    role: {
        type: DataTypes.ENUM('user', 'admin'),
        defaultValue: 'user',
        allowNull: false
    }
}, {
    timestamps: true,    // adds createdAt and updatedAt
    tableName: 'users'
})

module.exports = User
