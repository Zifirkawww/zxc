const User = require('../models/user');
const { generateToken } = require('../middleware/auth');

// Реєстрація нового користувача
exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Перевірка чи користувач вже існує
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'Користувач з таким іменем вже існує' });
        }

        // Створення нового користувача
        const user = await User.create({
            username,
            password
        });

        // Генерація токена
        const token = generateToken(user._id);

        // Відправка відповіді з токеном
        res.status(201).json({
            _id: user._id,
            username: user.username,
            role: user.role,
            token
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Авторизація користувача
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Пошук користувача
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Невірне ім\'я користувача або пароль' });
        }

        // Перевірка пароля
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Невірне ім\'я користувача або пароль' });
        }

        // Генерація токена
        const token = generateToken(user._id);

        // Встановлення cookie з токеном
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 днів
            secure: process.env.NODE_ENV === 'production'
        });

        // Відправка відповіді
        res.status(200).json({
            _id: user._id,
            username: user.username,
            role: user.role,
            token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Вихід користувача
exports.logout = (req, res) => {
    // Очищення cookie
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    
    res.status(200).json({ message: 'Вихід успішний' });
};

// Отримання профілю поточного користувача
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Створення адміністратора (тільки для першого запуску)
exports.createAdmin = async () => {
    try {
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
            await User.create({
                username: 'admin',
                password: 'admin123',
                role: 'admin'
            });
            console.log('Адміністратор створений успішно');
        }
    } catch (error) {
        console.error('Помилка створення адміністратора:', error);
    }
};