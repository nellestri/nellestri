// server.js
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 1234;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files from public directory

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// User registration
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const checkUser = 'SELECT * FROM users WHERE email = ?';
    db.query(checkUser, [email], async (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Error checking user existence' });
      }
      
      if (result.length > 0) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Hash password and create user
      const hashedPassword = await bcrypt.hash(password, 10);
      const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
      
      db.query(sql, [username, email, hashedPassword], (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Error registering user' });
        }
        res.status(201).json({ message: 'User registered successfully' });
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Error during login' });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = results[0];
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create event (protected route)
app.post('/events', authenticateToken, (req, res) => {
  const { title, description, date, location } = req.body; // Ensure you're getting the combined datetime
  const creator_id = req.user.id; // Get creator ID from JWT token

  // Validate input
  if (!title || !description || !date || !location) {
      return res.status(400).json({ error: 'All fields are required' });
  }

  const sql = `INSERT INTO events (title, description, date, location, creator_id) VALUES (?, ?, ?, ?, ?)`;
  db.query(sql, [title, description, date, location, creator_id], (err) => {
      if (err) {
          console.error('Database error:', err); // Log the error for debugging
          return res.status(500).json({ error: 'Error creating event' });
      }
      res.status(201).json({ message: 'Event created successfully' });
  });
});

// Get all events
app.get('/events', (req, res) => {
  const sql = `
    SELECT events.*, users.username as creator_name,
    COUNT(DISTINCT rsvps.userId) as rsvp_count
    FROM events
    LEFT JOIN users ON events.creator_id = users.id
    LEFT JOIN rsvps ON events.id = rsvps.eventId
    GROUP BY events.id
    ORDER BY events.date ASC`; //dislay the events by name of column
 

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Error retrieving events' });
    }
    res.json(results);
  });
});


// RSVP to event (protected route)
app.post('/events/:eventId/rsvp', authenticateToken, (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Check if RSVP already exists
    const checkSql = 'SELECT * FROM rsvps WHERE userId = ? AND eventId = ?';
    db.query(checkSql, [userId, eventId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Error checking RSVP' });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: 'Already RSVPed to this event' });
      }

      // Create new RSVP
      const insertSql = 'INSERT INTO rsvps (userId, eventId) VALUES (?, ?)';
      db.query(insertSql, [userId, eventId], (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Error creating RSVP' });
        }
        res.status(201).json({ message: 'RSVP successful' });
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Get user's events
app.get('/users/:userId/events', (req, res) => {
  const sql = `SELECT * FROM events WHERE creator_id = ?`;
  db.query(sql, [req.params.userId], (err, results) => {
      if (err) return res.status(500).send('Error retrieving events');
      res.json(results);
  });
});
// Update event
app.put('/events/:id', (req, res) => {
  const { title, description, date, location } = req.body;
  const sql = `UPDATE events SET title = ?, description = ?, date = ?, location = ? WHERE id = ?`;
  db.query(sql, [title, description, date, location, req.params.id], (err) => {
      if (err) return res.status(500).send('Error updating event');
      res.send('Event updated successfully');
  });
});

// Delete event
app.delete('/events/:id', (req, res) => {
  const sql = `DELETE FROM events WHERE id = ?`;
  db.query(sql, [req.params.id], (err) => {
      if (err) return res.status(500).send('Error deleting event');
      res.send('Event deleted successfully');
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
