const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/')
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Admin Schema (matching your existing schema)
const AdminSchema = new mongoose.Schema({
    hospitalName: String,
    ownerName: String,
    email: String,
    password: String,
    address: String,
    phone: String,
    timings: String,
    closedOn: String,
    logo: String,
    specialties: [String],
    numberOfBeds: Number
});

const AdminScheme = mongoose.model('Admin', AdminSchema);

async function createDefaultAdmin() {
    try {
        // Check if admin already exists
        const existingAdmin = await AdminScheme.findOne({ email: 'admin@gmail.com' });
        
        if (existingAdmin) {
            console.log('✅ Admin account already exists!');
            console.log('📋 Admin Details:');
            console.log('   ID:', existingAdmin._id);
            console.log('   Email: admin@gmail.com');
            console.log('   Password: admin@1233');
            process.exit(0);
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash('admin@1233', 10);

        // Create admin
        const admin = new AdminScheme({
            hospitalName: 'MediVault Hospital',
            ownerName: 'Admin User',
            email: 'admin@gmail.com',
            password: hashedPassword,
            address: '123 Healthcare Ave',
            phone: '1234567890',
            timings: '9:00 AM - 6:00 PM',
            closedOn: 'Sunday',
            logo: '',
            specialties: ['General Medicine', 'Emergency Care'],
            numberOfBeds: 100
        });

        const savedAdmin = await admin.save();
        console.log('🎉 Default admin account created successfully!');
        console.log('📋 Login Credentials:');
        console.log('   Email: admin@gmail.com');
        console.log('   Password: admin@1233');
        console.log('   Admin ID:', savedAdmin._id);
        console.log('   URL: http://localhost:3002');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
        process.exit(1);
    }
}

createDefaultAdmin();