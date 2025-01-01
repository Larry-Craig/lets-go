// API URL for your backend
const API_URL = 'http://localhost:5000/api/auth'; // Update as necessary

// Function to show notifications
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.innerText = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000); // Hide after 3 seconds
}

// Handle Sign Up
document.getElementById('signupForm') ? .addEventListener('submit', async(e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.text();
        showNotification(result);
        if (response.ok) {
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

// Handle Login
document.getElementById('loginForm') ? .addEventListener('submit', async(e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        showNotification(result.message || result);
        if (response.ok) {
            localStorage.setItem('token', result.token);
            window.location.href = 'profile.html';
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

// Handle Profile Update
document.getElementById('profileForm') ? .addEventListener('submit', async(e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(data)
        });
        const result = await response.text();
        showNotification(result);
    } catch (error) {
        console.error('Error:', error);
    }
});

// Handle Password Reset Request
document.getElementById('resetPasswordForm') ? .addEventListener('submit', async(e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch(`${API_URL}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.text();
        showNotification(result);
    } catch (error) {
        console.error('Error:', error);
    }
});

// Real-time validation for Login
document.getElementById('loginForm') ? .addEventListener('input', (e) => {
    const username = e.target.username.value;
    const password = e.target.password.value;

    if (username.length < 3) {
        showNotification('Username must be at least 3 characters long.');
    } else if (password.length < 6) {
        showNotification('Password must be at least 6 characters long.');
    }
});