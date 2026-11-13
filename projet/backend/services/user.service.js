const User = require('../models/user.model')
const { v4: uuidv4 } = require('uuid')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const SECRET_KEY = process.env.JWT_SECRET || 'dsi21_secret_key'
const SALT_ROUNDS = 10

const userService = {

    /**
     * Get all users (excluding passwords)
     */
    findAll: async () => {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }
        })
        return users
    },

    /**
     * Find a single user by ID (excluding password)
     */
    findById: async (id) => {
        const user = await User.findByPk(id, {
            attributes: { exclude: ['password'] }
        })
        if (!user) {
            throw { status: 404, message: 'User not found' }
        }
        return user
    },

    /**
     * Find a single user by username (including password for auth)
     */
    findByUsername: async (username) => {
        const user = await User.findOne({ where: { username } })
        return user
    },

    /**
     * Register a new user
     * @param {Object} data - { username, password, firstname, lastname, email? }
     * @returns {Object} created user (without password)
     */
    register: async ({ username, password, firstname, lastname, email }) => {
        // Validate required fields
        if (!username || !password || !firstname || !lastname) {
            throw { status: 400, message: 'All fields are required (username, password, firstname, lastname)' }
        }

        // Check if username already exists
        const existingUser = await User.findOne({ where: { username } })
        if (existingUser) {
            throw { status: 409, message: 'Username is already taken' }
        }

        // Check if email already exists (if provided)
        if (email) {
            const existingEmail = await User.findOne({ where: { email } })
            if (existingEmail) {
                throw { status: 409, message: 'Email is already in use' }
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

        // Create user
        const id = uuidv4()
        const user = await User.create({
            id,
            firstname,
            lastname,
            username,
            email: email || null,
            password: hashedPassword
        })

        // Return user without password
        return {
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            username: user.username,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        }
    },

    /**
     * Login a user
     * @param {string} username
     * @param {string} password
     * @returns {Object} { token, user }
     */
    login: async (username, password) => {
        // Validate
        if (!username || !password) {
            throw { status: 400, message: 'Username and password are required' }
        }

        // Find user
        const user = await User.findOne({ where: { username } })
        if (!user) {
            throw { status: 401, message: 'Invalid username or password' }
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            throw { status: 401, message: 'Invalid username or password' }
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            SECRET_KEY,
            { expiresIn: '1h' }
        )

        return {
            token,
            user: {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                username: user.username,
                email: user.email,
                role: user.role
            }
        }
    },

    /**
     * Update a user by ID
     * @param {string} id
     * @param {Object} data - fields to update
     * @returns {Object} updated user
     */
    updateUser: async (id, data) => {
        const user = await User.findByPk(id)
        if (!user) {
            throw { status: 404, message: 'User not found' }
        }

        // If password is being updated, hash it
        if (data.password) {
            data.password = await bcrypt.hash(data.password, SALT_ROUNDS)
        }

        await user.update(data)

        return {
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            username: user.username,
            email: user.email,
            role: user.role
        }
    },

    /**
     * Delete a user by ID
     * @param {string} id
     */
    deleteUser: async (id) => {
        const user = await User.findByPk(id)
        if (!user) {
            throw { status: 404, message: 'User not found' }
        }
        await user.destroy()
        return { message: 'User deleted successfully' }
    }
}

module.exports = userService
