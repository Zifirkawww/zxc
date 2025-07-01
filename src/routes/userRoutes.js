const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Публічні маршрути
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);

// Захищені маршрути (потребують авторизації)
router.get('/profile', protect, userController.getProfile);

module.exports = router;