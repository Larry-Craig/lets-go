const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Use environment variable

// User Registration
router.post('/signup', [
    body('email').isEmail(),
    body('username').notEmpty(),
    body('password').isLength({ min: 5 }),
], async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, age, dob, email, phone, location, username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = 'INSERT INTO users (name, age, dob, email, phone, location, username, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [name, age, dob, email, phone, location, username, hashedPassword], (err) => {
        if (err) {
            return res.status(500).send('Error registering user: ' + err.message);
        }
        res.status(201).send('User registered successfully!');
    });
});

// User Login
router.post('/login', async(req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], async(err, results) => {
        if (err || results.length === 0) {
            return res.status(401).send('Invalid username or password');
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send('Invalid username or password');
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user });
    });
});

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(403);

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.sendStatus(403);
        req.userId = decoded.id;
        next();
    });
};

// Update User Profile
router.put('/profile', verifyToken, async(req, res) => {
    const { name, age, dob, email, phone, location } = req.body;
    const query = 'UPDATE users SET name = ?, age = ?, dob = ?, email = ?, phone = ?, location = ? WHERE id = ?';

    db.query(query, [name, age, dob, email, phone, location, req.userId], (err) => {
        if (err) {
            return res.status(500).send('Error updating profile: ' + err.message);
        }
        res.send('Profile updated successfully!');
    });
});

// Request Password Reset
router.post('/forgot-password', (req, res) => {
    const { email } = req.body;
    const token = crypto.randomBytes(20).toString('hex');

    const query = 'UPDATE users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE email = ?';
    db.query(query, [token, Date.now() + 3600000, email], (err) => {
        if (err) {
            return res.status(500).send('Error requesting password reset: ' + err.message);
        }

        // Send email with Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'your_email@gmail.com',
                pass: 'your_email_password',
            },
        });

        const mailOptions = {
            to: email,
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
                `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
                `http://localhost:5000/reset-password/${token}\n\n` +
                `If you did not request this, please ignore this email.\n`,
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                return res.status(500).send('Error sending email: ' + error.message);
            }
            res.send('An email has been sent to ' + email + ' with further instructions.');
        });
    });
});

// Reset Password
router.post('/reset-password/:token', async(req, res) => {
    const { password } = req.body;
    const query = 'SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpires > ?';

    db.query(query, [req.params.token, Date.now()], async(err, results) => {
        if (err || results.length === 0) {
            return res.status(400).send('Password reset token is invalid or has expired.');
        }

        const user = results[0];
        const hashedPassword = await bcrypt.hash(password, 10);
        const updateQuery = 'UPDATE users SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE id = ?';

        db.query(updateQuery, [hashedPassword, user.id], (err) => {
            if (err) {
                return res.status(500).send('Error resetting password: ' + err.message);
            }
            res.send('Password has been reset successfully!');
        });
    });
});

module.exports = router;