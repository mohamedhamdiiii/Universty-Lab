const jwt = require('jsonwebtoken')

const SECRET_KEY = process.env.JWT_SECRET || 'dsi21_secret_key'

/**
 * Interceptor Middleware
 * - Logs incoming requests (method, URL, timestamp)
 * - Parses JSON body automatically
 * - Refreshes the JWT token if it's about to expire (less than 15 min remaining)
 *   and attaches the new token in the response header 'X-Refreshed-Token'
 */
const interceptor = (req, res, next) => {
    // --- Request Logging ---
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`)

    // --- Token Refresh Logic ---
    let token = null

    const authHeader = req.headers['authorization']
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1]
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, SECRET_KEY)
            const now = Math.floor(Date.now() / 1000)
            const timeLeft = decoded.exp - now

            // If less than 15 minutes remaining, issue a refreshed token
            if (timeLeft > 0 && timeLeft < 15 * 60) {
                const newToken = jwt.sign(
                    { id: decoded.id, username: decoded.username },
                    SECRET_KEY,
                    { expiresIn: '1h' }
                )
                res.setHeader('X-Refreshed-Token', newToken)
                console.log(`[${timestamp}] Token refreshed for user: ${decoded.username}`)
            }
        } catch (err) {
            // Token is invalid or expired — don't block, let the guard handle it
        }
    }

    // --- Response Logging ---
    const originalSend = res.send.bind(res)
    res.send = function (body) {
        console.log(`[${timestamp}] Response ${res.statusCode} for ${req.method} ${req.originalUrl}`)
        return originalSend(body)
    }

    next()
}

module.exports = interceptor
