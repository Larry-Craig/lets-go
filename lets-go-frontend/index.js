// index.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const users = []; // In-memory user storage for demonstration

app.use(cors());
app.use(bodyParser.json());

// Endpoint for user signup
app.post('/api/auth/signup', (req, res) => {
    const { name, age, dob, email, phone, location, username, password } = req.body;

    // Simple validation
    if (!name || !email || !password) {
        return res.status(400).send('All fields are required');
    }

    // Check if user already exists
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(400).send('User already exists');
    }

    // Create new user
    const newUser = { name, age, dob, email, phone, location, username, password }; // Consider hashing the password
    users.push(newUser);
    res.status(201).send('User registered successfully');
});

// Endpoint for user login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).send('Invalid credentials');
    }

    // Generate a token
    const token = jwt.sign({ username }, 'secretkey', { expiresIn: '1h' });
    res.json({ token });
});

// Endpoint for profile update
app.put('/api/auth/profile', (req, res) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(403).send('No token provided');
    }

    jwt.verify(token, 'secretkey', (err, decoded) => {
        if (err) {
            return res.status(500).send('Failed to authenticate token');
        }

        const { username } = decoded;
        const userIndex = users.findIndex(u => u.username === username);
        if (userIndex === -1) {
            return res.status(404).send('User not found');
        }

        // Update user data
        users[userIndex] = {...users[userIndex], ...req.body };
        res.send('Profile updated successfully');
    });
});

// Endpoint for password recovery (basic example)
app.post('/api/auth/forgot-password', (req, res) => {
    const { email } = req.body;
    const user = users.find(u => u.email === email);

    if (!user) {
        return res.status(404).send('User not found');
    }

    // Here you would normally send a reset link via email
    res.send('Password reset link sent (not implemented)');
});

// Add this root route
app.get('/', (req, res) => {
    res.send('Welcome to the API! Use /api/auth/signup or /api/auth/login.');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});