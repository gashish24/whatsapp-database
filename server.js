// server.js - Main server file for WhatsApp Business API Database

const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize SQLite database
const db = new Database('./whatsapp_data.db');
console.log('Connected to SQLite database');
createTables();
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        // Create tables if they don't exist
        createTables();
    }
});

// Create database tables
function createTables() {
    // Table for storing WhatsApp messages
    db.exec(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone_number TEXT NOT NULL,
            message_text TEXT NOT NULL,
            message_type TEXT DEFAULT 'received',
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'pending'
        )
    `);

    // Table for storing user data
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone_number TEXT UNIQUE NOT NULL,
            name TEXT,
            email TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_message_at DATETIME
        )
    `);

    console.log('Database tables created successfully');
}
  

// API Routes

// 1. Store a new message (for incoming WhatsApp messages)
app.post('/api/messages', (req, res) => {
    const { phone_number, message_text, message_type = 'received' } = req.body;
    
    if (!phone_number || !message_text) {
        return res.status(400).json({ error: 'Phone number and message text are required' });
    }

    const query = `
        INSERT INTO messages (phone_number, message_text, message_type)
        VALUES (?, ?, ?)
    `;
    
    db.run(query, [phone_number, message_text, message_type], function(err) {
        if (err) {
            console.error('Error inserting message:', err);
            return res.status(500).json({ error: 'Failed to store message' });
        }
        
        res.json({
            success: true,
            message_id: this.lastID,
            message: 'Message stored successfully'
        });
    });
});

// 2. Get all messages (with optional filtering)
app.get('/api/messages', (req, res) => {
    const { phone_number, limit = 50 } = req.query;
    
    let query = 'SELECT * FROM messages';
    let params = [];
    
    if (phone_number) {
        query += ' WHERE phone_number = ?';
        params.push(phone_number);
    }
    
    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(parseInt(limit));
    
    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Error fetching messages:', err);
            return res.status(500).json({ error: 'Failed to fetch messages' });
        }
        
        res.json({
            success: true,
            messages: rows,
            count: rows.length
        });
    });
});

// 3. Get a specific message by ID
app.get('/api/messages/:id', (req, res) => {
    const { id } = req.params;
    
    const query = 'SELECT * FROM messages WHERE id = ?';
    
    db.get(query, [id], (err, row) => {
        if (err) {
            console.error('Error fetching message:', err);
            return res.status(500).json({ error: 'Failed to fetch message' });
        }
        
        if (!row) {
            return res.status(404).json({ error: 'Message not found' });
        }
        
        res.json({
            success: true,
            message: row
        });
    });
});

// 4. Store/Update user information
app.post('/api/users', (req, res) => {
    const { phone_number, name, email } = req.body;
    
    if (!phone_number) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    const query = `
        INSERT INTO users (phone_number, name, email)
        VALUES (?, ?, ?)
        ON CONFLICT(phone_number) DO UPDATE SET
            name = COALESCE(?, name),
            email = COALESCE(?, email),
            last_message_at = CURRENT_TIMESTAMP
    `;
    
    db.run(query, [phone_number, name, email, name, email], function(err) {
        if (err) {
            console.error('Error storing user:', err);
            return res.status(500).json({ error: 'Failed to store user' });
        }
        
        res.json({
            success: true,
            user_id: this.lastID,
            message: 'User stored successfully'
        });
    });
});

// 5. Get user information
app.get('/api/users/:phone_number', (req, res) => {
    const { phone_number } = req.params;
    
    const query = 'SELECT * FROM users WHERE phone_number = ?';
    
    db.get(query, [phone_number], (err, row) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ error: 'Failed to fetch user' });
        }
        
        if (!row) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({
            success: true,
            user: row
        });
    });
});

// 6. Get all users
app.get('/api/users', (req, res) => {
    const query = 'SELECT * FROM users ORDER BY created_at DESC';
    
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ error: 'Failed to fetch users' });
        }
        
        res.json({
            success: true,
            users: rows,
            count: rows.length
        });
    });
});

// 7. Update message status (useful for tracking delivery)
app.put('/api/messages/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
        return res.status(400).json({ error: 'Status is required' });
    }
    
    const query = 'UPDATE messages SET status = ? WHERE id = ?';
    
    db.run(query, [status, id], function(err) {
        if (err) {
            console.error('Error updating message status:', err);
            return res.status(500).json({ error: 'Failed to update message status' });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }
        
        res.json({
            success: true,
            message: 'Message status updated successfully'
        });
    });
});

// WhatsApp Business API webhook endpoint
app.post('/webhook/whatsapp', (req, res) => {
    console.log('WhatsApp webhook received:', req.body);
    
    // This is where you'll handle incoming WhatsApp messages
    // The exact structure depends on your WhatsApp Business API provider
    
    try {
        // Example: Extract message data (adjust based on your provider's format)
        const { messages } = req.body;
        
        if (messages && messages.length > 0) {
            messages.forEach(message => {
                const { from, text, type } = message;
                
                // Store the message in database
                const query = `
                    INSERT INTO messages (phone_number, message_text, message_type)
                    VALUES (?, ?, ?)
                `;
                
                db.run(query, [from, text?.body || 'Non-text message', 'received'], (err) => {
                    if (err) {
                        console.error('Error storing WhatsApp message:', err);
                    }
                });
            });
        }
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error processing WhatsApp webhook:', error);
        res.status(500).json({ error: 'Failed to process webhook' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`API Documentation available at: http://localhost:${PORT}/api/docs`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});

// Export for testing
module.exports = app;
