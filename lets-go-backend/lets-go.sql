CREATE DATABASE lets_go;
USE lets_go;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    dob DATE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    location VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);
CREATE TABLE Rides (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    pickup_location VARCHAR(255) NOT NULL,
    dropoff_location VARCHAR(255) NOT NULL,
    ride_status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
INSERT INTO users (name, age, dob, email, phone, location, username, password) 
VALUES 
('John Doe', 30, '1993-01-15', 'john@example.com', '1234567890', 'New York', 'johndoe', 'hashedpassword1'),
('Jane Smith', 28, '1995-06-22', 'jane@example.com', '0987654321', 'Los Angeles', 'janesmith', 'hashedpassword2');