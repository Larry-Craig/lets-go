// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();
const JWT_SECRET = 'your_jwt_secret'; // Replace with a strong secret

// User Registration
router.post('/signup', async(req, res) => {
    const { name, age, dob, email, phone, location, username, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (name, age, dob, email, phone, location, username, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        db.query(query, [name, age, dob, email, phone, location, username, hashedPassword], (err) => {
            if (err) {
                return res.status(500).send('Error registering user: ' + err.message);
            }
            res.status(201).send('User registered successfully!');
        });
    } catch (err) {
        res.status(500).send('Error registering user: ' + err.message);
    }
});

// User Login
router.post('/login', (req, res) => {
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
        res.json({ token, user: { id: user.id, username: user.username } }); // Return user info without password
    });
});

// Protected Route: Get User Info
router.get('/userinfo', authenticateToken, (req, res) => {
    const query = 'SELECT name, age, dob, email, phone, location, username FROM users WHERE id = ?';
    db.query(query, [req.user.id], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).send('User not found');
        }
        res.json(results[0]); // Return user information
    });
});

module.exports = router;