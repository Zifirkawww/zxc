const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const exerciseRoutes = require('./routes/exerciseRoutes');
const userRoutes = require('./routes/userRoutes');
const { createAdmin } = require('./controllers/userController');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({ credentials: true, origin: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('public'));

// Connect to MongoDB
connectDB().then(() => {
    // Створення адміністратора при першому запуску
    createAdmin();
});

// Routes
app.use('/api/exercises', exerciseRoutes);
app.use('/api/users', userRoutes);

// Головна сторінка з формою авторизації
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: './public' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущено на порту ${PORT}`);
});
