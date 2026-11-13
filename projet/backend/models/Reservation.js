const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');
const Equipment = require('./Equipment');

const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  equipmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'equipments',
      key: 'id'
    }
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'returned', 'cancelled'),
    defaultValue: 'pending'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: { args: [1], msg: 'Quantity must be at least 1' }
    }
  }
}, {
  tableName: 'reservations',
  timestamps: true,
  validate: {
    startBeforeEnd() {
      if (this.startDate && this.endDate && this.startDate >= this.endDate) {
        throw new Error('Start date must be before end date');
      }
    }
  }
});

// Set up associations
Reservation.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Reservation.belongsTo(Equipment, { foreignKey: 'equipmentId', as: 'equipment' });
User.hasMany(Reservation, { foreignKey: 'userId', as: 'reservations' });
Equipment.hasMany(Reservation, { foreignKey: 'equipmentId', as: 'reservations' });

module.exports = Reservation;
