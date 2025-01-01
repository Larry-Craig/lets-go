require('dotenv').config(); // Load environment variables
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./config/db'); // Database configuration
const errorHandler = require('./middleware/errorHandler'); // Error handling middleware
const rateLimit = require('express-rate-limit'); // Rate limiting middleware

const app = express();
const PORT = process.env.PORT || 5000; // Use environment variable for port

app.use(cors({ origin: 'http://localhost:3000' })); // Adjust for your frontend if applicable
app.use(bodyParser.json());

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Limit each IP to 100 requests per windowMs
});
app.use(limiter); // Apply rate limiting to all requests

// Routes
app.use('/api/auth', require('./routes/auth')); // Use authentication routes

// Error handling middleware
app.use(errorHandler); // Use error handling middleware

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});