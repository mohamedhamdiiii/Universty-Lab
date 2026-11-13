const { Sequelize } = require("sequelize")


const db = new Sequelize({
    dialect: 'mysql',
    host: 'localhost',
    username: 'root',
    password: '',
    database: 'backenddsi21',
    
})



module.exports = db