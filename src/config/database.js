const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        await mongoose.connect(process.env.MONGODB_URI, options);
        console.log('MongoDB підключено успішно');

        mongoose.connection.on('error', err => {
            console.error('MongoDB помилка зʼєднання:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB відключено, спроба повторного підключення...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB повторно підключено');
        });

    } catch (error) {
        console.error('Помилка підключення до MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;