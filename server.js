const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');

// Load environment variables from .env file
dotenv.config();

// Create Express app
const app = express();

// Set up CORS with explicit configuration
app.use(cors({
  origin: ['http://127.0.0.1:5505', 'http://localhost:5505'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

// Parse JSON requests
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname)));

// Database connection
let pool;
if (process.env.DATABASE_URL) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });
}

// API endpoints
app.get('/api/health', async (req, res) => {
    let dbStatus = 'Not connected';
    if (pool) {
        try {
            const client = await pool.connect();
            const result = await client.query('SELECT NOW()');
            client.release();
            dbStatus = result.rows[0] ? 'Connected' : 'Connection error';
        } catch (err) {
            dbStatus = `Error: ${err.message}`;
        }
    }
    
    res.json({
        status: 'OK',
        timestamp: new Date(),
        database: dbStatus
    });
});

// Initialize database tables if needed
app.post('/api/init-tables', async (req, res) => {
    if (!pool) {
        return res.status(500).json({ error: 'No database connection' });
    }
    
    try {
        const client = await pool.connect();
        
        // Create settings table if it doesn't exist
        await client.query(`
            CREATE TABLE IF NOT EXISTS settings (
                id SERIAL PRIMARY KEY,
                name TEXT,
                phone TEXT,
                address TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);
        
        // Insert a default row if there are no settings yet
        await client.query(`
            INSERT INTO settings (id, name, phone, address)
            VALUES (1, 'Elegance Boutique', '', '')
            ON CONFLICT (id) DO NOTHING
        `);
        
        client.release();
        res.json({ success: true, message: 'Tables initialized' });
    } catch (err) {
        console.error('Error initializing tables:', err);
        res.status(500).json({ error: err.message });
    }
});

// Root route - serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    
    if (pool) {
        console.log('Connected to PostgreSQL database');
    } else {
        console.log('No database connection configured');
    }
});