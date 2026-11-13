const jwt = require('jsonwebtoken')

const SECRET_KEY = process.env.JWT_SECRET || 'dsi21_secret_key'

/**
 * Auth Guard Middleware
 * Verifies the JWT token from the Authorization header or cookies.
 * If valid, attaches the decoded user info to req.user and proceeds.
 * If invalid or missing, returns 401 Unauthorized.
 */
const authGuard = (req, res, next) => {
    try {
        // Check Authorization header first, then cookies
        let token = null

        const authHeader = req.headers['authorization']
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1]
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token
        }

        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' })
        }

        // Verify the token
        const decoded = jwt.verify(token, SECRET_KEY)
        req.user = decoded // Attach user info to request
        next()
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired. Please login again.' })
        }
        return res.status(401).json({ message: 'Invalid token.' })
    }
}

module.exports = authGuard
