const Exercise = require('../models/exercise');

// Отримати всі результати вправ
exports.getAllExercises = async (req, res) => {
    try {
        const exercises = await Exercise.find();
        res.status(200).json(exercises);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Отримати результат по ID
exports.getExerciseById = async (req, res) => {
    try {
        const exercise = await Exercise.findById(req.params.id);
        if (!exercise) {
            return res.status(404).json({ message: 'Результат не знайдено' });
        }
        res.status(200).json(exercise);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Створити новий результат
exports.createExercise = async (req, res) => {
    try {
        const exercise = new Exercise(req.body);
        const savedExercise = await exercise.save();
        res.status(201).json(savedExercise);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Оновити результат
exports.updateExercise = async (req, res) => {
    try {
        const exercise = await Exercise.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!exercise) {
            return res.status(404).json({ message: 'Результат не знайдено' });
        }
        res.status(200).json(exercise);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Видалити результат
exports.deleteExercise = async (req, res) => {
    try {
        const exercise = await Exercise.findByIdAndDelete(req.params.id);
        if (!exercise) {
            return res.status(404).json({ message: 'Результат не знайдено' });
        }
        res.status(200).json({ message: 'Результат успішно видалено' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};