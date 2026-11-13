const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL Connected successfully');

    // Sync all models (creates tables if they don't exist)
    await sequelize.sync();
    console.log('Database tables synced');
  } catch (error) {
    console.error(`MySQL connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
