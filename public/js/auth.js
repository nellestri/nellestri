const API_URL = 'http://localhost:1234';

// Check authentication status
function checkAuth() {
    const token = localStorage.getItem('token');
    const createEventLink = document.getElementById('create-event-link');
    const adminLink = document.getElementById('admin-link');
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const logoutLink = document.getElementById('logout-link');

    if (token) {
        if (createEventLink) createEventLink.style.display = 'inline';
        if (adminLink) adminLink.style.display = 'inline';
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'inline';
    } else {
        if (createEventLink) createEventLink.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
        if (loginLink) loginLink.style.display = 'inline';
        if (registerLink) registerLink.style.display = 'inline';
        if (logoutLink) logoutLink.style.display = 'none';
    }
}

// Function to handle API requests
async function apiRequest(url, method, body) {
    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        return await response.json().then(data => ({ ok: response.ok, data }));
    } catch (error) {
        console.error('API request failed:', error);
        return { ok: false, error: 'Network error' };
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    updateNavLinks();
    window.location.href = 'login.html';
}

// Update navigation links based on authentication status
function updateNavLinks() {
    const token = localStorage.getItem('token');
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const logoutLink = document.getElementById('logout-link');

    if (token) {
        loginLink.classList.add('hidden');
        registerLink.classList.add('hidden');
        logoutLink.classList.remove('hidden');
    } else {
        loginLink.classList.remove('hidden');
        registerLink.classList.remove('hidden');
        logoutLink.classList.add('hidden');
    }
}

// Initialize event listeners on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication status
    checkAuth();

    // Attach event listener for logout link
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    // Login form handler
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token); // Store JWT token
                alert('Login successful!');
                window.location.href = 'index.html'; // Redirect to events page
            } else {
                const errorMessage = await response.text();
                document.getElementById('error-message').textContent = errorMessage;
            }
        });
    }

    // Register form handler
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            if (response.ok) {
                alert('Registration successful!');
                window.location.href = 'login.html'; // Redirect to login page
            } else {
                const errorMessage = await response.text();
                document.getElementById('error-message').textContent = errorMessage;
            }
        });
    }
});