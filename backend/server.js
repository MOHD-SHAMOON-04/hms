require('dotenv').config();
const express = require('express');
const signupRoutes = require('./routes/signup');
const loginRoutes = require('./routes/login');
// const { sign } = require('jsonwebtoken');
const db = require('./db');
const cors = require('cors');
const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.get('/api', (req, res) => {
    res.send('Welcome to the Hostel Management System API!');
});

app.use(express.json());
app.use(cors({ origin: FRONTEND_URL }));
app.use('/api/signup', signupRoutes);
app.use('/api/login', loginRoutes);

app.post('/api/query', (req, res) => {
    const { query } = req.body;
    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }
    db.all(query, [], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(row);
    });
    console.log(`Executing query: ${query}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on localhost:${PORT}`));
