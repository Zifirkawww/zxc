const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');
const { protect, restrictTo } = require('../middleware/auth');

// Публічні маршрути
router.get('/', protect, exerciseController.getAllExercises);
router.get('/:id', protect, exerciseController.getExerciseById);

// Маршрути тільки для адміністраторів
router.post('/', protect, restrictTo('admin'), exerciseController.createExercise);
router.put('/:id', protect, restrictTo('admin'), exerciseController.updateExercise);
router.delete('/:id', protect, restrictTo('admin'), exerciseController.deleteExercise);

module.exports = router;
