const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Секретний ключ для JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware для перевірки аутентифікації
exports.protect = async (req, res, next) => {
    let token;

    // Перевірка наявності токена в заголовках
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
        // Або перевірка наявності токена в cookies
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({ message: 'Необхідна авторизація' });
    }

    try {
        // Верифікація токена
        const decoded = jwt.verify(token, JWT_SECRET);

        // Пошук користувача за ID з токена
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'Користувача не знайдено' });
        }

        // Додавання користувача до об'єкту запиту
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Недійсний токен авторизації' });
    }
};

// Middleware для перевірки ролі
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: 'У вас немає прав для виконання цієї дії' 
            });
        }
        next();
    };
};

// Функція для генерації JWT токена
exports.generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: '30d'
    });
};