const express = require('express')
const router = express.Router()
const usercontroller = require('../controllers/user.controller')
const authGuard = require('../middlewares/guard')

// --- Public routes (no auth required) ---
router.post('/register', usercontroller.register)
router.post('/login', usercontroller.login)

// --- Protected routes (auth guard required) ---
router.get('/findall', authGuard, usercontroller.findall)
router.get('/:id', authGuard, usercontroller.findone)
router.put('/:id', authGuard, usercontroller.updateuser)
router.delete('/:id', authGuard, usercontroller.deleteuser)

module.exports = router
