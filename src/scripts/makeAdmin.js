const mongoose = require('mongoose');
const User = require('../models/user');
require('dotenv').config();

async function makeUserAdmin(username) {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log(`Checking if user '${username}' exists...`);

        // Find the user
        const user = await User.findOne({ username });

        if (!user) {
            console.log(`User '${username}' not found. Creating new admin user...`);

            // Create a new admin user
            const newUser = await User.create({
                username,
                password: 'admin123', // Default password
                role: 'admin'
            });

            console.log(`Created new admin user '${username}' with default password 'admin123'`);
        } else {
            console.log(`User '${username}' found. Updating role to admin...`);

            // Update user role to admin
            user.role = 'admin';
            await user.save();

            console.log(`User '${username}' is now an administrator`);
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        // Close the connection
        await mongoose.disconnect();
        console.log('Database connection closed');
    }
}

// Execute the function with the username "cxz"
makeUserAdmin('cxz');
