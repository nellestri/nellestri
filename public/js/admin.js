const API_URL = 'http://localhost:1234'; // Adjust based on your server configuration

// Function to check authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html'; // Redirect to login if not authenticated
    }
}

// Fetch admin data (users and events)
async function fetchAdminData() {
    try {
        const [usersResponse, eventsResponse] = await Promise.all([
            fetch(`${API_URL}/admin/users`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            }),
            fetch(`${API_URL}/events`)
        ]);

        if (!usersResponse.ok || !eventsResponse.ok) throw new Error("Failed to fetch data");

        const users = await usersResponse.json();
        const events = await eventsResponse.json();

        renderUsers(users);
        renderEvents(events);
        
    } catch (error) {
        console.error('Error fetching admin data:', error);
    }
}

// Render users in the admin panel
function renderUsers(users) {
    const usersList = document.getElementById('users-list');
    usersList.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.username}</td> <!-- Ensure this matches your database field -->
                        <td>${user.email}</td>
                    </tr>`).join('')}
            </tbody>
        </table>
    `;
}

// Render events in the admin panel
function renderEvents(events) {
    const eventsList = document.getElementById('events-list');
    eventsList.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${events.map(event => `
                    <tr>
                        <td>${event.title}</td>
                        <td>${new Date(event.date).toLocaleDateString()}</td>
                        <td>${event.location}</td>
                        <td><button onclick="deleteEvent(${event.id})">Delete</button></td> <!-- Assuming deleteEvent function is defined -->
                    </tr>`).join('')}
            </tbody>
        </table>
    `;
}

// Function to delete an event
async function deleteEvent(eventId) {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL}/events/${eventId}`, {
            method: 'DELETE',
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json' 
            }
        });

        if (response.ok) {
            alert('Event deleted successfully!');
            fetchAdminData(); // Refresh the event list
        } else {
            alert('Failed to delete event.');
        }
    } catch (error) {
        console.error('Error deleting event:', error);
    }
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    fetchAdminData();
});