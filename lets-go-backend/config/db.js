// config/db.js
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: ' 127.0.0.1.', // Your database host
    user: 'root', // Your MySQL username
    password: 'cheboy2005', // Your MySQL password
    database: 'lets_go' // Your database name
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to the database as id ' + connection.threadId);
});

module.exports = connection;