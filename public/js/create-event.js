

// Create event form handler
const createEventForm = document.getElementById('create-event-form');
if (createEventForm) {
   createEventForm.addEventListener('submit', async (e) => {
       e.preventDefault();

       const token = localStorage.getItem('token'); // Get the token from local storage
       if (!token) {
           window.location.href = 'login.html'; // Redirect if not logged in
           return;
       }

       const title = document.getElementById('title').value;
       const description = document.getElementById('description').value;
       const date = document.getElementById('date').value;
       const time = document.getElementById('time').value; // Get time value
       const location = document.getElementById('location').value;

       // Combine date and time into a single datetime string
       const dateTime = `${date}T${time}`; // Format: YYYY-MM-DDTHH:MM

       try {
           const response = await fetch(`${API_URL}/events`, {
               method: 'POST',
               headers: { 
                   'Content-Type': 'application/json',
                   'Authorization': `Bearer ${token}` 
               },
               body: JSON.stringify({ title, description, date: dateTime, location })
           });

           const data = await response.json();

           if (response.ok) {
               document.getElementById('error-message').textContent = 'Event created successfully!';
               createEventForm.reset(); // Optionally clear the form
               setTimeout(() => {
                   window.location.href = 'index.html'; // Redirect after 2 seconds
               }, 2000);
           } else {
               document.getElementById('error-message').textContent = data.error || 'Failed to create event';
               if ([401].includes(response.status)) {  // Check for unauthorized status code
                   localStorage.removeItem('token'); // Clear token on unauthorized access
                   setTimeout(() => {
                       window.location.href = 'login.html'; // Redirect to login
                   }, 2000);
               }
           }
       } catch (error) {
           console.error('Error creating event:', error);
           document.getElementById('error-message').textContent = 'Network error';
       }
   });
}