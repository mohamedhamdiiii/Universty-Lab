const express = require('express')
const cors = require('cors')
const path = require('path')
const app = express()
const PORT = 3000
const db = require('./utils/db')
const User = require('./models/user.model')
const Equipment = require('./models/equipment.model')
const cookieParser = require('cookie-parser')
const interceptor = require('./middlewares/interceptor')

// --- Middlewares ---
app.use(cors({
    origin: 'http://localhost:4200', // Angular frontend
    credentials: true,               // Allow cookies to be sent
    exposedHeaders: ['X-Refreshed-Token'] // Allow frontend to read refreshed token header
}))
app.use(express.json()) // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })) // Parse URL-encoded bodies
app.use(cookieParser())
app.use(interceptor) // Logging + token refresh interceptor

// --- Serve uploaded images as static files ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// --- Routes ---
app.use('/user', require('./routers/user.router'))
app.use('/equipment', require('./routers/equipment.router'))

// --- Database connection and table sync ---
async function startup() {
    try {
        await db.authenticate()
        console.log("Database connected!")

        await User.sync({ alter: true }) // alter: true updates table columns to match the model
        console.log("Table 'users' synced!")

        await Equipment.sync({ alter: true })
        console.log("Table 'equipments' synced!")
    } catch (err) {
        console.log("Startup error:", err.message)
    }
}

startup()

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
