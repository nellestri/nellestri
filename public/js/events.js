


// Fetch user's events
async function fetchUserEvents() {
    const token = localStorage.getItem('token');

    if (!token) {
        alert('You need to log in to view your events.');
        return;
    }

    const decodedToken = jwt_decode(token); // Use jwt-decode to get user ID
    const userId = decodedToken.id;

    try {
        const response = await fetch(`${API_URL}/users/${userId}/events`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const events = await response.json();
            renderEvents(events);
        } else {
            alert('Failed to fetch events.');
        }
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

// Render user's events
function renderEvents(events) {
    const eventsList = document.getElementById('events-list');

    if (events.length === 0) {
        eventsList.innerHTML = '<p>No events found.</p>';
        return;
    }

    eventsList.innerHTML = `
        ${events.map(event => `
            <div class='event'>
                <h3>${event.title}</h3>
                <p>${event.description}</p>
                <p>Date: ${new Date(event.date).toLocaleDateString()}</p>
                <p>Location: ${event.location}</p>
                <button onclick="openEditModal(${event.id}, '${event.title}', '${event.description}', '${event.date}', '${event.location}')">Edit</button>
                <button onclick="deleteEvent(${event.id})">Delete</button>
            </div>`).join('')}
    `;
}

// Open edit modal with event data
function openEditModal(eventId, title, description, date, location) {
    document.getElementById('edit-title').value = title;
    document.getElementById('edit-description').value = description;
    document.getElementById('edit-date').value = date.split('T')[0]; // Format date for input
    document.getElementById('edit-location').value = location;
   

    const editEventForm = document.getElementById('edit-event-form');

    editEventForm.onsubmit = async (e) => {
        e.preventDefault();

        const updatedEventData = {
            title: document.getElementById('edit-title').value,
            description: document.getElementById('edit-description').value,
            date: document.getElementById('edit-date').value,
            location: document.getElementById('edit-location').value,
           
        };

        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${API_URL}/events/${eventId}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(updatedEventData)
            });

            if (response.ok) {
                alert('Event updated successfully!');
                fetchUserEvents(); // Refresh the list of events
                closeEditModal(); // Close modal after updating
            } else {
                alert('Failed to update event.');
            }
        } catch (error) {
            console.error('Error updating event:', error);
        }
    };

    document.getElementById('edit-event-modal').style.display = 'block'; // Show the modal
}

// Close edit modal
function closeEditModal() {
    document.getElementById('edit-event-modal').style.display = 'none';
}

// Delete an event
async function deleteEvent(eventId) {
    if (confirm('Are you sure you want to delete this event?')) {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${API_URL}/events/${eventId}`, {
                method: 'DELETE',
                headers: { 
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (response.ok) {
                alert('Event deleted successfully!');
                fetchUserEvents(); // Refresh the list of events
            } else {
                alert('Failed to delete event.');
            }
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    }
}



// Initialize fetching of user events on page load
document.addEventListener('DOMContentLoaded', fetchUserEvents);