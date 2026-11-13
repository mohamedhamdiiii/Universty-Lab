const userService = require('../services/user.service')

const usercontroller = {

    /**
     * GET /user/findall
     * Returns all users
     */
    findall: async (req, res) => {
        try {
            const users = await userService.findAll()
            res.status(200).json(users)
        } catch (err) {
            console.log("Error in findall:", err.message)
            res.status(err.status || 500).json({ message: err.message || 'Error fetching users' })
        }
    },

    /**
     * GET /user/:id
     * Returns a single user by ID
     */
    findone: async (req, res) => {
        try {
            const user = await userService.findById(req.params.id)
            res.status(200).json(user)
        } catch (err) {
            console.log("Error in findone:", err.message)
            res.status(err.status || 500).json({ message: err.message || 'Error fetching user' })
        }
    },

    /**
     * POST /user/register
     * Body: { username, password, firstname, lastname, email? }
     */
    register: async (req, res) => {
        try {
            const user = await userService.register(req.body)
            res.status(201).json({ message: 'User registered successfully!', user })
        } catch (err) {
            console.log('Error in register:', err.message)
            res.status(err.status || 500).json({ message: err.message || 'Error during registration' })
        }
    },

    /**
     * POST /user/login
     * Body: { username, password }
     */
    login: async (req, res) => {
        try {
            const { username, password } = req.body
            const result = await userService.login(username, password)

            // Set token in cookie
            res.cookie('token', result.token, {
                httpOnly: true,
                maxAge: 3600000 // 1 hour
            })

            res.status(200).json({
                message: 'Login successful!',
                token: result.token,
                user: result.user
            })
        } catch (err) {
            console.log('Error in login:', err.message)
            res.status(err.status || 500).json({ message: err.message || 'Error during login' })
        }
    },

    /**
     * PUT /user/:id
     * Body: fields to update
     */
    updateuser: async (req, res) => {
        try {
            const user = await userService.updateUser(req.params.id, req.body)
            res.status(200).json({ message: 'User updated successfully!', user })
        } catch (err) {
            console.log('Error in updateuser:', err.message)
            res.status(err.status || 500).json({ message: err.message || 'Error updating user' })
        }
    },

    /**
     * DELETE /user/:id
     */
    deleteuser: async (req, res) => {
        try {
            const result = await userService.deleteUser(req.params.id)
            res.status(200).json(result)
        } catch (err) {
            console.log('Error in deleteuser:', err.message)
            res.status(err.status || 500).json({ message: err.message || 'Error deleting user' })
        }
    }
}

module.exports = usercontroller
